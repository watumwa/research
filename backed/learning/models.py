import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Course(TimeStampedModel):
    class Access(models.TextChoices):
        FREE = 'free', 'Free'
        PAID = 'paid', 'Paid'
        MIXED = 'mixed', 'Mixed'
    title = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    subtitle = models.CharField(max_length=240, blank=True)
    description = models.TextField()
    category = models.CharField(max_length=120, blank=True)
    accent = models.CharField(max_length=32, default='navy')
    access = models.CharField(max_length=20, choices=Access.choices, default=Access.MIXED)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default='UGX')
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    def __str__(self): return self.title

class Module(TimeStampedModel):
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=180)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    class Meta:
        ordering = ['order', 'id']
        constraints = [models.UniqueConstraint(fields=['course','slug'], name='unique_module_slug_per_course')]
    def __str__(self): return f'{self.course.title} · {self.title}'

class Lesson(TimeStampedModel):
    class Kind(models.TextChoices):
        LESSON = 'lesson', 'Lesson'
        INTERACTIVE = 'interactive', 'Interactive lesson'
        BUILDER = 'builder', 'Builder'
        RESOURCE = 'resource', 'Resource'
    module = models.ForeignKey(Module, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=220)
    slug = models.SlugField(unique=True)
    summary = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=10)
    kind = models.CharField(max_length=24, choices=Kind.choices, default=Kind.LESSON)
    is_free = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    content = models.JSONField(default=list, blank=True)
    quiz = models.JSONField(default=list, blank=True)
    references = models.JSONField(default=list, blank=True)
    def __str__(self): return self.title

class Resource(TimeStampedModel):
    class Access(models.TextChoices):
        FREE = 'free', 'Free'
        PAID = 'paid', 'Paid'
    title = models.CharField(max_length=220)
    slug = models.SlugField(unique=True)
    summary = models.TextField()
    access = models.CharField(max_length=20, choices=Access.choices, default=Access.FREE)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default='UGX')
    lesson = models.OneToOneField(Lesson, related_name='resource', on_delete=models.SET_NULL, null=True, blank=True)
    preview = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    def __str__(self): return self.title

class Entitlement(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='entitlements', on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, related_name='entitlements', on_delete=models.CASCADE, null=True, blank=True)
    course = models.ForeignKey(Course, related_name='entitlements', on_delete=models.CASCADE, null=True, blank=True)
    source = models.CharField(max_length=40, default='payment')
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user','resource'], condition=models.Q(resource__isnull=False), name='unique_user_resource_entitlement'),
            models.UniqueConstraint(fields=['user','course'], condition=models.Q(course__isnull=False), name='unique_user_course_entitlement'),
        ]
    def valid(self):
        return self.is_active and (self.expires_at is None or self.expires_at > timezone.now())

class LessonProgress(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lesson_progress', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='progress_records', on_delete=models.CASCADE)
    percent = models.PositiveSmallIntegerField(default=0)
    completed = models.BooleanField(default=False)
    last_position = models.CharField(max_length=120, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['user','lesson'], name='unique_user_lesson_progress')]


class LessonPractice(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lesson_practice', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='practice_records', on_delete=models.CASCADE)
    answers = models.JSONField(default=dict, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['user','lesson'], name='unique_user_lesson_practice')]

class Notification(TimeStampedModel):
    class Kind(models.TextChoices):
        INFO = 'info', 'Information'
        SUCCESS = 'success', 'Success'
        PAYMENT = 'payment', 'Payment'
        LEARNING = 'learning', 'Learning'
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='notifications', on_delete=models.CASCADE)
    title = models.CharField(max_length=180)
    message = models.CharField(max_length=360)
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.INFO)
    link = models.CharField(max_length=240, blank=True)
    is_read = models.BooleanField(default=False)
    class Meta:
        ordering = ['-created_at']

class QuizAttempt(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='quiz_attempts', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='quiz_attempts', on_delete=models.CASCADE)
    answers = models.JSONField(default=dict)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    passed = models.BooleanField(default=False)

class BuilderDraft(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='builder_drafts', on_delete=models.CASCADE)
    builder_type = models.CharField(max_length=80)
    title = models.CharField(max_length=180, default='Untitled draft')
    data = models.JSONField(default=dict)
    version = models.PositiveIntegerField(default=1)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['user','builder_type'], name='unique_builder_per_user_type')]

class Payment(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUBMITTED = 'submitted', 'Submitted for verification'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='payments', on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, related_name='payments', on_delete=models.PROTECT, null=True, blank=True)
    course = models.ForeignKey(Course, related_name='payments', on_delete=models.PROTECT, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default='UGX')
    provider = models.CharField(max_length=40, default='manual')
    provider_reference = models.CharField(max_length=180, blank=True)
    customer_phone = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    metadata = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='verified_payments', on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self): return f'{self.user.email} · {self.amount} {self.currency} · {self.status}'

class ContactMessage(TimeStampedModel):
    name = models.CharField(max_length=140)
    email = models.EmailField()
    subject = models.CharField(max_length=180, blank=True)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    def __str__(self): return f'{self.name}: {self.subject or "Contact message"}'
