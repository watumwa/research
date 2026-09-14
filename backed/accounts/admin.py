from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Platform profile', {'fields': (
            'role','headline','organization','avatar_url','learning_goal','learner_level',
            'onboarding_completed','email_verified','notification_preferences','terms_accepted_at','terms_version'
        )}),
    )
    list_display = ('username','email','first_name','last_name','role','email_verified','onboarding_completed','is_active')
    list_filter = ('role','email_verified','onboarding_completed','is_staff','is_active')
