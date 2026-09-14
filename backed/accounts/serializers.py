from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils import timezone

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id','username','email','first_name','last_name','name','role','headline','organization','avatar_url','date_joined',
            'learning_goal','learner_level','onboarding_completed','email_verified','notification_preferences','terms_accepted_at','terms_version'
        ]
        read_only_fields = ['id','username','role','date_joined','email_verified','terms_accepted_at','terms_version']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    accepted_terms = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = ['email','password','first_name','last_name','accepted_terms']

    def validate_email(self, value):
        return value.strip().lower()

    def validate_accepted_terms(self, value):
        if not value:
            raise serializers.ValidationError('You must accept the Terms of Use and Privacy Policy.')
        return value

    def create(self, validated_data):
        email = validated_data.pop('email').lower()
        validated_data.pop('accepted_terms', None)
        base = email.split('@')[0].replace('.', '').replace('+', '')[:22] or 'learner'
        username = base
        i = 1
        while User.objects.filter(username=username).exists():
            i += 1
            username = f'{base}{i}'
        return User.objects.create_user(username=username, email=email, terms_accepted_at=timezone.now(), terms_version='2026-09', **validated_data)
