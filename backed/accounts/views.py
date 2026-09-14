from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

User = get_user_model()


def send_verification_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"
    send_mail(
        'Verify your Research Skills email',
        f'Confirm your email address using this link: {link}',
        None,
        [user.email],
        fail_silently=True,
    )


def welcome_notification(user):
    try:
        from learning.models import Notification
        Notification.objects.get_or_create(
            user=user,
            title='Welcome to your learning space',
            defaults={
                'message':'Start with one lesson. Your progress, practice and builder drafts will be saved here.',
                'kind':'learning',
                'link':'/dashboard'
            }
        )
    except Exception:
        pass


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    def validate(self, attrs):
        attrs['email'] = attrs.get('email', '').strip().lower()
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_verification_email(user)
        welcome_notification(user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        if not request.user.has_usable_password():
            return Response({'detail':'This account uses Google sign-in. Use password reset to create a password first.'}, status=400)
        if not request.user.check_password(old_password):
            return Response({'detail': 'Current password is incorrect.'}, status=400)
        if len(new_password) < 8:
            return Response({'detail': 'New password must be at least 8 characters.'}, status=400)
        request.user.set_password(new_password)
        request.user.save(update_fields=['password'])
        return Response({'detail': 'Password changed successfully.'})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            send_mail(
                'Reset your Research Skills password',
                f'Use this link to set a new password: {link}',
                None,
                [user.email],
                fail_silently=True,
            )
        return Response({'detail': 'If an account exists for that email, password-reset instructions have been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        uid = str(request.data.get('uid', ''))
        token = str(request.data.get('token', ''))
        password = str(request.data.get('password', ''))
        if len(password) < 8:
            return Response({'detail': 'Password must be at least 8 characters.'}, status=400)
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail': 'This reset link is invalid.'}, status=400)
        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'This reset link is invalid or has expired.'}, status=400)
        user.set_password(password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Password reset successfully. You can now sign in.'})


class EmailVerificationConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        uid = str(request.data.get('uid',''))
        token = str(request.data.get('token',''))
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail':'This verification link is invalid.'}, status=400)
        if user.email_verified:
            return Response({'detail':'Your email is already verified.'})
        if not default_token_generator.check_token(user, token):
            return Response({'detail':'This verification link is invalid or has expired.'}, status=400)
        user.email_verified = True
        user.save(update_fields=['email_verified'])
        welcome_notification(user)
        return Response({'detail':'Email verified successfully.'})


class EmailVerificationResendView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        if request.user.email_verified:
            return Response({'detail':'Your email is already verified.'})
        send_verification_email(request.user)
        return Response({'detail':'A new verification email has been sent.'})


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        credential = str(request.data.get('credential', '')).strip()
        accepted_terms = bool(request.data.get('accepted_terms', False))
        if not credential:
            return Response({'detail': 'Google credential is required.'}, status=400)
        client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '').strip()
        if not client_id:
            return Response({'detail': 'Google sign-in is not configured on the server.'}, status=503)
        try:
            payload = google_id_token.verify_oauth2_token(credential, google_requests.Request(), client_id)
        except Exception:
            return Response({'detail': 'Google could not verify this sign-in. Please try again.'}, status=400)
        email = str(payload.get('email', '')).strip().lower()
        if not email or not payload.get('email_verified'):
            return Response({'detail': 'A verified Google email address is required.'}, status=400)
        user = User.objects.filter(email__iexact=email).first()
        created = False
        if not user:
            if not accepted_terms:
                return Response({'detail':'Please accept the Terms of Use and Privacy Policy before creating an account.'}, status=400)
            base = email.split('@')[0].replace('.', '').replace('+', '')[:22] or 'learner'
            username = base
            i = 1
            while User.objects.filter(username=username).exists():
                i += 1
                username = f'{base}{i}'
            user = User(
                username=username,
                email=email,
                first_name=str(payload.get('given_name', ''))[:150],
                last_name=str(payload.get('family_name', ''))[:150],
                avatar_url=str(payload.get('picture', ''))[:200],
                email_verified=True,
                terms_accepted_at=timezone.now(),
                terms_version='2026-09',
            )
            user.set_unusable_password()
            user.save()
            created = True
            welcome_notification(user)
        else:
            changed = []
            if not user.first_name and payload.get('given_name'):
                user.first_name = str(payload['given_name'])[:150]; changed.append('first_name')
            if not user.last_name and payload.get('family_name'):
                user.last_name = str(payload['family_name'])[:150]; changed.append('last_name')
            if not user.avatar_url and payload.get('picture'):
                user.avatar_url = str(payload['picture'])[:200]; changed.append('avatar_url')
            if not user.email_verified:
                user.email_verified = True; changed.append('email_verified')
            if changed:
                user.save(update_fields=changed)
        if not user.is_active:
            return Response({'detail': 'This account is inactive.'}, status=403)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'created': created,
        })
