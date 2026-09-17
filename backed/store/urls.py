from django.urls import path
from .views import (
    AdminMaterialDetailView, AdminMaterialListCreateView, AdminStoreOverviewView,
    AdminStorePaymentListView, FlutterwaveWebhookView, FreeMaterialDownloadView,
    InitiateStorePaymentView, PaidMaterialDownloadView, PublicMaterialListView,
    StorePaymentStatusView,
)

urlpatterns = [
    path('materials/', PublicMaterialListView.as_view(), name='store-public-materials'),
    path('materials/<slug:slug>/download/', FreeMaterialDownloadView.as_view(), name='store-free-download'),
    path('payments/initiate/', InitiateStorePaymentView.as_view(), name='store-payment-initiate'),
    path('payments/<uuid:payment_id>/status/', StorePaymentStatusView.as_view(), name='store-payment-status'),
    path('payments/<uuid:payment_id>/download/', PaidMaterialDownloadView.as_view(), name='store-paid-download'),
    path('flutterwave/webhook/', FlutterwaveWebhookView.as_view(), name='flutterwave-webhook'),
    path('admin/materials/', AdminMaterialListCreateView.as_view(), name='store-admin-materials'),
    path('admin/materials/<int:pk>/', AdminMaterialDetailView.as_view(), name='store-admin-material-detail'),
    path('admin/overview/', AdminStoreOverviewView.as_view(), name='store-admin-overview'),
    path('admin/payments/', AdminStorePaymentListView.as_view(), name='store-admin-payments'),
]
