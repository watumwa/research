from django.db import transaction
from django.utils import timezone
from .models import Entitlement, Payment, Notification

@transaction.atomic
def mark_payment_paid(payment, verified_by=None, reference=None):
    if payment.status == Payment.Status.PAID:
        return payment
    payment.status = Payment.Status.PAID
    payment.paid_at = timezone.now()
    payment.verified_by = verified_by
    if reference:
        payment.provider_reference = reference
    payment.save(update_fields=['status','paid_at','verified_by','provider_reference','updated_at'])
    if payment.resource_id:
        Entitlement.objects.update_or_create(
            user=payment.user, resource=payment.resource,
            defaults={'course': None, 'is_active': True, 'source': 'payment'}
        )
    if payment.course_id:
        Entitlement.objects.update_or_create(
            user=payment.user, course=payment.course,
            defaults={'resource': None, 'is_active': True, 'source': 'payment'}
        )
    item = payment.resource.title if payment.resource_id else payment.course.title if payment.course_id else 'your purchase'
    Notification.objects.create(
        user=payment.user,
        title='Payment confirmed',
        message=f'Access to {item} is now available in your account.',
        kind='payment',
        link=f'/resources/{payment.resource.slug}' if payment.resource_id else f'/courses/{payment.course.slug}' if payment.course_id else '/profile'
    )
    return payment
