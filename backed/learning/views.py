from decimal import Decimal
from django.contrib.auth import get_user_model
from django.db.models import Q, Sum, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (
    Course, Lesson, Resource, Entitlement, LessonProgress, QuizAttempt, BuilderDraft,
    Payment, ContactMessage, LessonPractice, Notification
)
from .serializers import (
    CourseSerializer, LessonDetailSerializer, ResourceSerializer, LessonProgressSerializer,
    QuizAttemptSerializer, BuilderDraftSerializer, PaymentSerializer, EntitlementSerializer,
    ContactMessageSerializer, AdminUserSerializer, LessonPracticeSerializer, NotificationSerializer
)
from .access import has_lesson_access, has_resource_access
from .permissions import IsPlatformAdmin
from .services import mark_payment_paid

User = get_user_model()


def notify_once(user, title, message, kind='info', link=''):
    prefs = getattr(user, 'notification_preferences', {}) or {}
    if kind == 'learning' and prefs.get('in_app', True) is False:
        return None
    obj = Notification.objects.filter(user=user, title=title, link=link).first()
    if obj:
        return obj
    return Notification.objects.create(user=user, title=title, message=message, kind=kind, link=link)


class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    def get_queryset(self):
        return Course.objects.filter(is_published=True).order_by('order','id').prefetch_related('modules__lessons')


class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    queryset = Course.objects.filter(is_published=True).prefetch_related('modules__lessons')


class LessonDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, slug):
        lesson = get_object_or_404(Lesson.objects.select_related('module__course'), slug=slug, is_published=True)
        if not has_lesson_access(request.user, lesson):
            resource = Resource.objects.filter(lesson=lesson, is_published=True).first()
            return Response({
                'detail': 'This lesson is locked.',
                'locked': True,
                'resource': ResourceSerializer(resource, context={'request':request}).data if resource else None,
            }, status=status.HTTP_403_FORBIDDEN)
        return Response(LessonDetailSerializer(lesson, context={'request':request}).data)


class LessonProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def put(self, request, slug):
        lesson = get_object_or_404(Lesson.objects.select_related('module__course'), slug=slug, is_published=True)
        if not has_lesson_access(request.user, lesson):
            return Response({'detail':'This lesson is locked.'}, status=403)
        record, _ = LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)
        was_completed = record.completed
        percent = max(0, min(100, int(request.data.get('percent', record.percent))))
        completed = bool(request.data.get('completed', percent >= 100))
        record.percent = 100 if completed else percent
        record.completed = completed
        record.last_position = str(request.data.get('last_position',''))[:120]
        if completed and not record.completed_at:
            record.completed_at = timezone.now()
        if not completed:
            record.completed_at = None
        record.save()

        if completed and not was_completed:
            notify_once(
                request.user,
                'Lesson completed',
                f'You completed “{lesson.title}”. Keep going when you are ready.',
                'learning',
                f'/lessons/{lesson.slug}'
            )
            total_completed = LessonProgress.objects.filter(user=request.user, completed=True).count()
            for target in (1, 5, 10):
                if total_completed >= target:
                    notify_once(
                        request.user,
                        f'{target} lesson{"s" if target != 1 else ""} completed',
                        'A steady learning habit is taking shape. Keep building one step at a time.',
                        'success',
                        '/dashboard'
                    )
            course_lessons = Lesson.objects.filter(module__course=lesson.module.course, is_published=True)
            total = course_lessons.count()
            done = LessonProgress.objects.filter(user=request.user, lesson__in=course_lessons, completed=True).count()
            if total and done == total:
                notify_once(
                    request.user,
                    f'{lesson.module.course.title} completed',
                    'You completed every published lesson in this learning path.',
                    'success',
                    f'/courses/{lesson.module.course.slug}'
                )
        return Response(LessonProgressSerializer(record).data)


class LessonPracticeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, slug):
        lesson = get_object_or_404(Lesson, slug=slug, is_published=True)
        if not has_lesson_access(request.user, lesson):
            return Response({'detail':'This lesson is locked.'}, status=403)
        record, _ = LessonPractice.objects.get_or_create(user=request.user, lesson=lesson, defaults={'answers':{}})
        return Response(LessonPracticeSerializer(record).data)
    def put(self, request, slug):
        lesson = get_object_or_404(Lesson, slug=slug, is_published=True)
        if not has_lesson_access(request.user, lesson):
            return Response({'detail':'This lesson is locked.'}, status=403)
        record, _ = LessonPractice.objects.get_or_create(user=request.user, lesson=lesson, defaults={'answers':{}})
        answers = request.data.get('answers', {})
        if not isinstance(answers, dict):
            return Response({'detail':'Practice answers must be an object.'}, status=400)
        record.answers = answers
        record.save(update_fields=['answers','updated_at'])
        return Response(LessonPracticeSerializer(record).data)


class QuizAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = QuizAttemptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.validated_data['lesson']
        if not has_lesson_access(request.user, lesson):
            return Response({'detail':'This lesson is locked.'}, status=403)
        answers = serializer.validated_data.get('answers', {})
        quiz = lesson.quiz or []
        correct = 0
        for item in quiz:
            qid = str(item.get('id'))
            expected = item.get('answer')
            if qid in answers and answers[qid] == expected:
                correct += 1
        score = Decimal('0.00') if not quiz else Decimal(str(round(correct / len(quiz) * 100, 2)))
        attempt = QuizAttempt.objects.create(user=request.user, lesson=lesson, answers=answers, score=score, passed=score >= 60)
        if attempt.passed:
            notify_once(request.user, 'Knowledge check passed', f'You scored {attempt.score}% in “{lesson.title}”.', 'success', f'/lessons/{lesson.slug}')
        return Response(QuizAttemptSerializer(attempt).data, status=201)


class ResourceListView(generics.ListAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    queryset = Resource.objects.filter(is_published=True).select_related('lesson').order_by('order','id')


class ResourceDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, slug):
        resource = get_object_or_404(Resource.objects.select_related('lesson'), slug=slug, is_published=True)
        data = ResourceSerializer(resource, context={'request':request}).data
        if not has_resource_access(request.user, resource):
            return Response(data)
        if resource.lesson_id:
            data['lesson'] = LessonDetailSerializer(resource.lesson, context={'request':request}).data
        return Response(data)


class BuilderDraftView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, builder_type):
        draft, _ = BuilderDraft.objects.get_or_create(user=request.user, builder_type=builder_type, defaults={'title':'My research draft','data':{}})
        return Response(BuilderDraftSerializer(draft).data)
    def put(self, request, builder_type):
        draft, _ = BuilderDraft.objects.get_or_create(user=request.user, builder_type=builder_type, defaults={'title':'My research draft','data':{}})
        draft.title = request.data.get('title', draft.title)[:180]
        draft.data = request.data.get('data', draft.data)
        draft.version += 1
        draft.save()
        notify_once(request.user, 'Your first builder is saved', 'Your guided draft is saved to your account and can be continued later.', 'learning', '/builder')
        return Response(BuilderDraftSerializer(draft).data)


class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).select_related('resource','course').order_by('-created_at')
    def perform_create(self, serializer):
        payment = serializer.save()
        Notification.objects.create(
            user=self.request.user,
            title='Payment request started',
            message=f'Your payment request for {PaymentSerializer(payment).data["item_title"]} is waiting for completion.',
            kind='payment',
            link='/profile'
        )


class SubmitPaymentReferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id, user=request.user)
        if payment.status == Payment.Status.PAID:
            return Response(PaymentSerializer(payment).data)
        reference = str(request.data.get('provider_reference','')).strip()
        phone = str(request.data.get('customer_phone','')).strip()
        if not reference:
            return Response({'detail':'Enter the transaction/payment reference.'}, status=400)
        if payment.provider in ['mtn_momo','airtel_money'] and len(''.join(ch for ch in phone if ch.isdigit())) < 9:
            return Response({'detail':'Enter a valid mobile money phone number.'}, status=400)
        payment.provider_reference = reference[:180]
        payment.customer_phone = phone[:40]
        payment.status = Payment.Status.SUBMITTED
        payment.save(update_fields=['provider_reference','customer_phone','status','updated_at'])
        Notification.objects.create(
            user=request.user,
            title='Payment submitted',
            message='Your transaction reference was received and is awaiting verification.',
            kind='payment',
            link='/profile'
        )
        return Response(PaymentSerializer(payment).data)


class TestConfirmPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, payment_id):
        from django.conf import settings
        if not settings.DEBUG:
            return Response({'detail':'Test payment confirmation is disabled in production.'}, status=403)
        payment = get_object_or_404(Payment, id=payment_id, user=request.user)
        mark_payment_paid(payment, reference=f'TEST-{str(payment.id)[:8].upper()}')
        return Response(PaymentSerializer(payment).data)


class EntitlementListView(generics.ListAPIView):
    serializer_class = EntitlementSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    def get_queryset(self):
        return Entitlement.objects.filter(user=self.request.user, is_active=True).select_related('resource','course')


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')[:30]


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, notification_id=None):
        qs = Notification.objects.filter(user=request.user)
        if notification_id:
            qs = qs.filter(id=notification_id)
        qs.update(is_read=True)
        return Response({'detail':'Notifications updated.'})


class GlobalSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        q = str(request.query_params.get('q','')).strip()
        if len(q) < 2:
            return Response({'courses':[],'lessons':[],'resources':[],'builders':[]})
        courses = Course.objects.filter(is_published=True).filter(Q(title__icontains=q)|Q(subtitle__icontains=q)|Q(description__icontains=q))[:5]
        lessons = Lesson.objects.filter(is_published=True).select_related('module__course').filter(Q(title__icontains=q)|Q(summary__icontains=q))[:8]
        resources = Resource.objects.filter(is_published=True).filter(Q(title__icontains=q)|Q(summary__icontains=q))[:5]
        builder_defs = [
            {'title':'Research Problem Builder','slug':'research-problem','keywords':'research problem issue gap evidence significance'},
            {'title':'Chapter One Builder','slug':'chapter-one','keywords':'chapter one background problem objectives questions scope significance'},
            {'title':'Literature Review Builder','slug':'literature-review','keywords':'literature review synthesis sources gap themes'},
        ]
        ql=q.lower()
        builders=[{'title':b['title'],'slug':b['slug']} for b in builder_defs if ql in (b['title']+' '+b['keywords']).lower()]
        return Response({
            'courses':[{'title':c.title,'slug':c.slug,'subtitle':c.subtitle} for c in courses],
            'lessons':[{'title':l.title,'slug':l.slug,'course':l.module.course.title,'summary':l.summary} for l in lessons],
            'resources':ResourceSerializer(resources,many=True,context={'request':request}).data,
            'builders':builders[:5],
        })


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        courses = Course.objects.filter(is_published=True).prefetch_related('modules__lessons')
        course_data = CourseSerializer(courses, many=True, context={'request':request}).data
        completed = LessonProgress.objects.filter(user=request.user, completed=True).count()
        started = LessonProgress.objects.filter(user=request.user).count()
        latest = LessonProgress.objects.filter(user=request.user).select_related('lesson__module__course').order_by('-updated_at')[:5]
        recent = [{
            'lesson_title': x.lesson.title,
            'lesson_slug': x.lesson.slug,
            'course_title': x.lesson.module.course.title,
            'percent': x.percent,
            'completed': x.completed,
            'updated_at': x.updated_at,
        } for x in latest]
        latest_builder = BuilderDraft.objects.filter(user=request.user).order_by('-updated_at').first()
        entitlement_count = Entitlement.objects.filter(user=request.user,is_active=True).count()
        pending_payments = Payment.objects.filter(user=request.user,status__in=[Payment.Status.PENDING,Payment.Status.SUBMITTED]).count()
        milestones=[]
        if completed >= 1: milestones.append({'title':'First lesson completed','detail':'You started building a consistent learning record.','icon':'lesson'})
        if completed >= 5: milestones.append({'title':'Five lessons completed','detail':'You are building momentum across the platform.','icon':'progress'})
        if latest_builder: milestones.append({'title':'Builder work saved','detail':f'Your {latest_builder.builder_type.replace("-"," ")} draft is safely stored.','icon':'builder'})
        if entitlement_count: milestones.append({'title':'Premium resource unlocked','detail':'A premium learning resource is available in your account.','icon':'access'})
        recommended_slug = 'business-communication-toolkit' if request.user.learning_goal == 'communication' else 'research-blueprint'
        recommended = next((c for c in course_data if c['slug']==recommended_slug), course_data[0] if course_data else None)
        return Response({
            'courses':course_data,'completed_lessons':completed,'started_lessons':started,'recent_activity':recent,
            'latest_builder':BuilderDraftSerializer(latest_builder).data if latest_builder else None,
            'premium_access_count':entitlement_count,'pending_payments':pending_payments,
            'milestones':milestones[:4],'recommended_course':recommended,
        })


class ContactMessageView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]


class AdminOverviewView(APIView):
    permission_classes = [IsPlatformAdmin]
    def get(self, request):
        revenue = Payment.objects.filter(status=Payment.Status.PAID).aggregate(v=Sum('amount'))['v'] or 0
        payment_statuses = {row['status']:row['count'] for row in Payment.objects.values('status').annotate(count=Count('id'))}
        course_engagement=[]
        for course in Course.objects.filter(is_published=True):
            starts = LessonProgress.objects.filter(lesson__module__course=course).values('user').distinct().count()
            completions = LessonProgress.objects.filter(lesson__module__course=course, completed=True).count()
            course_engagement.append({'title':course.title,'learners':starts,'completed_lessons':completions})
        return Response({
            'users': User.objects.count(),
            'learners': User.objects.filter(role='learner', is_active=True).count(),
            'paid_users': Entitlement.objects.filter(is_active=True).values('user').distinct().count(),
            'courses': Course.objects.filter(is_published=True).count(),
            'lessons': Lesson.objects.filter(is_published=True).count(),
            'completed_lessons': LessonProgress.objects.filter(completed=True).count(),
            'revenue': revenue,
            'currency': 'UGX',
            'pending_payments': Payment.objects.filter(status__in=[Payment.Status.PENDING,Payment.Status.SUBMITTED]).count(),
            'payment_statuses':payment_statuses,
            'course_engagement':course_engagement,
        })


class AdminUsersView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsPlatformAdmin]
    def get_queryset(self):
        qs = User.objects.order_by('-date_joined')
        q = self.request.query_params.get('q','').strip()
        role = self.request.query_params.get('role','').strip()
        active = self.request.query_params.get('active','').strip()
        if q: qs = qs.filter(Q(email__icontains=q)|Q(first_name__icontains=q)|Q(last_name__icontains=q))
        if role: qs = qs.filter(role=role)
        if active in ['true','false']: qs = qs.filter(is_active=(active=='true'))
        return qs


class AdminUserStatusView(APIView):
    permission_classes = [IsPlatformAdmin]
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        if user == request.user:
            return Response({'detail':'You cannot disable your own account from this screen.'}, status=400)
        user.is_active = bool(request.data.get('is_active', True))
        user.save(update_fields=['is_active'])
        return Response(AdminUserSerializer(user).data)


class AdminPaymentsView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsPlatformAdmin]
    def get_queryset(self):
        qs = Payment.objects.select_related('user','resource','course').order_by('-created_at')
        status_q = self.request.query_params.get('status','').strip()
        q = self.request.query_params.get('q','').strip()
        provider = self.request.query_params.get('provider','').strip()
        if status_q: qs = qs.filter(status=status_q)
        if provider: qs = qs.filter(provider=provider)
        if q: qs = qs.filter(Q(user__email__icontains=q)|Q(provider_reference__icontains=q)|Q(resource__title__icontains=q)|Q(course__title__icontains=q))
        return qs


class AdminApprovePaymentView(APIView):
    permission_classes = [IsPlatformAdmin]
    def post(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id)
        reference = request.data.get('provider_reference') or payment.provider_reference
        mark_payment_paid(payment, verified_by=request.user, reference=reference)
        return Response(PaymentSerializer(payment).data)
