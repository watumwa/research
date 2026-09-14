from django.contrib import admin
from .models import (
    Course, Module, Lesson, Resource, Entitlement, LessonProgress, LessonPractice,
    Notification, QuizAttempt, BuilderDraft, Payment, ContactMessage
)
from .services import mark_payment_paid

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title','access','price','currency','is_published','order')
    prepopulated_fields = {'slug':('title',)}
    inlines = [ModuleInline]

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ('title','slug','kind','is_free','is_premium','is_published','order')

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title','course','order','is_published')
    prepopulated_fields = {'slug':('title',)}
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title','module','kind','is_free','is_premium','is_published','order')
    list_filter = ('kind','is_free','is_premium','is_published','module__course')
    prepopulated_fields = {'slug':('title',)}
    search_fields = ('title','summary')

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title','access','price','currency','is_published')
    prepopulated_fields = {'slug':('title',)}

@admin.action(description='Approve selected payments and grant access')
def approve_payments(modeladmin, request, queryset):
    for payment in queryset:
        mark_payment_paid(payment, verified_by=request.user, reference=payment.provider_reference)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id','user','resource','course','amount','currency','provider','status','created_at','paid_at')
    list_filter = ('status','provider','currency')
    search_fields = ('user__email','provider_reference')
    actions = [approve_payments]

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title','user','kind','is_read','created_at')
    list_filter = ('kind','is_read')
    search_fields = ('title','message','user__email')

admin.site.register(Entitlement)
admin.site.register(LessonProgress)
admin.site.register(LessonPractice)
admin.site.register(QuizAttempt)
admin.site.register(BuilderDraft)
admin.site.register(ContactMessage)
