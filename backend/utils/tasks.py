from celery import shared_task
from django.apps import apps

from utils.email import (
    _send_order_confirmation_email,
    _send_order_status_update_email,
    _send_password_reset_success_email,
    _send_staff_invitation_email,
    _send_verification_otp_email,
    _send_welcome_email,
)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def send_verification_otp_email_task(self, email, user_name, purpose, otp_code):
    return _send_verification_otp_email(
        email=email,
        user_name=user_name,
        purpose=purpose,
        otp_code=otp_code,
    )


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def send_staff_invitation_email_task(self, email, user_name, otp_code):
    return _send_staff_invitation_email(
        email=email,
        user_name=user_name,
        otp_code=otp_code,
    )


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def send_order_confirmation_email_task(self, order_id):
    Order = apps.get_model("orders", "Order")
    order = Order.objects.prefetch_related("items").get(pk=order_id)
    return _send_order_confirmation_email(order)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def send_welcome_email_task(self, email, user_name):
    return _send_welcome_email(email=email, user_name=user_name)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def send_order_status_update_email_task(self, order_id, new_status, note=""):
    Order = apps.get_model("orders", "Order")
    order = Order.objects.prefetch_related("items").get(pk=order_id)
    return _send_order_status_update_email(order, new_status=new_status, note=note)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=3,
)
def send_password_reset_success_email_task(self, email, user_name):
    return _send_password_reset_success_email(email=email, user_name=user_name)
