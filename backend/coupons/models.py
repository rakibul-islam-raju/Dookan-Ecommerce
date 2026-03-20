from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

from utils.models import BaseModel


class Coupon(BaseModel):
    DISCOUNT_TYPE_CHOICES = (
        ("percentage", "Percentage"),
        ("fixed_amount", "Fixed Amount"),
    )

    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    discount_type = models.CharField(
        max_length=20, choices=DISCOUNT_TYPE_CHOICES, default="percentage"
    )
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Minimum order subtotal required to use this coupon",
    )
    max_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Maximum discount amount (for percentage coupons)",
    )
    max_uses = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum total uses. Leave blank for unlimited.",
    )
    max_uses_per_user = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum uses per user. Leave blank for unlimited.",
    )
    used_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()

    class Meta:
        db_table = "coupons"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["code"]),
            models.Index(fields=["valid_from", "valid_until"]),
        ]

    def __str__(self):
        return f"{self.code} ({self.get_discount_type_display()})"

    @property
    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from or now > self.valid_until:
            return False
        if self.max_uses and self.used_count >= self.max_uses:
            return False
        return True

    def calculate_discount(self, subtotal):
        """Calculate discount amount for a given subtotal."""
        from decimal import Decimal

        if subtotal < self.min_order_amount:
            return Decimal("0.00")

        if self.discount_type == "percentage":
            discount = subtotal * (self.discount_value / Decimal("100"))
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
        else:
            discount = min(self.discount_value, subtotal)

        return discount.quantize(Decimal("0.01"))
