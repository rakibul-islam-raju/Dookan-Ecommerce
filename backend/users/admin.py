from django.contrib import admin

from .models import User, OTPVerification, UserAddress


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        "first_name",
        "last_name",
        "email",
        "mobile_number",
        "is_email_verified",
        "is_mobile_verified",
        "is_active",
        "is_staff",
        "is_superuser",
    ]
    list_filter = [
        "is_email_verified",
        "is_mobile_verified",
        "is_staff",
        "is_active",
        "is_superuser",
    ]
    search_fields = ["first_name", "last_name", "email", "mobile_number"]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ["email", "purpose", "otp_code", "created_at", "is_verified", "attempts"]
    list_filter = ["is_verified", "purpose"]
    search_fields = ["email"]
    ordering = ["-created_at"]


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "address_type",
        "full_name",
        "mobile_number",
        "address_line1",
        "address_line2",
        "city",
        "state",
        "postal_code",
        "country",
        "is_default",
    ]
    list_filter = ["address_type", "is_default"]
    search_fields = [
        "user__email",
        "full_name",
        "mobile_number",
        "address_line1",
        "address_line2",
        "city",
        "state",
        "postal_code",
        "country",
    ]
    ordering = ["-created_at"]
    date_hierarchy = "created_at"
