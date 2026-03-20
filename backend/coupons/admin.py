from django.contrib import admin

from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "discount_type",
        "discount_value",
        "used_count",
        "max_uses",
        "valid_from",
        "valid_until",
        "is_active",
    ]
    list_filter = ["discount_type", "is_active"]
    search_fields = ["code", "description"]
    readonly_fields = ["used_count", "created_at", "updated_at"]
