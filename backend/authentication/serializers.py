from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.utils import timezone

from users.models import User, OTPVerification, Role
from utils.email import send_verification_otp_email
from vendors.services import get_active_vendor_membership, serialize_vendor_context


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with additional user data.
    Requires email verification before login.
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        # Check if email is verified
        if not self.user.is_email_verified:
            raise serializers.ValidationError(
                {"detail": "Please verify your email before logging in."}
            )

        membership = get_active_vendor_membership(self.user)

        if self.user.is_superuser:
            permissions = Role.ALL_PERMISSIONS
            role_name = "Superuser"
        elif membership and membership.is_owner:
            permissions = Role.ALL_PERMISSIONS
            role_name = "Owner"
        elif membership and membership.role:
            permissions = membership.role.permissions or []
            role_name = membership.role.name
        else:
            permissions = []
            role_name = None

        # Add custom user data to response
        data["user"] = {
            "id": str(self.user.id),
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "full_name": f"{self.user.first_name} {self.user.last_name}",
            "email": self.user.email,
            "mobile_number": self.user.mobile_number,
            "is_mobile_verified": self.user.is_mobile_verified,
            "is_email_verified": self.user.is_email_verified,
            "is_staff": self.user.is_staff,
            "is_superuser": self.user.is_superuser,
            "permissions": permissions,
            "role_name": role_name,
        }
        data["user"].update(serialize_vendor_context(self.context["request"]))

        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    User registration serializer.
    Creates inactive user and sends email verification OTP.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "mobile_number",
            "password",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
            "email": {"required": True},
            "mobile_number": {"required": True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            email=validated_data["email"],
            mobile_number=validated_data["mobile_number"],
            is_active=False,  # User inactive until email verified
            is_email_verified=False,
        )
        user.set_password(validated_data["password"])
        user.save()

        # Send email verification OTP
        send_verification_otp_email(
            email=user.email,
            user_name=f"{user.first_name} {user.last_name}",
            purpose="registration",
        )

        return user


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification with OTP.
    """

    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs.get("email")
        otp_code = attrs.get("otp_code")

        try:
            otp = OTPVerification.objects.filter(
                email=email,
                purpose="registration",
                is_verified=False,
                expires_at__gt=timezone.now(),
            ).latest("created_at")

            # Check attempts
            if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
                raise serializers.ValidationError(
                    {"detail": "Maximum attempts exceeded. Please request a new OTP."}
                )

            # Verify OTP code
            if otp.otp_code != otp_code:
                otp.attempts += 1
                otp.save()
                raise serializers.ValidationError({"detail": "Invalid OTP code."})

            attrs["otp"] = otp

        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid or expired OTP."})

        return attrs


class ResendVerificationSerializer(serializers.Serializer):
    """
    Serializer for resending verification email.
    """

    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if user.is_email_verified:
                raise serializers.ValidationError("Email is already verified.")
            self.user = user
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting a password reset OTP.
    """

    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.user = User.objects.get(email=value)
        except User.DoesNotExist:
            # Don't reveal whether email exists
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming password reset with OTP.
    """

    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )

    def validate(self, attrs):
        email = attrs.get("email")
        otp_code = attrs.get("otp_code")

        try:
            otp = OTPVerification.objects.filter(
                email=email,
                purpose="password_reset",
                is_verified=False,
                expires_at__gt=timezone.now(),
            ).latest("created_at")

            if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
                raise serializers.ValidationError(
                    {"detail": "Maximum attempts exceeded. Please request a new OTP."}
                )

            if otp.otp_code != otp_code:
                otp.attempts += 1
                otp.save()
                raise serializers.ValidationError({"detail": "Invalid OTP code."})

            attrs["otp"] = otp

        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid or expired OTP."})

        try:
            attrs["user"] = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "User not found."})

        return attrs
