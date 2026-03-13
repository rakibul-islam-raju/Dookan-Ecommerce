from rest_framework import serializers

from products.models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "is_active", "display_order"]
        read_only_fields = ["id"]


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "product", "image", "alt_text", "is_primary", "display_order"]
        read_only_fields = ["id", "product"]

    def get_image(self, obj):
        request = self.context.get("request")
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class ProductImageUploadSerializer(serializers.Serializer):
    """Serializer for uploading multiple product images"""

    images = ProductImageSerializer(many=True)

    def create(self, validated_data):
        product_id = self.context.get("product_id")
        images_data = validated_data.get("images", [])

        created_images = []
        for image_data in images_data:
            product_image = ProductImage.objects.create(
                product_id=product_id,
                image=image_data["image"],
                alt_text=image_data.get("alt_text", ""),
                is_primary=image_data.get("is_primary", False),
                display_order=image_data.get("display_order", 0),
            )
            created_images.append(product_image)

        return {"images": created_images}


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "description",
            "short_description",
            "category",
            "price",
            "compare_at_price",
            "cost_price",
            "stock_quantity",
            "low_stock_threshold",
            "track_inventory",
            "weight",
            "unit",
            "unit_value",
            "meta_title",
            "meta_description",
            "is_featured",
            "is_active",
        ]
        read_only_fields = ["id"]


class VendorProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    category = ProductCategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "short_description",
            "category",
            "price",
            "compare_at_price",
            "discount_percentage",
            "cost_price",
            "stock_quantity",
            "unit",
            "unit_value",
            "is_featured",
            "is_active",
            "primary_image",
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).order_by("display_order").first()
        if image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return None


class ConsumerProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    category = ProductCategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "short_description",
            "category",
            "price",
            "compare_at_price",
            "discount_percentage",
            "stock_quantity",
            "is_low_stock",
            "is_in_stock",
            "unit",
            "unit_value",
            "is_featured",
            "is_active",
            "primary_image",
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).order_by("display_order").first()
        if image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return None


class VendorProductDetailsSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = ProductCategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"


class ConsumerProductDetailsSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = ProductCategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "description",
            "short_description",
            "category",
            "price",
            "compare_at_price",
            "discount_percentage",
            "stock_quantity",
            "is_low_stock",
            "is_in_stock",
            "weight",
            "unit",
            "unit_value",
            "is_featured",
            "is_active",
            "meta_title",
            "meta_description",
            "images",
        ]
