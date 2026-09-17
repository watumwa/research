# Generated for the Flutterwave-enabled simple material store.
import uuid
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='Material',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=220)),
                ('slug', models.SlugField(unique=True)),
                ('category', models.CharField(blank=True, max_length=120)),
                ('description', models.TextField()),
                ('file_type', models.CharField(default='PDF', max_length=20)),
                ('access', models.CharField(choices=[('free', 'Free'), ('paid', 'Paid')], default='free', max_length=12)),
                ('price', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('currency', models.CharField(default='UGX', max_length=8)),
                ('file', models.FileField(blank=True, upload_to='materials/%Y/%m/')),
                ('download_count', models.PositiveIntegerField(default=0)),
                ('is_published', models.BooleanField(default=True)),
                ('order', models.PositiveIntegerField(default=0)),
            ],
            options={'ordering': ['order', '-created_at']},
        ),
        migrations.CreateModel(
            name='StorePayment',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('customer_name', models.CharField(max_length=180)),
                ('customer_email', models.EmailField(max_length=254)),
                ('customer_phone', models.CharField(max_length=40)),
                ('network', models.CharField(max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('currency', models.CharField(default='UGX', max_length=8)),
                ('provider', models.CharField(default='flutterwave', max_length=40)),
                ('tx_ref', models.CharField(max_length=180, unique=True)),
                ('flutterwave_transaction_id', models.CharField(blank=True, max_length=80)),
                ('flw_ref', models.CharField(blank=True, max_length=180)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed'), ('refunded', 'Refunded')], default='pending', max_length=20)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('download_token', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('material', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='store_payments', to='store.material')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
