from django.contrib import admin

from .models import Announcement, Banner, SiteConfig


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "description",
        "start_date",
        "end_date",
        "is_active",
    ]


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    list_display = [
        "tagline",
        "phone",
        "email",
    ]
    fieldsets = (
        (
            "Basic Information",
            {"fields": ("tagline", "logo")},
        ),
        (
            "Contact Details",
            {"fields": ("address", "phone", "email")},
        ),
        (
            "Social Links",
            {"fields": ("facebook_url", "instagram_url", "youtube_url")},
        ),
        (
            "Meta Tracking",
            {
                "fields": (
                    "meta_pixel_enabled",
                    "meta_pixel_id",
                    "meta_capi_enabled",
                    "meta_access_token",
                    "meta_test_event_code",
                    "meta_default_currency",
                )
            },
        ),
        (
            "Shipping & Tax",
            {
                "fields": (
                    "inside_dhaka_delivery_charge",
                    "outside_dhaka_delivery_charge",
                    "free_shipping_threshold",
                    "tax_rate",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        # Prevent adding multiple SiteConfig instances
        return not SiteConfig.objects.exists()


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "is_active",
        "display_order",
        "start_date",
        "end_date",
    ]
    list_filter = ["is_active", "start_date", "end_date"]
    search_fields = ["title", "description"]
    ordering = ["display_order", "-created_at"]
