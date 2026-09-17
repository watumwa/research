from django.conf import settings
from django.db.models import Count, F, Sum
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from learning.permissions import IsEditorOrAdmin
from .flutterwave import (
    FlutterwaveError, generate_tx_ref, initiate_uganda_mobile_money,
    normalize_ugandan_phone, transaction_matches, verify_by_reference,
)
from .models import Material, StorePayment
from .serializers import AdminMaterialSerializer, PublicMaterialSerializer, StorePaymentSerializer


def unique_slug_for_material(title, instance=None):
    base = slugify(title)[:44] or 'material'
    slug = base
    index = 2
    qs = Material.objects.all()
    if instance:
        qs = qs.exclude(pk=instance.pk)
    while qs.filter(slug=slug).exists():
        slug = f'{base[:40]}-{index}'
        index += 1
    return slug


def verify_and_update(payment):
    if payment.status == StorePayment.Status.PAID:
        return payment
    body = verify_by_reference(payment.tx_ref)
    data = body.get('data') or {}
    if transaction_matches(payment, data):
        payment.mark_paid(
            transaction_id=data.get('id', ''),
            flw_ref=data.get('flw_ref', ''),
            metadata={'verification': data},
        )
    elif str(data.get('status', '')).lower() in {'failed', 'cancelled'}:
        payment.status = StorePayment.Status.FAILED
        payment.metadata = {**(payment.metadata or {}), 'verification': data}
        payment.save(update_fields=['status', 'metadata', 'updated_at'])
    return payment


class PublicMaterialListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicMaterialSerializer
    pagination_class = None
    queryset = Material.objects.filter(is_published=True).order_by('order', '-created_at')


class FreeMaterialDownloadView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        material = get_object_or_404(Material, slug=slug, is_published=True, access=Material.Access.FREE)
        if not material.file:
            return Response({'detail': 'The downloadable file has not been uploaded yet.'}, status=404)
        Material.objects.filter(pk=material.pk).update(download_count=F('download_count') + 1)
        handle = material.file.open('rb')
        return FileResponse(handle, as_attachment=True, filename=material.file.name.rsplit('/', 1)[-1])


class InitiateStorePaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        material = get_object_or_404(
            Material,
            slug=str(request.data.get('material_slug', '')).strip(),
            is_published=True,
            access=Material.Access.PAID,
        )
        name = str(request.data.get('name', '')).strip()
        email = str(request.data.get('email', '')).strip().lower()
        network = str(request.data.get('network', '')).strip().upper()
        if len(name) < 2:
            return Response({'detail': 'Enter the customer name.'}, status=400)
        if '@' not in email:
            return Response({'detail': 'Enter a valid email address.'}, status=400)
        if network not in {'MTN', 'AIRTEL'}:
            return Response({'detail': 'Choose MTN or Airtel.'}, status=400)
        try:
            phone = normalize_ugandan_phone(request.data.get('phone'))
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=400)

        payment = StorePayment.objects.create(
            material=material,
            customer_name=name[:180],
            customer_email=email,
            customer_phone=phone,
            network=network,
            amount=material.price,
            currency=material.currency,
            tx_ref=generate_tx_ref(),
            metadata={'client_ip': request.META.get('REMOTE_ADDR', '')},
        )
        try:
            body = initiate_uganda_mobile_money(payment)
        except FlutterwaveError as exc:
            payment.status = StorePayment.Status.FAILED
            payment.metadata = {**(payment.metadata or {}), 'initiation_error': str(exc)}
            payment.save(update_fields=['status', 'metadata', 'updated_at'])
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        data = body.get('data') or {}
        if data.get('id'):
            payment.flutterwave_transaction_id = str(data['id'])[:80]
        if data.get('flw_ref'):
            payment.flw_ref = str(data['flw_ref'])[:180]
        payment.metadata = {**(payment.metadata or {}), 'initiation': body}
        payment.save(update_fields=['flutterwave_transaction_id', 'flw_ref', 'metadata', 'updated_at'])
        authorization = (body.get('meta') or {}).get('authorization') or {}
        return Response({
            'payment_id': payment.id,
            'tx_ref': payment.tx_ref,
            'status': payment.status,
            'amount': payment.amount,
            'currency': payment.currency,
            'phone': payment.customer_phone,
            'network': payment.network,
            'message': body.get('message', 'Charge initiated'),
            'authorization_mode': authorization.get('mode', ''),
            'redirect_url': authorization.get('redirect', ''),
        }, status=201)


class StorePaymentStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, payment_id):
        payment = get_object_or_404(StorePayment.objects.select_related('material'), id=payment_id)
        if payment.status == StorePayment.Status.PENDING:
            try:
                verify_and_update(payment)
            except FlutterwaveError:
                pass
        response = {
            'payment_id': payment.id,
            'status': payment.status,
            'tx_ref': payment.tx_ref,
            'amount': payment.amount,
            'currency': payment.currency,
            'material': PublicMaterialSerializer(payment.material).data,
        }
        if payment.status == StorePayment.Status.PAID:
            response['download_url'] = request.build_absolute_uri(
                f'/api/store/payments/{payment.id}/download/?token={payment.download_token}'
            )
        return Response(response)


class PaidMaterialDownloadView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, payment_id):
        payment = get_object_or_404(StorePayment.objects.select_related('material'), id=payment_id)
        token = str(request.query_params.get('token', '')).strip()
        if payment.status != StorePayment.Status.PAID or token != str(payment.download_token):
            return Response({'detail': 'This paid download link is invalid or not yet active.'}, status=403)
        material = payment.material
        if not material.file:
            return Response({'detail': 'Payment is confirmed, but the downloadable file has not been uploaded yet.'}, status=404)
        Material.objects.filter(pk=material.pk).update(download_count=F('download_count') + 1)
        handle = material.file.open('rb')
        return FileResponse(handle, as_attachment=True, filename=material.file.name.rsplit('/', 1)[-1])


class FlutterwaveWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        expected = settings.FLW_SECRET_HASH.strip()
        received = request.headers.get('verif-hash', '')
        if not expected or received != expected:
            return Response(status=401)
        payload = request.data if isinstance(request.data, dict) else {}
        data = payload.get('data') or {}
        tx_ref = str(data.get('tx_ref', '')).strip()
        if not tx_ref:
            return Response(status=200)
        payment = StorePayment.objects.filter(tx_ref=tx_ref).first()
        if not payment:
            return Response(status=200)
        payment.metadata = {**(payment.metadata or {}), 'webhook': payload}
        payment.save(update_fields=['metadata', 'updated_at'])
        if str(data.get('status', '')).lower() == 'successful':
            try:
                verify_and_update(payment)
            except FlutterwaveError:
                pass
        elif str(data.get('status', '')).lower() in {'failed', 'cancelled'} and payment.status != StorePayment.Status.PAID:
            payment.status = StorePayment.Status.FAILED
            payment.save(update_fields=['status', 'updated_at'])
        return Response(status=200)


class AdminMaterialListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsEditorOrAdmin]
    serializer_class = AdminMaterialSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = None
    queryset = Material.objects.all().order_by('order', '-created_at')

    def perform_create(self, serializer):
        serializer.save(slug=unique_slug_for_material(serializer.validated_data['title']))


class AdminMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsEditorOrAdmin]
    serializer_class = AdminMaterialSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Material.objects.all()

    def perform_update(self, serializer):
        title = serializer.validated_data.get('title', serializer.instance.title)
        serializer.save(slug=unique_slug_for_material(title, serializer.instance))


class AdminStoreOverviewView(APIView):
    permission_classes = [IsEditorOrAdmin]

    def get(self, request):
        paid = StorePayment.objects.filter(status=StorePayment.Status.PAID)
        revenue = paid.aggregate(total=Sum('amount'))['total'] or 0
        statuses = {row['status']: row['count'] for row in StorePayment.objects.values('status').annotate(count=Count('id'))}
        return Response({
            'total_materials': Material.objects.count(),
            'published_materials': Material.objects.filter(is_published=True).count(),
            'paid_materials': Material.objects.filter(access=Material.Access.PAID).count(),
            'total_downloads': Material.objects.aggregate(total=Sum('download_count'))['total'] or 0,
            'successful_sales': paid.count(),
            'revenue': revenue,
            'currency': 'UGX',
            'payment_statuses': statuses,
        })


class AdminStorePaymentListView(generics.ListAPIView):
    permission_classes = [IsEditorOrAdmin]
    serializer_class = StorePaymentSerializer
    pagination_class = None

    def get_queryset(self):
        qs = StorePayment.objects.select_related('material').order_by('-created_at')
        status_q = str(self.request.query_params.get('status', '')).strip()
        if status_q:
            qs = qs.filter(status=status_q)
        return qs[:250]
