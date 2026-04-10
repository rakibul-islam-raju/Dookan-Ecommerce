from rest_framework import serializers
from .models import Announcement, Banner, SiteConfig


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
            "inside_dhaka_delivery_charge",
            "outside_dhaka_delivery_charge",
            "free_shipping_threshold",
            "tax_rate",
        ]
        read_only_fields = ["id"]

    def get_logo(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url


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
