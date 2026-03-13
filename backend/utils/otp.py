from django.conf import settings

from django.utils import timezone
from datetime import timedelta
import random

from users.models import OTPVerification


def send_verification_otp(mobile_number):
    """
    Generate and send OTP (implement actual SMS sending)
    """

    otp_code = "".join([str(random.randint(0, 9)) for _ in range(settings.OTP_LENGTH)])
    expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    OTPVerification.objects.create(
        mobile_number=mobile_number, otp_code=otp_code, expires_at=expires_at
    )

    # TODO: Implement actual SMS sending
    # send_sms(mobile_number, f"Your OTP is: {otp_code}")
    print(f"OTP for {mobile_number}: {otp_code}")  # Development only
