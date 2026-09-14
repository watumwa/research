from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import (
    Course, Module, Lesson, Resource, Entitlement, LessonProgress, QuizAttempt,
    BuilderDraft, Payment, ContactMessage, LessonPractice, Notification
)
from .access import has_lesson_access, has_resource_access

User = get_user_model()

class LessonSummarySerializer(serializers.ModelSerializer):
    locked = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    class Meta:
        model = Lesson
        fields = ['id','title','slug','summary','duration_minutes','kind','is_free','is_premium','order','locked','progress']
    def get_locked(self, obj):
        request = self.context.get('request')
        return not has_lesson_access(getattr(request,'user',None), obj)
    def get_progress(self, obj):
        request = self.context.get('request')
        user = getattr(request,'user',None)
        if not user or not user.is_authenticated:
            return {'percent':0,'completed':False}
        record = LessonProgress.objects.filter(user=user, lesson=obj).first()
        return {'percent':record.percent,'completed':record.completed} if record else {'percent':0,'completed':False}

class ModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()
    completion = serializers.SerializerMethodField()
    class Meta:
        model = Module
        fields = ['id','title','slug','description','order','lessons','completion']
    def get_lessons(self,obj):
        qs = obj.lessons.filter(is_published=True).order_by('order','id')
        return LessonSummarySerializer(qs, many=True, context=self.context).data
    def get_completion(self,obj):
        request = self.context.get('request')
        user = getattr(request,'user',None)
        total = obj.lessons.filter(is_published=True).count()
        if not total or not user or not user.is_authenticated:
            return {'percent':0,'done':0,'total':total}
        done = LessonProgress.objects.filter(user=user, lesson__module=obj, lesson__is_published=True, completed=True).count()
        return {'percent':round(done/total*100), 'done':done, 'total':total}

class CourseSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()
    completion = serializers.SerializerMethodField()
    resume_lesson = serializers.SerializerMethodField()
    class Meta:
        model = Course
        fields = ['id','title','slug','subtitle','description','category','accent','access','price','currency','order','modules','completion','resume_lesson']
    def get_modules(self,obj):
        qs = obj.modules.filter(is_published=True).order_by('order','id')
        return ModuleSerializer(qs, many=True, context=self.context).data
    def get_completion(self,obj):
        request = self.context.get('request')
        user = getattr(request,'user',None)
        lesson_ids = list(Lesson.objects.filter(module__course=obj, is_published=True).values_list('id', flat=True))
        total = len(lesson_ids)
        if not total or not user or not user.is_authenticated:
            return 0
        done = LessonProgress.objects.filter(user=user, lesson_id__in=lesson_ids, completed=True).count()
        return round(done/total*100)
    def get_resume_lesson(self,obj):
        request = self.context.get('request')
        user = getattr(request,'user',None)
        lessons = Lesson.objects.filter(module__course=obj, is_published=True).select_related('module').order_by('module__order','order','id')
        for lesson in lessons:
            if not has_lesson_access(user, lesson):
                continue
            record = LessonProgress.objects.filter(user=user, lesson=lesson).first() if user and user.is_authenticated else None
            if not record or not record.completed:
                return {
                    'slug':lesson.slug,'title':lesson.title,'module_title':lesson.module.title,
                    'duration_minutes':lesson.duration_minutes,'percent':record.percent if record else 0
                }
        return None

class LessonDetailSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    module_slug = serializers.CharField(source='module.slug', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    course_slug = serializers.CharField(source='module.course.slug', read_only=True)
    progress = serializers.SerializerMethodField()
    navigation = serializers.SerializerMethodField()
    course_progress = serializers.SerializerMethodField()
    class Meta:
        model = Lesson
        fields = [
            'id','title','slug','summary','duration_minutes','kind','is_free','is_premium',
            'module_title','module_slug','course_title','course_slug','content','quiz','references',
            'progress','navigation','course_progress'
        ]
    def get_progress(self,obj):
        request = self.context.get('request')
        user = getattr(request,'user',None)
        if not user or not user.is_authenticated: return {'percent':0,'completed':False}
        p = LessonProgress.objects.filter(user=user, lesson=obj).first()
        return {'percent':p.percent,'completed':p.completed} if p else {'percent':0,'completed':False}
    def _course_lessons(self,obj):
        return list(Lesson.objects.filter(module__course=obj.module.course, is_published=True).select_related('module').order_by('module__order','order','id'))
    def get_navigation(self,obj):
        lessons = self._course_lessons(obj)
        ids = [x.id for x in lessons]
        try: idx = ids.index(obj.id)
        except ValueError: return {'previous':None,'next':None,'position':1,'total':len(lessons)}
        def summary(x):
            if not x: return None
            request = self.context.get('request')
            return {'slug':x.slug,'title':x.title,'module_title':x.module.title,'locked':not has_lesson_access(getattr(request,'user',None),x)}
        return {
            'previous':summary(lessons[idx-1] if idx>0 else None),
            'next':summary(lessons[idx+1] if idx+1<len(lessons) else None),
            'position':idx+1,'total':len(lessons)
        }
    def get_course_progress(self,obj):
        request = self.context.get('request')
        user = getattr(request,'user',None)
        lessons = self._course_lessons(obj)
        total = len(lessons)
        if not total or not user or not user.is_authenticated:
            return {'done':0,'total':total,'percent':0}
        done = LessonProgress.objects.filter(user=user, lesson__in=lessons, completed=True).count()
        return {'done':done,'total':total,'percent':round(done/total*100)}

class ResourceSerializer(serializers.ModelSerializer):
    unlocked = serializers.SerializerMethodField()
    lesson_slug = serializers.CharField(source='lesson.slug', read_only=True, allow_null=True)
    class Meta:
        model = Resource
        fields = ['id','title','slug','summary','access','price','currency','preview','lesson_slug','unlocked']
    def get_unlocked(self,obj):
        request = self.context.get('request')
        return has_resource_access(getattr(request,'user',None), obj)

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['percent','completed','last_position','completed_at','updated_at']
        read_only_fields = ['completed_at','updated_at']

class LessonPracticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonPractice
        fields = ['answers','updated_at']
        read_only_fields = ['updated_at']

class QuizAttemptSerializer(serializers.ModelSerializer):
    lesson_slug = serializers.SlugRelatedField(source='lesson', slug_field='slug', queryset=Lesson.objects.all(), write_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    class Meta:
        model = QuizAttempt
        fields = ['id','lesson_slug','lesson_title','answers','score','passed','created_at']
        read_only_fields = ['id','score','passed','created_at']

class BuilderDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuilderDraft
        fields = ['id','builder_type','title','data','version','updated_at']
        read_only_fields = ['id','version','updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    resource_slug = serializers.SlugRelatedField(source='resource', slug_field='slug', queryset=Resource.objects.all(), required=False, allow_null=True)
    course_slug = serializers.SlugRelatedField(source='course', slug_field='slug', queryset=Course.objects.all(), required=False, allow_null=True)
    item_title = serializers.SerializerMethodField()
    class Meta:
        model = Payment
        fields = ['id','resource_slug','course_slug','item_title','amount','currency','provider','provider_reference','customer_phone','status','metadata','created_at','paid_at']
        read_only_fields = ['id','amount','currency','status','created_at','paid_at']
    def validate(self,attrs):
        resource = attrs.get('resource')
        course = attrs.get('course')
        if bool(resource) == bool(course):
            raise serializers.ValidationError('Choose exactly one resource or course.')
        return attrs
    def create(self, validated_data):
        resource = validated_data.get('resource')
        course = validated_data.get('course')
        item = resource or course
        validated_data['user'] = self.context['request'].user
        validated_data['amount'] = item.price
        validated_data['currency'] = item.currency
        return super().create(validated_data)
    def get_item_title(self,obj):
        return obj.resource.title if obj.resource_id else obj.course.title if obj.course_id else 'Payment'

class EntitlementSerializer(serializers.ModelSerializer):
    resource = serializers.SlugRelatedField(slug_field='slug', read_only=True)
    course = serializers.SlugRelatedField(slug_field='slug', read_only=True)
    class Meta:
        model = Entitlement
        fields = ['id','resource','course','source','expires_at','is_active','created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id','title','message','kind','link','is_read','created_at']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id','name','email','subject','message','created_at']
        read_only_fields = ['id','created_at']

class AdminUserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name', read_only=True)
    class Meta:
        model = User
        fields = ['id','name','email','role','is_active','date_joined','last_login','email_verified','onboarding_completed','learning_goal','learner_level']
