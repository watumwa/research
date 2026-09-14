from .models import Entitlement, Resource

def has_resource_access(user, resource):
    if resource.access == 'free':
        return True
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or getattr(user, 'role', '') in {'admin','editor'}:
        return True
    ent = Entitlement.objects.filter(user=user, resource=resource, is_active=True).first()
    return bool(ent and ent.valid())

def has_course_access(user, course):
    if course.access == 'free':
        return True
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or getattr(user, 'role', '') in {'admin','editor'}:
        return True
    ent = Entitlement.objects.filter(user=user, course=course, is_active=True).first()
    return bool(ent and ent.valid())

def has_lesson_access(user, lesson):
    if lesson.is_free:
        return True
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or getattr(user, 'role', '') in {'admin','editor'}:
        return True
    resource = Resource.objects.filter(lesson=lesson, is_published=True).first()
    if resource:
        return has_resource_access(user, resource)
    return has_course_access(user, lesson.module.course)
