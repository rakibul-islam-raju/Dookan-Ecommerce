import random
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from users.models import OTPVerification


def generate_otp():
    """Generate a random OTP code."""
    return "".join([str(random.randint(0, 9)) for _ in range(settings.OTP_LENGTH)])


def create_email_otp(email, purpose):
    """Create a fresh OTP for an email and purpose pair."""
    otp_code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    OTPVerification.objects.filter(
        email=email,
        purpose=purpose,
        is_verified=False,
    ).update(is_verified=True)

    OTPVerification.objects.create(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at,
    )

    return otp_code


def _send_verification_otp_email(email, user_name, purpose="registration", otp_code=None):
    """Send an OTP verification email immediately."""
    otp_code = otp_code or create_email_otp(email=email, purpose=purpose)

    subjects = {
        "registration": "Verify Your Email - Dookan",
        "guest_order": "Your Order Tracking OTP - Dookan",
        "password_reset": "Reset Your Password - Dookan",
    }
    subject = subjects.get(purpose, "OTP Verification - Dookan")

    html_message = render_to_string(
        "emails/verification_otp.html",
        {
            "user_name": user_name,
            "otp_code": otp_code,
            "expiry_minutes": settings.OTP_EXPIRE_MINUTES,
            "purpose": purpose,
        },
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )
    return True


def send_verification_otp_email(email, user_name, purpose="registration"):
    """Queue OTP verification email delivery in the background."""
    from utils.tasks import send_verification_otp_email_task

    otp_code = create_email_otp(email=email, purpose=purpose)
    transaction.on_commit(
        lambda: send_verification_otp_email_task.delay(
            email, user_name, purpose, otp_code
        )
    )
    return True


def _send_staff_invitation_email(email, user_name, otp_code=None):
    """Send a staff invitation email immediately."""
    otp_code = otp_code or create_email_otp(email=email, purpose="password_reset")
    query = urlencode({"email": email, "otp": otp_code})
    setup_url = f"{settings.ADMIN_URL.rstrip('/')}/set-password?{query}"

    html_message = render_to_string(
        "emails/staff_invitation.html",
        {
            "user_name": user_name,
            "setup_url": setup_url,
            "otp_code": otp_code,
            "expiry_minutes": settings.OTP_EXPIRE_MINUTES,
        },
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject="Set Up Your Staff Account - Dookan",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )
    return True


def send_staff_invitation_email(email, user_name):
    """Queue a staff invitation email for background delivery."""
    from utils.tasks import send_staff_invitation_email_task

    otp_code = create_email_otp(email=email, purpose="password_reset")
    transaction.on_commit(
        lambda: send_staff_invitation_email_task.delay(email, user_name, otp_code)
    )
    return True


def _send_order_confirmation_email(order):
    """Send order confirmation email immediately."""
    customer_email = order.customer_email
    if not customer_email:
        return False

    items = [
        {
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": item.total_price,
        }
        for item in order.items.all()
    ]

    shipping_address = getattr(order, "shipping_address", None)
    shipping_data = None
    if shipping_address:
        shipping_data = {
            "full_name": shipping_address.full_name,
            "address_line1": shipping_address.address_line1,
            "address_line2": getattr(shipping_address, "address_line2", ""),
            "city": shipping_address.city,
            "state": shipping_address.state,
            "postal_code": shipping_address.postal_code,
            "country": getattr(shipping_address, "country", "Bangladesh"),
        }

    html_message = render_to_string(
        "emails/order_confirmation.html",
        {
            "customer_name": order.customer_name,
            "order_number": order.order_number,
            "order_date": order.created_at.strftime("%B %d, %Y"),
            "items": items,
            "subtotal": order.subtotal,
            "discount_amount": getattr(order, "discount_amount", 0),
            "tax_amount": getattr(order, "tax_amount", 0),
            "shipping_amount": order.shipping_amount,
            "total_amount": order.total_amount,
            "shipping_address": shipping_data,
            "payment_method": getattr(order, "payment_method", ""),
        },
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=f"Order Confirmation - {order.order_number}",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[customer_email],
        html_message=html_message,
        fail_silently=True,
    )
    return True


def send_order_confirmation_email(order):
    """Queue order confirmation email delivery in the background."""
    from utils.tasks import send_order_confirmation_email_task

    transaction.on_commit(lambda: send_order_confirmation_email_task.delay(order.id))
    return True


def send_guest_order_tracking_otp(email):
    """Queue OTP delivery for guest order tracking."""
    return send_verification_otp_email(
        email=email,
        user_name="Customer",
        purpose="guest_order",
    )


def _send_welcome_email(email, user_name):
    """Send welcome email immediately."""
    html_message = render_to_string(
        "emails/welcome.html",
        {"user_name": user_name},
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject="Welcome to Dookan!",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=True,
    )
    return True


def send_welcome_email(email, user_name):
    """Queue welcome email delivery in the background."""
    from utils.tasks import send_welcome_email_task

    transaction.on_commit(lambda: send_welcome_email_task.delay(email, user_name))
    return True


def _send_order_status_update_email(order, new_status, note=""):
    """Send order status update email immediately."""
    customer_email = order.customer_email
    if not customer_email:
        return False

    status_display_map = {
        "pending": "Pending",
        "confirmed": "Confirmed",
        "processing": "Processing",
        "shipped": "Shipped",
        "delivered": "Delivered",
        "cancelled": "Cancelled",
        "refunded": "Refunded",
    }

    status_display = status_display_map.get(new_status, new_status.title())
    html_message = render_to_string(
        "emails/order_status_update.html",
        {
            "customer_name": order.customer_name,
            "order_number": order.order_number,
            "new_status": new_status,
            "new_status_display": status_display,
            "note": note,
        },
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=f"Order Update: {order.order_number} - {status_display}",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[customer_email],
        html_message=html_message,
        fail_silently=True,
    )
    return True


def send_order_status_update_email(order, new_status, note=""):
    """Queue order status update email delivery in the background."""
    from utils.tasks import send_order_status_update_email_task

    transaction.on_commit(
        lambda: send_order_status_update_email_task.delay(order.id, new_status, note)
    )
    return True


def _send_password_reset_success_email(email, user_name):
    """Send password reset success email immediately."""
    html_message = render_to_string(
        "emails/password_reset_success.html",
        {"user_name": user_name},
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject="Password Reset Successful - Dookan",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=True,
    )
    return True


def send_password_reset_success_email(email, user_name):
    """Queue password reset success email delivery in the background."""
    from utils.tasks import send_password_reset_success_email_task

    transaction.on_commit(
        lambda: send_password_reset_success_email_task.delay(email, user_name)
    )
    return True
