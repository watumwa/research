from django.urls import path
from .views import (
    CourseListView, CourseDetailView, LessonDetailView, LessonProgressView, LessonPracticeView, QuizAttemptView,
    ResourceListView, ResourceDetailView, BuilderDraftView, PaymentListCreateView,
    SubmitPaymentReferenceView, TestConfirmPaymentView, EntitlementListView, DashboardView,
    NotificationListView, NotificationMarkReadView, GlobalSearchView,
    ContactMessageView, AdminOverviewView, AdminUsersView, AdminUserStatusView,
    AdminPaymentsView, AdminApprovePaymentView
)

urlpatterns = [
    path('courses/', CourseListView.as_view(), name='courses'),
    path('courses/<slug:slug>/', CourseDetailView.as_view(), name='course-detail'),
    path('lessons/<slug:slug>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<slug:slug>/progress/', LessonProgressView.as_view(), name='lesson-progress'),
    path('lessons/<slug:slug>/practice/', LessonPracticeView.as_view(), name='lesson-practice'),
    path('quiz-attempts/', QuizAttemptView.as_view(), name='quiz-attempt'),
    path('resources/', ResourceListView.as_view(), name='resources'),
    path('resources/<slug:slug>/', ResourceDetailView.as_view(), name='resource-detail'),
    path('builders/<slug:builder_type>/', BuilderDraftView.as_view(), name='builder-draft'),
    path('payments/', PaymentListCreateView.as_view(), name='payments'),
    path('payments/<uuid:payment_id>/submit-reference/', SubmitPaymentReferenceView.as_view(), name='payment-submit-reference'),
    path('payments/<uuid:payment_id>/test-confirm/', TestConfirmPaymentView.as_view(), name='payment-test-confirm'),
    path('entitlements/', EntitlementListView.as_view(), name='entitlements'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/read/', NotificationMarkReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:notification_id>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('contact/', ContactMessageView.as_view(), name='contact'),
    path('platform-admin/overview/', AdminOverviewView.as_view(), name='admin-overview'),
    path('platform-admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('platform-admin/users/<int:user_id>/status/', AdminUserStatusView.as_view(), name='admin-user-status'),
    path('platform-admin/payments/', AdminPaymentsView.as_view(), name='admin-payments'),
    path('platform-admin/payments/<uuid:payment_id>/approve/', AdminApprovePaymentView.as_view(), name='admin-approve-payment'),
]
