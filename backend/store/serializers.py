from rest_framework import serializers
from .models import Announcement, Banner, SiteConfig
from vendors.services import get_singleton_vendor


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "description",
            "start_date",
            "end_date",
            "is_active",
        ]


class SiteConfigSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    storefront_enabled = serializers.SerializerMethodField(read_only=True)
    meta_pixel_enabled = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SiteConfig
        fields = [
            "id",
            "tagline",
            "address",
            "phone",
            "email",
            "facebook_url",
            "instagram_url",
            "youtube_url",
            "logo",
            "storefront_enabled",
            "meta_pixel_enabled",
            "meta_pixel_id",
            "meta_access_token",
            "meta_test_event_code",
            "meta_default_currency",
            "inside_dhaka_delivery_charge",
            "outside_dhaka_delivery_charge",
            "free_shipping_threshold",
            "tax_rate",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "meta_access_token": {"write_only": True},
        }

    def get_logo(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url

    def _get_vendor(self):
        return get_singleton_vendor(required=False)

    def get_storefront_enabled(self, obj):
        vendor = self._get_vendor()
        return bool(vendor and vendor.storefront_enabled)

    def get_meta_pixel_enabled(self, obj):
        vendor = self._get_vendor()
        return bool(vendor and vendor.meta_pixel_enabled)


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "description",
            "image",
            "start_date",
            "end_date",
            "is_active",
            "display_order",
        ]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            request = self.context.get("request")
            if request:
                data["image"] = request.build_absolute_uri(instance.image.url)
        return data
