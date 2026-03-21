from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
import uuid

from users.managers import CustomUserManager
from utils.models import BaseModel


class Role(BaseModel):
    """
    Roles for staff members with module-based permissions
    """

    PERMISSION_CHOICES = [
        ("view_dashboard", "View Dashboard"),
        ("manage_products", "Manage Products"),
        ("manage_orders", "Manage Orders"),
        ("manage_customers", "Manage Customers"),
        ("manage_categories", "Manage Categories"),
        ("manage_coupons", "Manage Coupons"),
        ("manage_reviews", "Manage Reviews"),
        ("manage_banners", "Manage Banners"),
        ("manage_announcements", "Manage Announcements"),
        ("manage_settings", "Manage Settings"),
        ("manage_staff", "Manage Staff"),
    ]

    ALL_PERMISSIONS = [code for code, _ in PERMISSION_CHOICES]

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=list)

    class Meta:
        db_table = "roles"
        ordering = ["name"]

    def __str__(self):
        return self.name


class User(AbstractBaseUser, PermissionsMixin):
    """
    Extended User model with mobile number for OTP verification
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(_("first name"), max_length=30, blank=True)
    last_name = models.CharField(_("last name"), max_length=30, blank=True)
    email = models.EmailField(
        _("email address"),
        unique=True,
        max_length=254,
    )
    mobile_regex = RegexValidator(
        regex=r"^\+?1?\d{9,15}$",
        message="Mobile number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
    )
    mobile_number = models.CharField(
        validators=[mobile_regex], max_length=17, unique=True, db_index=True
    )
    is_mobile_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    role = models.ForeignKey(
        Role, on_delete=models.SET_NULL, null=True, blank=True, related_name="users"
    )
    password = models.CharField(max_length=128, blank=True, null=True)
    password_reset_token = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "mobile_number"]

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["mobile_number", "is_mobile_verified"]),
        ]

    def __str__(self):
        return f"{self.email} - {self.mobile_number}"


class OTPVerification(BaseModel):
    """
    OTP verification for email verification and guest order tracking
    """

    PURPOSE_CHOICES = (
        ("registration", "Registration"),
        ("guest_order", "Guest Order Tracking"),
        ("password_reset", "Password Reset"),
    )

    email = models.EmailField(db_index=True, default="")
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(
        max_length=20, choices=PURPOSE_CHOICES, default="registration"
    )
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)

    class Meta:
        db_table = "otp_verifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email", "purpose", "is_verified", "expires_at"]),
        ]

    def __str__(self):
        return f"OTP for {self.email} ({self.purpose})"


class UserAddress(BaseModel):
    """
    Saved addresses for registered users
    """

    ADDRESS_TYPE_CHOICES = (
        ("home", "Home"),
        ("work", "Work"),
        ("other", "Other"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")

    address_type = models.CharField(
        max_length=10, choices=ADDRESS_TYPE_CHOICES, default="home"
    )
    full_name = models.CharField(max_length=200)
    mobile_number = models.CharField(max_length=17)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="Bangladesh")

    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = "user_addresses"
        ordering = ["-is_default", "-created_at"]
        indexes = [
            models.Index(fields=["user", "is_default"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.address_type}"
