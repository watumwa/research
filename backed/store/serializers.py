from pathlib import Path

from rest_framework import serializers
from .models import Material, StorePayment, StorePayout


class PublicMaterialSerializer(serializers.ModelSerializer):
    downloads = serializers.IntegerField(source='download_count', read_only=True)
    type = serializers.CharField(source='file_type', read_only=True)
    has_file = serializers.SerializerMethodField()
    playback_url = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'slug', 'category', 'description', 'content_type',
            'type', 'access', 'price', 'currency', 'cover_image', 'downloads',
            'is_published', 'has_file', 'playback_url', 'updated_at'
        ]

    def get_has_file(self, obj):
        return bool(obj.file)

    def get_playback_url(self, obj):
        if obj.content_type != Material.ContentType.VIDEO or obj.access != Material.Access.FREE:
            return ''
        if obj.video_url:
            return obj.video_url
        if not obj.file:
            return ''
        request = self.context.get('request')
        path = f'/api/store/materials/{obj.slug}/download/'
        return request.build_absolute_uri(path) if request else path


class AdminMaterialSerializer(serializers.ModelSerializer):
    downloads = serializers.IntegerField(source='download_count', read_only=True)
    type = serializers.CharField(source='file_type', required=False)
    published = serializers.BooleanField(source='is_published', required=False)
    file_name = serializers.SerializerMethodField()
    cover_name = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'slug', 'category', 'description', 'content_type',
            'type', 'access', 'price', 'currency', 'file', 'file_name',
            'cover_image', 'cover_name', 'video_url', 'downloads', 'published',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'downloads', 'file_name', 'cover_name', 'created_at', 'updated_at']
        extra_kwargs = {
            'file': {'required': False, 'allow_null': True},
            'cover_image': {'required': False, 'allow_null': True},
        }

    def get_file_name(self, obj):
        return obj.file.name.rsplit('/', 1)[-1] if obj.file else ''

    def get_cover_name(self, obj):
        return obj.cover_image.name.rsplit('/', 1)[-1] if obj.cover_image else ''

    def validate_cover_image(self, value):
        if not value:
            return value
        extension = Path(value.name).suffix.lower()
        if extension not in {'.jpg', '.jpeg', '.png', '.webp'}:
            raise serializers.ValidationError('Use a JPG, PNG or WebP cover image.')
        content_type = getattr(value, 'content_type', '')
        if content_type and content_type not in {'image/jpeg', 'image/png', 'image/webp'}:
            raise serializers.ValidationError('The cover must be a JPG, PNG or WebP image.')
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('The cover image must be 5 MB or smaller.')
        return value

    def validate(self, attrs):
        access = attrs.get('access', getattr(self.instance, 'access', Material.Access.FREE))
        price = attrs.get('price', getattr(self.instance, 'price', 0))
        content_type = attrs.get('content_type', getattr(self.instance, 'content_type', Material.ContentType.DOCUMENT))
        uploaded_file = attrs.get('file', getattr(self.instance, 'file', None))
        video_url = attrs.get('video_url', getattr(self.instance, 'video_url', ''))
        is_published = attrs.get('is_published', getattr(self.instance, 'is_published', True))
        if access == Material.Access.PAID and (price is None or price <= 0):
            raise serializers.ValidationError({'price': 'Paid materials must have a price greater than zero.'})
        if access == Material.Access.FREE:
            attrs['price'] = 0
        if content_type == Material.ContentType.VIDEO:
            if is_published and not uploaded_file and not video_url:
                raise serializers.ValidationError({'file': 'Upload a video or add a video link before publishing.'})
            attrs.setdefault('file_type', 'VIDEO')
        return attrs


class StorePaymentSerializer(serializers.ModelSerializer):
    material_title = serializers.CharField(source='material.title', read_only=True)
    material_slug = serializers.CharField(source='material.slug', read_only=True)

    class Meta:
        model = StorePayment
        fields = [
            'id', 'material_title', 'material_slug', 'customer_name', 'customer_email',
            'customer_phone', 'network', 'amount', 'currency', 'provider', 'tx_ref',
            'flutterwave_transaction_id', 'flw_ref', 'status', 'created_at', 'paid_at'
        ]


class StorePayoutSerializer(serializers.ModelSerializer):
    payment_tx_ref = serializers.CharField(source='payment.tx_ref', read_only=True)
    customer_email = serializers.CharField(source='payment.customer_email', read_only=True)
    material_title = serializers.CharField(source='payment.material.title', read_only=True)

    class Meta:
        model = StorePayout
        fields = [
            'id', 'payment', 'payment_tx_ref', 'customer_email', 'material_title',
            'destination_number', 'destination_bank_code', 'beneficiary_name',
            'amount', 'currency', 'reference', 'flutterwave_transfer_id', 'status',
            'created_at', 'initiated_at', 'completed_at'
        ]
        read_only_fields = fields
