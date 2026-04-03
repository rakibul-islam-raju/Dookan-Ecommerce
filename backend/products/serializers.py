from django.db.models import Avg, Count
from rest_framework import serializers

from products.models import (
    Category,
    Product,
    ProductImage,
    ProductReview,
    ProductVariant,
    VariantOption,
    VariantType,
)


class CategoryChildSerializer(serializers.ModelSerializer):
    """Lightweight serializer for subcategories (one level deep)."""

    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image", "display_order", "is_active"]
        read_only_fields = ["id"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    parent_name = serializers.CharField(source="parent.name", read_only=True, default=None)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id", "name", "slug", "description", "image", "is_active",
            "display_order", "parent", "parent_name", "children",
        ]
        read_only_fields = ["id"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by("display_order", "name")
        return CategoryChildSerializer(children, many=True, context=self.context).data


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Category
        fields = [
            "id", "name", "slug", "description", "image", "is_active",
            "display_order", "parent",
        ]
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


class VariantOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VariantOption
        fields = ["id", "variant_type", "value", "display_order"]
        read_only_fields = ["id"]


class VariantOptionNestedSerializer(serializers.ModelSerializer):
    """Serializer for options when nested inside a variant type"""

    class Meta:
        model = VariantOption
        fields = ["id", "value", "display_order"]
        read_only_fields = ["id"]


class VariantTypeSerializer(serializers.ModelSerializer):
    options = VariantOptionNestedSerializer(many=True, read_only=True)

    class Meta:
        model = VariantType
        fields = ["id", "name", "display_order", "options"]
        read_only_fields = ["id"]


class VariantTypeCreateSerializer(serializers.ModelSerializer):
    options = VariantOptionNestedSerializer(many=True, required=False)

    class Meta:
        model = VariantType
        fields = ["id", "name", "display_order", "options"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        options_data = validated_data.pop("options", [])
        variant_type = VariantType.objects.create(**validated_data)
        for option_data in options_data:
            VariantOption.objects.create(variant_type=variant_type, **option_data)
        return variant_type

    def update(self, instance, validated_data):
        options_data = validated_data.pop("options", None)
        instance.name = validated_data.get("name", instance.name)
        instance.display_order = validated_data.get("display_order", instance.display_order)
        instance.save()

        if options_data is not None:
            # Get existing option IDs
            existing_ids = set(instance.options.values_list("id", flat=True))
            incoming_ids = set()

            for option_data in options_data:
                option_id = option_data.get("id")
                if option_id and option_id in existing_ids:
                    # Update existing
                    option = VariantOption.objects.get(id=option_id)
                    option.value = option_data.get("value", option.value)
                    option.display_order = option_data.get("display_order", option.display_order)
                    option.save()
                    incoming_ids.add(option_id)
                else:
                    # Create new
                    new_option = VariantOption.objects.create(
                        variant_type=instance, **option_data
                    )
                    incoming_ids.add(new_option.id)

            # Delete removed options
            to_delete = existing_ids - incoming_ids
            VariantOption.objects.filter(id__in=to_delete).delete()

        return instance


class ProductVariantOptionSerializer(serializers.ModelSerializer):
    variant_type_name = serializers.CharField(source="variant_type.name", read_only=True)
    variant_type_id = serializers.UUIDField(source="variant_type.id", read_only=True)

    class Meta:
        model = VariantOption
        fields = ["id", "variant_type_id", "variant_type_name", "value"]


class ProductVariantSerializer(serializers.ModelSerializer):
    options = ProductVariantOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product",
            "sku",
            "name",
            "base_price",
            "cost_price",
            "stock_quantity",
            "low_stock_threshold",
            "weight",
            "is_active",
            "is_in_stock",
            "is_low_stock",
            "display_order",
            "options",
        ]
        read_only_fields = ["id", "product"]


class ProductVariantCreateSerializer(serializers.ModelSerializer):
    option_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "sku",
            "name",
            "base_price",
            "cost_price",
            "stock_quantity",
            "low_stock_threshold",
            "weight",
            "is_active",
            "display_order",
            "option_ids",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        option_ids = validated_data.pop("option_ids", [])
        product_id = self.context.get("product_id")
        variant = ProductVariant.objects.create(product_id=product_id, **validated_data)
        if option_ids:
            variant.options.set(VariantOption.objects.filter(id__in=option_ids))
        # Auto-generate name if not provided
        if not variant.name:
            option_values = list(variant.options.values_list("value", flat=True))
            if option_values:
                variant.name = " / ".join(option_values)
                variant.save(update_fields=["name"])
        return variant

    def update(self, instance, validated_data):
        option_ids = validated_data.pop("option_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if option_ids is not None:
            instance.options.set(VariantOption.objects.filter(id__in=option_ids))
            # Regenerate name if it was auto-generated
            if not validated_data.get("name"):
                option_values = list(instance.options.values_list("value", flat=True))
                if option_values:
                    instance.name = " / ".join(option_values)
                    instance.save(update_fields=["name"])
        return instance


class ConsumerProductVariantSerializer(serializers.ModelSerializer):
    """Lightweight variant serializer for consumer product detail"""

    options = ProductVariantOptionSerializer(many=True, read_only=True)
    sale_price = serializers.SerializerMethodField()
    sale_discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "sku",
            "name",
            "base_price",
            "sale_price",
            "sale_discount_percentage",
            "stock_quantity",
            "is_in_stock",
            "is_low_stock",
            "display_order",
            "options",
        ]

    def get_sale_price(self, obj):
        # Variants inherit the parent product's sale from context
        sale_prices = self.context.get("sale_prices", {})
        product_id = str(obj.product_id)
        if product_id in sale_prices:
            sale, _, _ = sale_prices[product_id]
            return str(sale.calculate_sale_price(obj.base_price))
        return None

    def get_sale_discount_percentage(self, obj):
        sale_prices = self.context.get("sale_prices", {})
        product_id = str(obj.product_id)
        if product_id in sale_prices:
            sale, _, _ = sale_prices[product_id]
            sale_price = sale.calculate_sale_price(obj.base_price)
            if obj.base_price > 0:
                return int(((obj.base_price - sale_price) / obj.base_price) * 100)
        return 0


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
            "base_price",
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
            "base_price",
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
    has_variants = serializers.SerializerMethodField()
    min_variant_base_price = serializers.SerializerMethodField()
    sale_price = serializers.SerializerMethodField()
    sale_discount_percentage = serializers.SerializerMethodField()
    sale_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "short_description",
            "category",
            "base_price",
            "sale_price",
            "sale_discount_percentage",
            "sale_name",
            "stock_quantity",
            "is_low_stock",
            "is_in_stock",
            "unit",
            "unit_value",
            "is_featured",
            "is_active",
            "primary_image",
            "has_variants",
            "min_variant_base_price",
        ]

    def _get_sale_data(self, obj):
        sale_prices = self.context.get("sale_prices", {})
        return sale_prices.get(str(obj.id))

    def get_sale_price(self, obj):
        data = self._get_sale_data(obj)
        return str(data[1]) if data else None

    def get_sale_discount_percentage(self, obj):
        data = self._get_sale_data(obj)
        return data[2] if data else 0

    def get_sale_name(self, obj):
        data = self._get_sale_data(obj)
        return data[0].name if data else None

    def get_has_variants(self, obj):
        return obj.variants.filter(is_active=True).exists()

    def get_min_variant_base_price(self, obj):
        variant = obj.variants.filter(is_active=True).order_by("base_price").first()
        return str(variant.base_price) if variant else None

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
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = "__all__"


class ConsumerProductDetailsSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = ProductCategorySerializer(read_only=True)
    review_summary = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()
    variant_types = serializers.SerializerMethodField()
    has_variants = serializers.SerializerMethodField()

    sale_price = serializers.SerializerMethodField()
    sale_discount_percentage = serializers.SerializerMethodField()
    sale_name = serializers.SerializerMethodField()

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
            "base_price",
            "sale_price",
            "sale_discount_percentage",
            "sale_name",
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
            "review_summary",
            "has_variants",
            "variants",
            "variant_types",
        ]

    def _get_sale_data(self, obj):
        sale_prices = self.context.get("sale_prices", {})
        return sale_prices.get(str(obj.id))

    def get_sale_price(self, obj):
        data = self._get_sale_data(obj)
        return str(data[1]) if data else None

    def get_sale_discount_percentage(self, obj):
        data = self._get_sale_data(obj)
        return data[2] if data else 0

    def get_sale_name(self, obj):
        data = self._get_sale_data(obj)
        return data[0].name if data else None

    def get_has_variants(self, obj):
        return obj.variants.filter(is_active=True).exists()

    def get_variants(self, obj):
        active_variants = obj.variants.filter(is_active=True).prefetch_related(
            "options__variant_type"
        )
        # Pass sale_prices context so variants can compute their sale prices
        return ConsumerProductVariantSerializer(
            active_variants, many=True, context=self.context
        ).data

    def get_variant_types(self, obj):
        """Return the variant types used by this product's variants"""
        active_variants = obj.variants.filter(is_active=True)
        type_ids = (
            VariantOption.objects.filter(product_variants__in=active_variants)
            .values_list("variant_type_id", flat=True)
            .distinct()
        )
        types = VariantType.objects.filter(id__in=type_ids).prefetch_related("options")
        # Only include options that are actually used by this product's variants
        result = []
        for vt in types:
            used_options = VariantOption.objects.filter(
                variant_type=vt, product_variants__in=active_variants
            ).distinct()
            result.append(
                {
                    "id": str(vt.id),
                    "name": vt.name,
                    "options": [
                        {"id": str(o.id), "value": o.value} for o in used_options
                    ],
                }
            )
        return result

    def get_review_summary(self, obj):
        stats = obj.reviews.filter(is_approved=True, is_active=True).aggregate(
            average_rating=Avg("rating"),
            review_count=Count("id"),
        )
        return {
            "average_rating": round(stats["average_rating"], 1) if stats["average_rating"] else 0,
            "review_count": stats["review_count"],
        }


class ReviewUserSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class ProductReviewSerializer(serializers.ModelSerializer):
    user = ReviewUserSerializer(read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = ProductReview
        fields = [
            "id",
            "product",
            "product_name",
            "user",
            "rating",
            "title",
            "comment",
            "is_approved",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "is_approved", "created_at", "updated_at"]


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = ["product", "rating", "title", "comment"]

    def validate(self, attrs):
        user = self.context["request"].user
        product = attrs["product"]
        if ProductReview.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError(
                "You have already reviewed this product."
            )
        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
