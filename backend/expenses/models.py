from django.db import models
from django.utils.text import slugify

from utils.models import BaseModel


class ExpenseCategory(BaseModel):
    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.CASCADE,
        related_name="expense_categories",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "expense_categories"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "name"],
                name="unique_expense_category_per_vendor",
            )
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Expense(BaseModel):
    vendor = models.ForeignKey(
        "vendors.Vendor", on_delete=models.CASCADE, related_name="expenses"
    )
    category = models.ForeignKey(
        ExpenseCategory, on_delete=models.PROTECT, related_name="expenses"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    incurred_on = models.DateField()
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    production_batch = models.ForeignKey(
        "inventory.ProductionBatch",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
    )
    product_variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
    )

    class Meta:
        db_table = "expenses"
        ordering = ["-incurred_on", "-created_at"]
        indexes = [
            models.Index(fields=["vendor", "incurred_on"]),
            models.Index(fields=["category", "incurred_on"]),
        ]

