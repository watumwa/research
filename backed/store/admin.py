from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Material, StorePayment, StorePayout


@admin.register(Material)
class MaterialAdmin(ModelAdmin):
    list_display = ('title', 'category', 'access', 'price', 'currency', 'download_count', 'is_published', 'updated_at')
    list_filter = ('access', 'is_published', 'category', 'currency')
    search_fields = ('title', 'description', 'category', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('order', '-updated_at')


@admin.register(StorePayment)
class StorePaymentAdmin(ModelAdmin):
    list_display = ('id', 'customer_email', 'material', 'network', 'amount', 'currency', 'status', 'created_at', 'paid_at')
    list_filter = ('status', 'network', 'currency')
    search_fields = ('customer_email', 'customer_phone', 'customer_name', 'tx_ref', 'flw_ref', 'material__title')
    readonly_fields = ('id', 'tx_ref', 'flutterwave_transaction_id', 'flw_ref', 'download_token', 'metadata', 'created_at', 'updated_at', 'paid_at')
    ordering = ('-created_at',)


@admin.register(StorePayout)
class StorePayoutAdmin(ModelAdmin):
    list_display = ('reference', 'payment', 'destination_number', 'amount', 'currency', 'status', 'initiated_at', 'completed_at')
    list_filter = ('status', 'currency', 'destination_bank_code')
    search_fields = ('reference', 'destination_number', 'flutterwave_transfer_id', 'payment__tx_ref', 'payment__customer_email')
    readonly_fields = ('id', 'payment', 'destination_number', 'destination_bank_code', 'beneficiary_name', 'amount', 'currency', 'reference', 'flutterwave_transfer_id', 'status', 'metadata', 'created_at', 'updated_at', 'initiated_at', 'completed_at')
    ordering = ('-created_at',)
