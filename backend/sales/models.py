from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from utils.models import BaseModel


class Sale(BaseModel):
    DISCOUNT_TYPE_CHOICES = (
        ("percentage", "Percentage"),
        ("fixed_amount", "Fixed Amount"),
    )
    APPLIES_TO_CHOICES = (
        ("all_products", "All Products"),
        ("specific_categories", "Specific Categories"),
        ("specific_products", "Specific Products"),
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # Discount configuration
    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
        default="percentage",
    )
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Percentage (0-100) or fixed amount",
    )

    # Targeting
    applies_to = models.CharField(
        max_length=25,
        choices=APPLIES_TO_CHOICES,
        default="specific_products",
    )
    categories = models.ManyToManyField(
        "products.Category",
        blank=True,
        related_name="sales",
    )
    products = models.ManyToManyField(
        "products.Product",
        blank=True,
        related_name="sales",
    )

    # Scheduling
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()

    # Coupon stacking
    allow_coupon_stacking = models.BooleanField(
        default=True,
        help_text="Allow coupon codes to be applied on top of this sale discount",
    )

    class Meta:
        db_table = "sales"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "valid_from", "valid_until"]),
            models.Index(fields=["applies_to"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_discount_type_display()}: {self.discount_value})"

    @property
    def is_currently_active(self):
        now = timezone.now()
        return self.is_active and self.valid_from <= now <= self.valid_until

    def calculate_sale_price(self, base_price):
        """Calculate the sale price for a given base price."""
        if self.discount_type == "percentage":
            discount = base_price * (self.discount_value / Decimal("100"))
            sale_price = base_price - discount
        else:
            sale_price = base_price - self.discount_value

        return max(sale_price, Decimal("0.01")).quantize(Decimal("0.01"))
