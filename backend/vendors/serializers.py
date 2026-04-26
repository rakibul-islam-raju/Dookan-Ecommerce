from rest_framework import serializers

from vendors.models import Vendor, VendorMembership
from vendors.services import serialize_vendor_context


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            "id",
            "name",
            "slug",
            "storefront_enabled",
            "inventory_enabled",
            "expenses_enabled",
            "inventory_mode",
            "meta_pixel_enabled",
            "meta_capi_enabled",
            "is_active",
        ]


class VendorMembershipSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True, default=None)

    class Meta:
        model = VendorMembership
        fields = [
            "id",
            "vendor",
            "role",
            "role_name",
            "is_owner",
            "is_active",
        ]


class VendorContextSerializer(serializers.Serializer):
    active_vendor = serializers.DictField(allow_null=True)
    enabled_features = serializers.ListField(child=serializers.CharField())
    inventory_mode = serializers.CharField(allow_null=True)
    storefront_enabled = serializers.BooleanField()
    vendor_permissions = serializers.ListField(child=serializers.CharField())
    is_vendor_owner = serializers.BooleanField()

    @classmethod
    def from_request(cls, request):
        return cls(serialize_vendor_context(request))
