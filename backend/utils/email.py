from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from datetime import timedelta
import random

from users.models import OTPVerification


def generate_otp():
    """Generate a random OTP code."""
    return "".join([str(random.randint(0, 9)) for _ in range(settings.OTP_LENGTH)])


def send_verification_otp_email(email, user_name, purpose="registration"):
    """
    Generate and send OTP verification email.

    Args:
        email: Recipient email address
        user_name: User's name for personalization
        purpose: OTP purpose (registration, guest_order, password_reset)

    Returns:
        bool: True if email sent successfully
    """
    otp_code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    # Invalidate any existing OTPs for this email and purpose
    OTPVerification.objects.filter(
        email=email,
        purpose=purpose,
        is_verified=False,
    ).update(is_verified=True)

    # Create new OTP
    OTPVerification.objects.create(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at,
    )

    # Determine subject based on purpose
    subjects = {
        "registration": "Verify Your Email - Dookan",
        "guest_order": "Your Order Tracking OTP - Dookan",
        "password_reset": "Reset Your Password - Dookan",
    }
    subject = subjects.get(purpose, "OTP Verification - Dookan")

    # Render email template
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

    # Send email
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )

    return True


def send_order_confirmation_email(order):
    """
    Send order confirmation email.

    Args:
        order: Order instance

    Returns:
        bool: True if email sent successfully
    """
    customer_email = order.customer_email
    if not customer_email:
        return False

    # Prepare order items
    items = [
        {
            "product_name": item.product_name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": item.total_price,
        }
        for item in order.items.all()
    ]

    # Get shipping address
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

    # Render email template
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

    # Send email
    send_mail(
        subject=f"Order Confirmation - {order.order_number}",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[customer_email],
        html_message=html_message,
        fail_silently=True,  # Don't fail order creation if email fails
    )

    return True


def send_guest_order_tracking_otp(email):
    """
    Send OTP for guest order tracking.

    Args:
        email: Guest's email address

    Returns:
        bool: True if email sent successfully
    """
    return send_verification_otp_email(
        email=email,
        user_name="Customer",
        purpose="guest_order",
    )
