from rest_framework import serializers
from .models import Material, StorePayment


class PublicMaterialSerializer(serializers.ModelSerializer):
    downloads = serializers.IntegerField(source='download_count', read_only=True)
    type = serializers.CharField(source='file_type', read_only=True)
    has_file = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'slug', 'category', 'description', 'type', 'access',
            'price', 'currency', 'downloads', 'is_published', 'has_file', 'updated_at'
        ]

    def get_has_file(self, obj):
        return bool(obj.file)


class AdminMaterialSerializer(serializers.ModelSerializer):
    downloads = serializers.IntegerField(source='download_count', read_only=True)
    type = serializers.CharField(source='file_type', required=False)
    published = serializers.BooleanField(source='is_published', required=False)
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'slug', 'category', 'description', 'type', 'access',
            'price', 'currency', 'file', 'file_name', 'downloads', 'published',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'downloads', 'file_name', 'created_at', 'updated_at']
        extra_kwargs = {'file': {'required': False, 'allow_null': True}}

    def get_file_name(self, obj):
        return obj.file.name.rsplit('/', 1)[-1] if obj.file else ''

    def validate(self, attrs):
        access = attrs.get('access', getattr(self.instance, 'access', Material.Access.FREE))
        price = attrs.get('price', getattr(self.instance, 'price', 0))
        if access == Material.Access.PAID and (price is None or price <= 0):
            raise serializers.ValidationError({'price': 'Paid materials must have a price greater than zero.'})
        if access == Material.Access.FREE:
            attrs['price'] = 0
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
