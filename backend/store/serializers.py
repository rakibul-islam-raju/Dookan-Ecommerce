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
    has_meta_access_token = serializers.SerializerMethodField(read_only=True)
    meta_access_token = serializers.CharField(
        required=False, allow_blank=True, write_only=True
    )

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
            "meta_pixel_enabled",
            "meta_pixel_id",
            "meta_capi_enabled",
            "meta_access_token",
            "meta_test_event_code",
            "meta_default_currency",
            "has_meta_access_token",
            "inside_dhaka_delivery_charge",
            "outside_dhaka_delivery_charge",
            "free_shipping_threshold",
            "tax_rate",
        ]
        read_only_fields = ["id"]

    def _can_manage_settings(self):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if not user.is_staff or not getattr(user, "role", None):
            return False
        return "manage_settings" in (user.role.permissions or [])

    def get_fields(self):
        fields = super().get_fields()
        if not self._can_manage_settings():
            for field_name in (
                "meta_capi_enabled",
                "meta_access_token",
                "meta_test_event_code",
                "has_meta_access_token",
            ):
                fields.pop(field_name, None)
        return fields

    def validate(self, attrs):
        attrs = super().validate(attrs)
        instance = getattr(self, "instance", None)
        meta_pixel_enabled = attrs.get(
            "meta_pixel_enabled",
            getattr(instance, "meta_pixel_enabled", False),
        )
        meta_pixel_id = attrs.get("meta_pixel_id", getattr(instance, "meta_pixel_id", ""))
        meta_capi_enabled = attrs.get(
            "meta_capi_enabled",
            getattr(instance, "meta_capi_enabled", False),
        )
        incoming_token = attrs.get("meta_access_token")
        existing_token = getattr(instance, "meta_access_token", "")

        if meta_pixel_enabled and not meta_pixel_id:
            raise serializers.ValidationError(
                {"meta_pixel_id": "Pixel ID is required when Meta Pixel is enabled."}
            )

        if meta_capi_enabled:
            if not meta_pixel_id:
                raise serializers.ValidationError(
                    {
                        "meta_pixel_id": (
                            "Pixel ID is required when Conversions API is enabled."
                        )
                    }
                )
            if incoming_token is None and not existing_token:
                raise serializers.ValidationError(
                    {
                        "meta_access_token": (
                            "Access token is required when Conversions API is enabled."
                        )
                    }
                )
            if incoming_token == "" and not existing_token:
                raise serializers.ValidationError(
                    {
                        "meta_access_token": (
                            "Access token is required when Conversions API is enabled."
                        )
                    }
                )

        return attrs

    def get_logo(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url

    def get_has_meta_access_token(self, obj):
        return bool(obj.meta_access_token)

    def update(self, instance, validated_data):
        meta_access_token = validated_data.pop("meta_access_token", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if meta_access_token:
            instance.meta_access_token = meta_access_token

        instance.save()
        return instance


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
