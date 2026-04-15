from rest_framework import serializers

from products.serializers import ConsumerProductListSerializer
from wishlists.models import WishlistItem


class AdminWishlistUserSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class AdminWishlistItemSerializer(serializers.ModelSerializer):
    product = ConsumerProductListSerializer(read_only=True)
    user = AdminWishlistUserSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "user", "product", "created_at"]
        read_only_fields = ["id", "created_at"]


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ConsumerProductListSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "created_at"]
        read_only_fields = ["id", "created_at"]


class WishlistItemCreateSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()

    def validate_product_id(self, value):
        from products.models import Product

        try:
            Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        product_id = validated_data["product_id"]

        item, created = WishlistItem.objects.get_or_create(
            user=user,
            product_id=product_id,
        )

        if not created:
            raise serializers.ValidationError({"detail": "Product already in wishlist."})

        return item
