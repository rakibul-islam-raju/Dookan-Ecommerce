from django.contrib import admin

from .models import Sale


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "discount_type",
        "discount_value",
        "applies_to",
        "valid_from",
        "valid_until",
        "is_active",
        "allow_coupon_stacking",
    ]
    list_filter = ["discount_type", "applies_to", "is_active", "allow_coupon_stacking"]
    search_fields = ["name", "description"]
    filter_horizontal = ["categories", "products"]
    readonly_fields = ["created_at", "updated_at"]
