from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import (
    Course, Module, Lesson, Resource, Entitlement, LessonProgress, LessonPractice,
    Notification, QuizAttempt, BuilderDraft, Payment, ContactMessage
)
from .services import mark_payment_paid

class ModuleInline(TabularInline):
    model = Module
    extra = 0

@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ('title','access','price','currency','is_published','order')
    list_filter = ('access', 'is_published', 'currency')
    search_fields = ('title', 'slug', 'category', 'description')
    ordering = ('order', 'title')
    list_per_page = 25
    prepopulated_fields = {'slug':('title',)}
    inlines = [ModuleInline]

class LessonInline(TabularInline):
    model = Lesson
    extra = 0
    fields = ('title','slug','kind','is_free','is_premium','is_published','order')

@admin.register(Module)
class ModuleAdmin(ModelAdmin):
    list_display = ('title','course','order','is_published')
    list_filter = ('is_published', 'course')
    search_fields = ('title', 'slug', 'course__title')
    autocomplete_fields = ('course',)
    ordering = ('course', 'order')
    prepopulated_fields = {'slug':('title',)}
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(ModelAdmin):
    list_display = ('title','module','kind','is_free','is_premium','is_published','order')
    list_filter = ('kind','is_free','is_premium','is_published','module__course')
    prepopulated_fields = {'slug':('title',)}
    search_fields = ('title','summary')
    autocomplete_fields = ('module',)
    search_fields = ('title', 'slug', 'summary', 'module__title', 'module__course__title')
    ordering = ('module__course', 'module__order', 'order')
    list_per_page = 25

@admin.register(Resource)
class ResourceAdmin(ModelAdmin):
    list_display = ('title','access','price','currency','is_published')
    list_filter = ('access', 'is_published', 'currency')
    search_fields = ('title', 'slug', 'summary')
    autocomplete_fields = ('lesson',)
    ordering = ('order', 'title')
    prepopulated_fields = {'slug':('title',)}

@admin.action(description='Approve selected payments and grant access')
def approve_payments(modeladmin, request, queryset):
    for payment in queryset:
        mark_payment_paid(payment, verified_by=request.user, reference=payment.provider_reference)

@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    list_display = ('id','user','resource','course','amount','currency','provider','status','created_at','paid_at')
    list_filter = ('status','provider','currency')
    search_fields = ('user__email', 'provider_reference', 'customer_phone')
    autocomplete_fields = ('user', 'resource', 'course')
    readonly_fields = ('id', 'created_at', 'updated_at', 'paid_at', 'verified_by')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    actions = [approve_payments]

@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ('title','user','kind','is_read','created_at')
    list_filter = ('kind','is_read')
    search_fields = ('title','message','user__email')
    autocomplete_fields = ('user',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

@admin.register(Entitlement)
class EntitlementAdmin(ModelAdmin):
    list_display = ('user', 'access_target', 'source', 'is_active', 'expires_at', 'created_at')
    list_filter = ('is_active', 'source')
    search_fields = ('user__email', 'resource__title', 'course__title')
    autocomplete_fields = ('user', 'resource', 'course')

    @admin.display(description='Access target')
    def access_target(self, obj):
        return obj.resource or obj.course or 'Unassigned'

@admin.register(LessonProgress)
class LessonProgressAdmin(ModelAdmin):
    list_display = ('user', 'lesson', 'percent', 'completed', 'completed_at', 'updated_at')
    list_filter = ('completed', 'lesson__module__course')
    search_fields = ('user__email', 'lesson__title')
    autocomplete_fields = ('user', 'lesson')
    ordering = ('-updated_at',)

@admin.register(LessonPractice)
class LessonPracticeAdmin(ModelAdmin):
    list_display = ('user', 'lesson', 'updated_at')
    search_fields = ('user__email', 'lesson__title')
    autocomplete_fields = ('user', 'lesson')
    ordering = ('-updated_at',)

@admin.register(QuizAttempt)
class QuizAttemptAdmin(ModelAdmin):
    list_display = ('user', 'lesson', 'score', 'passed', 'created_at')
    list_filter = ('passed', 'lesson__module__course')
    search_fields = ('user__email', 'lesson__title')
    autocomplete_fields = ('user', 'lesson')
    ordering = ('-created_at',)

@admin.register(BuilderDraft)
class BuilderDraftAdmin(ModelAdmin):
    list_display = ('title', 'builder_type', 'user', 'version', 'updated_at')
    list_filter = ('builder_type',)
    search_fields = ('title', 'builder_type', 'user__email')
    autocomplete_fields = ('user',)
    ordering = ('-updated_at',)

@admin.register(ContactMessage)
class ContactMessageAdmin(ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_resolved', 'created_at')
    list_filter = ('is_resolved',)
    search_fields = ('name', 'email', 'subject', 'message')
    date_hierarchy = 'created_at'
    ordering = ('is_resolved', '-created_at')
