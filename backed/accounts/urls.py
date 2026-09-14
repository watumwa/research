from django.urls import path
from .views import (
    RegisterView, MeView, PasswordChangeView, PasswordResetRequestView, PasswordResetConfirmView,
    EmailVerificationConfirmView, EmailVerificationResendView, GoogleAuthView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('verify-email/', EmailVerificationConfirmView.as_view(), name='verify-email'),
    path('verify-email/resend/', EmailVerificationResendView.as_view(), name='verify-email-resend'),
]
