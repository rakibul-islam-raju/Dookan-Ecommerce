from django.db import transaction
from django.conf import settings

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import OTPVerification, UserAddress, Role
from django.utils import timezone
from datetime import timedelta
import random

from users.models import User
from utils.email import send_staff_invitation_email
from vendors.services import get_active_vendor_membership, serialize_vendor_context


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with additional user data
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add custom user data to response
        data["user"] = {
            "id": str(self.user.id),
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "full_name": f"{self.user.first_name} {self.user.last_name}",
            "email": self.user.email,
            "mobile_number": self.user.mobile_number,
            "is_mobile_verified": self.user.is_mobile_verified,
        }

        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    User registration serializer
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
        )
        user.set_password(validated_data["password"])
        user.save()

        # Send OTP for mobile verification
        # self.send_verification_otp(user.mobile_number)

        return user

    def send_verification_otp(self, mobile_number):
        """
        Generate and send OTP (implement actual SMS sending)
        """

        otp_code = "".join(
            [str(random.randint(0, 9)) for _ in range(settings.OTP_LENGTH)]
        )
        expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        OTPVerification.objects.create(
            mobile_number=mobile_number, otp_code=otp_code, expires_at=expires_at
        )

        # TODO: Implement actual SMS sending
        # send_sms(mobile_number, f"Your OTP is: {otp_code}")
        print(f"OTP for {mobile_number}: {otp_code}")  # Development only


class UserAddressCreateSerializer(serializers.ModelSerializer):
    """
    User address create serializer
    """

    class Meta:
        model = UserAddress
        exclude = [
            "id",
            "user",
            "is_active",
            "created_at",
            "updated_at",
        ]


class UserAddressSerializer(serializers.ModelSerializer):
    """
    User address serializer
    """

    class Meta:
        model = UserAddress
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    """
    User profile serializer
    """

    class Meta:
        model = User
        exclude = ["password"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        primary_address = UserAddress.objects.filter(
            user=instance, is_default=True, is_active=True
        ).first()
        # serialize the primary address
        primary_address_serializer = UserAddressSerializer(primary_address)
        data["default_address"] = primary_address_serializer.data

        membership = get_active_vendor_membership(instance)

        if instance.is_superuser:
            data["permissions"] = Role.ALL_PERMISSIONS
            data["role_name"] = "Superuser"
        elif membership and membership.is_owner:
            data["permissions"] = Role.ALL_PERMISSIONS
            data["role_name"] = "Owner"
        elif membership and membership.role:
            data["permissions"] = membership.role.permissions or []
            data["role_name"] = membership.role.name
        else:
            data["permissions"] = []
            data["role_name"] = None

        request = self.context.get("request")
        if request and request.user == instance:
            data.update(serialize_vendor_context(request))

        return data


class ChangePasswordSerializer(serializers.Serializer):
    """
    Change password serializer
    """

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, write_only=True, validators=[validate_password]
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class UserListSerializer(serializers.ModelSerializer):
    """
    User list serializer
    """

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "mobile_number",
            "is_active",
            "is_email_verified",
            "is_mobile_verified",
            "created_at",
            "updated_at",
        ]


class RoleSerializer(serializers.ModelSerializer):
    """
    Role CRUD serializer
    """

    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
            "permissions",
            "user_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_user_count(self, obj):
        return obj.vendor_memberships.filter(is_active=True).count()

    def validate_permissions(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Permissions must be a list.")
        valid = {code for code, _ in Role.PERMISSION_CHOICES}
        invalid = set(value) - valid
        if invalid:
            raise serializers.ValidationError(f"Invalid permissions: {invalid}")
        return value


class StaffListSerializer(serializers.ModelSerializer):
    """
    Staff list/detail serializer
    """

    role = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "mobile_number",
            "is_active",
            "is_superuser",
            "role",
            "role_name",
            "created_at",
            "updated_at",
        ]

    def _get_membership(self, obj):
        if not hasattr(obj, "_cached_staff_membership"):
            from vendors.models import VendorMembership
            from vendors.services import get_singleton_vendor

            vendor = get_singleton_vendor()
            obj._cached_staff_membership = (
                VendorMembership.objects.filter(
                    user=obj, vendor=vendor, is_active=True
                )
                .select_related("role")
                .first()
                if vendor
                else None
            )
        return obj._cached_staff_membership

    def get_role(self, obj):
        membership = self._get_membership(obj)
        return str(membership.role.id) if membership and membership.role else None

    def get_role_name(self, obj):
        membership = self._get_membership(obj)
        return membership.role.name if membership and membership.role else None


class StaffCreateSerializer(serializers.ModelSerializer):
    """
    Staff creation serializer
    """

    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), required=False, allow_null=True, write_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "mobile_number",
            "role",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        role = validated_data.pop("role", None)
        with transaction.atomic():
            user = User.objects.create_user(
                is_staff=True,
                is_active=True,
                is_email_verified=True,
                **validated_data,
            )
            from vendors.models import VendorMembership
            from vendors.services import get_singleton_vendor

            vendor = get_singleton_vendor()
            if vendor:
                VendorMembership.objects.create(
                    user=user, vendor=vendor, role=role, is_owner=False
                )
            send_staff_invitation_email(
                email=user.email,
                user_name=f"{user.first_name} {user.last_name}".strip() or "there",
            )
        return user


class StaffUpdateSerializer(serializers.ModelSerializer):
    """
    Staff update serializer
    """

    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), required=False, allow_null=True, write_only=True
    )

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "mobile_number",
            "role",
            "is_active",
        ]

    def update(self, instance, validated_data):
        role = validated_data.pop("role", ...)
        instance = super().update(instance, validated_data)
        if role is not ...:
            from vendors.models import VendorMembership
            from vendors.services import get_singleton_vendor

            vendor = get_singleton_vendor()
            if vendor:
                VendorMembership.objects.filter(
                    user=instance, vendor=vendor
                ).update(role=role)
        return instance
