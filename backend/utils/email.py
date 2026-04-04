from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from datetime import timedelta
import random
from urllib.parse import urlencode

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
    otp_code = create_email_otp(email=email, purpose=purpose)

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


def send_staff_invitation_email(email, user_name):
    """
    Send a staff invitation email with a password setup link.

    Args:
        email: Staff member's email address
        user_name: Staff member's display name
    """
    otp_code = create_email_otp(email=email, purpose="password_reset")
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


def send_welcome_email(email, user_name):
    """
    Send welcome email after successful email verification.

    Args:
        email: User's email address
        user_name: User's display name
    """
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


def send_order_status_update_email(order, new_status, note=""):
    """
    Send order status update email to customer.

    Args:
        order: Order instance
        new_status: New status string
        note: Optional note about the status change
    """
    customer_email = order.customer_email
    if not customer_email:
        return

    status_display_map = {
        "pending": "Pending",
        "confirmed": "Confirmed",
        "processing": "Processing",
        "shipped": "Shipped",
        "delivered": "Delivered",
        "cancelled": "Cancelled",
        "refunded": "Refunded",
    }

    html_message = render_to_string(
        "emails/order_status_update.html",
        {
            "customer_name": order.customer_name,
            "order_number": order.order_number,
            "new_status": new_status,
            "new_status_display": status_display_map.get(new_status, new_status.title()),
            "note": note,
        },
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=f"Order Update: {order.order_number} - {status_display_map.get(new_status, new_status.title())}",
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[customer_email],
        html_message=html_message,
        fail_silently=True,
    )


def send_password_reset_success_email(email, user_name):
    """
    Send confirmation email after successful password reset.

    Args:
        email: User's email address
        user_name: User's display name
    """
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
