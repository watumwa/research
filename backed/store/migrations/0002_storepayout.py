import uuid
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('store', '0001_initial')]
    operations = [
        migrations.CreateModel(
            name='StorePayout',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('destination_number', models.CharField(max_length=20)),
                ('destination_bank_code', models.CharField(default='MPS', max_length=20)),
                ('beneficiary_name', models.CharField(default='Research Skills Payout', max_length=180)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('currency', models.CharField(default='UGX', max_length=8)),
                ('reference', models.CharField(max_length=80, unique=True)),
                ('flutterwave_transfer_id', models.CharField(blank=True, max_length=80)),
                ('status', models.CharField(choices=[('queued', 'Queued'), ('processing', 'Processing'), ('successful', 'Successful'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='queued', max_length=20)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('initiated_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('payment', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name='payout', to='store.storepayment')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
