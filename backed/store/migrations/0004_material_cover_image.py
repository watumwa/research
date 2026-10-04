from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('store', '0003_material_video_support')]

    operations = [
        migrations.AddField(
            model_name='material',
            name='cover_image',
            field=models.FileField(blank=True, upload_to='materials/covers/%Y/%m/'),
        ),
    ]
