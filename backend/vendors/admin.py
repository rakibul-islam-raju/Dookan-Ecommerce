from django.contrib import admin

from vendors.models import Vendor, VendorMembership


class VendorMembershipInline(admin.TabularInline):
    model = VendorMembership
    extra = 0
    autocomplete_fields = ["user", "role"]


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "owner",
        "storefront_enabled",
        "inventory_enabled",
        "expenses_enabled",
        "meta_pixel_enabled",
        "meta_capi_enabled",
        "inventory_mode",
        "is_active",
    ]
    list_filter = [
        "storefront_enabled",
        "inventory_enabled",
        "expenses_enabled",
        "meta_pixel_enabled",
        "meta_capi_enabled",
        "inventory_mode",
        "is_active",
    ]
    search_fields = ["name", "slug", "owner__email"]
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ["owner"]
    inlines = [VendorMembershipInline]

    fieldsets = (
        (
            "Business",
            {
                "fields": ("name", "slug", "owner", "is_active"),
            },
        ),
        (
            "Features",
            {
                "fields": (
                    "storefront_enabled",
                    "inventory_enabled",
                    "expenses_enabled",
                    "inventory_mode",
                )
            },
        ),
        (
            "Meta Tracking",
            {
                "fields": (
                    "meta_pixel_enabled",
                    "meta_capi_enabled",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        return not Vendor.objects.exists()


@admin.register(VendorMembership)
class VendorMembershipAdmin(admin.ModelAdmin):
    list_display = ["vendor", "user", "role", "is_owner", "is_active"]
    list_filter = ["is_owner", "is_active", "vendor"]
    search_fields = ["vendor__name", "user__email", "user__first_name", "user__last_name"]
    autocomplete_fields = ["vendor", "user", "role"]
