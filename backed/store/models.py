import uuid
from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Material(TimeStampedModel):
    class Access(models.TextChoices):
        FREE = 'free', 'Free'
        PAID = 'paid', 'Paid'

    title = models.CharField(max_length=220)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=120, blank=True)
    description = models.TextField()
    file_type = models.CharField(max_length=20, default='PDF')
    access = models.CharField(max_length=12, choices=Access.choices, default=Access.FREE)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default='UGX')
    file = models.FileField(upload_to='materials/%Y/%m/', blank=True)
    download_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class StorePayment(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    material = models.ForeignKey(Material, related_name='store_payments', on_delete=models.PROTECT)
    customer_name = models.CharField(max_length=180)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=40)
    network = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='UGX')
    provider = models.CharField(max_length=40, default='flutterwave')
    tx_ref = models.CharField(max_length=180, unique=True)
    flutterwave_transaction_id = models.CharField(max_length=80, blank=True)
    flw_ref = models.CharField(max_length=180, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    metadata = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    download_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        ordering = ['-created_at']

    def mark_paid(self, *, transaction_id='', flw_ref='', metadata=None):
        if self.status == self.Status.PAID:
            return self
        self.status = self.Status.PAID
        self.paid_at = timezone.now()
        if transaction_id:
            self.flutterwave_transaction_id = str(transaction_id)[:80]
        if flw_ref:
            self.flw_ref = str(flw_ref)[:180]
        if metadata:
            self.metadata = {**(self.metadata or {}), **metadata}
        self.save(update_fields=[
            'status', 'paid_at', 'flutterwave_transaction_id', 'flw_ref', 'metadata', 'updated_at'
        ])
        return self

    def __str__(self):
        return f'{self.customer_email} · {self.material.title} · {self.amount} {self.currency} · {self.status}'
