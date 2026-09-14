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
    list_display = ('email', 'display_name_column', 'role', 'email_verified', 'onboarding_completed', 'is_active', 'date_joined')
    list_filter = ('role', 'email_verified', 'onboarding_completed', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'organization')
    ordering = ('-date_joined',)
    list_per_page = 25

    @admin.display(description='Name', ordering='first_name')
    def display_name_column(self, obj):
        return obj.display_name
