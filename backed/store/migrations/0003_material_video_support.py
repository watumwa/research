from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('store', '0002_storepayout')]

    operations = [
        migrations.AddField(
            model_name='material',
            name='content_type',
            field=models.CharField(
                choices=[('document', 'Document'), ('video', 'Video')],
                default='document',
                max_length=12,
            ),
        ),
        migrations.AddField(
            model_name='material',
            name='video_url',
            field=models.URLField(blank=True),
        ),
    ]
