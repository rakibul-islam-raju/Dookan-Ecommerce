from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from django.utils.text import slugify

from utils.models import BaseModel


class Category(BaseModel):
    """
    Product categories
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(
        max_length=120, unique=True, db_index=True, blank=True, null=False
    )
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )
    image = models.ImageField(upload_to="categories/", null=True, blank=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = "categories"
        verbose_name_plural = "Categories"
        ordering = ["display_order", "name"]
        indexes = [
            models.Index(fields=["slug", "is_active"]),
            models.Index(fields=["parent", "is_active"]),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug or self.slug == "":
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(BaseModel):
    """
    Product model
    """

    UNIT_CHOICES = (
        ("kg", "Kilogram"),
        ("g", "Gram"),
        ("l", "Liter"),
        ("ml", "Milliliter"),
        ("piece", "Piece"),
        ("pack", "Pack"),
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(
        max_length=220, unique=True, db_index=True, blank=True, null=False
    )
    sku = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    short_description = models.CharField(max_length=300, blank=True, null=True)

    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )

    # Pricing
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Base price (MRP) before any sale discounts",
    )
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Cost price for profit calculation",
    )

    # Inventory
    stock_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10)
    track_inventory = models.BooleanField(default=True)

    # Product attributes
    weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Weight in grams",
    )
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="kg")
    unit_value = models.DecimalField(
        max_digits=10, decimal_places=2, default=1, help_text="e.g., 500 for 500g pack"
    )

    # SEO and meta
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True, null=True)

    # Status
    is_featured = models.BooleanField(default=False)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug", "is_active"]),
            models.Index(fields=["sku"]),
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["is_featured", "is_active"]),
            models.Index(fields=["base_price"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.unit_value}{self.unit})"

    def save(self, *args, **kwargs):
        # Slugify name if not provided
        if not self.slug or self.slug == "":
            self.slug = slugify(self.name)
        # Set default meta title if not provided
        if not self.meta_title:
            self.meta_title = self.name[:70]
        super().save(*args, **kwargs)

    @property
    def is_in_stock(self):
        if not self.track_inventory:
            return True
        return self.stock_quantity > 0

    @property
    def is_low_stock(self):
        if not self.track_inventory:
            return False
        return 0 < self.stock_quantity <= self.low_stock_threshold



class ProductImage(BaseModel):
    """
    Multiple images for each product
    """

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = "product_images"
        ordering = ["display_order", "-is_primary"]
        indexes = [
            models.Index(fields=["product", "is_primary"]),
        ]

    def save(self, *args, **kwargs):
        # Handle primary image
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(
                pk=self.pk
            ).update(is_primary=False)

        # Auto-assign display_order for new images
        if not self.pk:  # Only for new images
            # If display_order is 0 or not set, calculate next order
            if self.display_order == 0:
                max_order = ProductImage.objects.filter(product=self.product).aggregate(
                    models.Max("display_order")
                )["display_order__max"]

                self.display_order = (max_order or -1) + 1

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.product.name}"


class VariantType(BaseModel):
    """
    Reusable variant types (e.g., Size, Color, Weight, Flavor)
    """

    name = models.CharField(max_length=100, unique=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = "variant_types"
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name


class VariantOption(BaseModel):
    """
    Options for a variant type (e.g., Small, Medium, Large for Size)
    """

    variant_type = models.ForeignKey(
        VariantType, on_delete=models.CASCADE, related_name="options"
    )
    value = models.CharField(max_length=100)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = "variant_options"
        ordering = ["display_order", "value"]
        constraints = [
            models.UniqueConstraint(
                fields=["variant_type", "value"],
                name="unique_variant_option_per_type",
            ),
        ]

    def __str__(self):
        return f"{self.variant_type.name}: {self.value}"


class ProductVariant(BaseModel):
    """
    A specific purchasable variant of a product with its own SKU, price, and stock
    """

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="variants"
    )
    sku = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(
        max_length=200, blank=True, help_text="Auto-generated from options if blank"
    )

    # Pricing
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Base price (MRP) before any sale discounts",
    )
    cost_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    # Inventory
    stock_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=5)

    # Attributes
    weight = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, help_text="Weight in grams"
    )

    # Options that define this variant
    options = models.ManyToManyField(VariantOption, related_name="product_variants")

    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = "product_variants"
        ordering = ["display_order", "created_at"]
        indexes = [
            models.Index(fields=["product", "is_active"]),
            models.Index(fields=["sku"]),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.name or self.sku}"

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def is_low_stock(self):
        return 0 < self.stock_quantity <= self.low_stock_threshold

    def save(self, *args, **kwargs):
        # Auto-generate name from options if not provided
        if not self.name and self.pk:
            option_values = self.options.values_list("value", flat=True)
            if option_values:
                self.name = " / ".join(option_values)
        super().save(*args, **kwargs)


class ProductReview(BaseModel):
    """
    Customer product reviews with ratings
    """

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="reviews"
    )
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5",
    )
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        db_table = "product_reviews"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "user"],
                name="unique_product_review_per_user",
            ),
        ]
        indexes = [
            models.Index(fields=["product", "is_approved", "is_active"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"Review by {self.user.email} for {self.product.name} ({self.rating}/5)"
