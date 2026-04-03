from rest_framework import serializers

from .models import Sale


class SaleSerializer(serializers.ModelSerializer):
    is_currently_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id",
            "name",
            "description",
            "discount_type",
            "discount_value",
            "applies_to",
            "categories",
            "products",
            "valid_from",
            "valid_until",
            "allow_coupon_stacking",
            "is_active",
            "is_currently_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        valid_from = attrs.get("valid_from", getattr(self.instance, "valid_from", None))
        valid_until = attrs.get("valid_until", getattr(self.instance, "valid_until", None))

        if valid_from and valid_until and valid_from >= valid_until:
            raise serializers.ValidationError(
                {"valid_until": "End date must be after start date."}
            )

        discount_type = attrs.get(
            "discount_type", getattr(self.instance, "discount_type", None)
        )
        discount_value = attrs.get(
            "discount_value", getattr(self.instance, "discount_value", None)
        )

        if discount_type == "percentage" and discount_value and discount_value > 100:
            raise serializers.ValidationError(
                {"discount_value": "Percentage discount cannot exceed 100%."}
            )

        return attrs


class SaleListSerializer(serializers.ModelSerializer):
    is_currently_active = serializers.BooleanField(read_only=True)
    category_count = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            "id",
            "name",
            "description",
            "discount_type",
            "discount_value",
            "applies_to",
            "category_count",
            "product_count",
            "valid_from",
            "valid_until",
            "allow_coupon_stacking",
            "is_active",
            "is_currently_active",
            "created_at",
        ]

    def get_category_count(self, obj):
        return obj.categories.count()

    def get_product_count(self, obj):
        return obj.products.count()


class ActiveSaleSerializer(serializers.ModelSerializer):
    """Lightweight serializer for public active sales list."""

    class Meta:
        model = Sale
        fields = [
            "id",
            "name",
            "description",
            "discount_type",
            "discount_value",
            "applies_to",
            "valid_from",
            "valid_until",
            "allow_coupon_stacking",
        ]
