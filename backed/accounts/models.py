from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        LEARNER = 'learner', 'Learner'
        EDITOR = 'editor', 'Content Editor'
        ADMIN = 'admin', 'Administrator'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.LEARNER)
    headline = models.CharField(max_length=160, blank=True)
    organization = models.CharField(max_length=160, blank=True)
    avatar_url = models.URLField(blank=True)
    learning_goal = models.CharField(max_length=60, blank=True)
    learner_level = models.CharField(max_length=60, blank=True)
    onboarding_completed = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    notification_preferences = models.JSONField(default=dict, blank=True)
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    terms_version = models.CharField(max_length=32, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        if self.role == self.Role.ADMIN:
            self.is_staff = True
        super().save(*args, **kwargs)

    @property
    def display_name(self):
        name = f'{self.first_name} {self.last_name}'.strip()
        return name or self.username
