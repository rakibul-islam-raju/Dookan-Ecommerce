from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from utils.models import BaseModel


class MaterialCategory(BaseModel):
    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.CASCADE,
        related_name="material_categories",
    )
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "material_categories"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "name"],
                name="unique_material_category_per_vendor",
            )
        ]

    def __str__(self):
        return self.name


class Material(BaseModel):
    vendor = models.ForeignKey(
        "vendors.Vendor", on_delete=models.CASCADE, related_name="materials"
    )
    category = models.ForeignKey(
        MaterialCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="materials",
    )
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50)
    unit = models.CharField(max_length=20, default="unit")
    reorder_level = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    weighted_average_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    current_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    class Meta:
        db_table = "materials"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "sku"],
                name="unique_material_sku_per_vendor",
            )
        ]
        indexes = [
            models.Index(fields=["vendor", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.sku})"


class MaterialTransaction(BaseModel):
    TYPE_PURCHASE = "purchase"
    TYPE_ADJUSTMENT_IN = "adjustment_in"
    TYPE_ADJUSTMENT_OUT = "adjustment_out"
    TYPE_ISSUE_TO_BATCH = "issue_to_batch"
    TYPE_RETURN_FROM_BATCH = "return_from_batch"

    TYPE_CHOICES = (
        (TYPE_PURCHASE, "Purchase"),
        (TYPE_ADJUSTMENT_IN, "Adjustment In"),
        (TYPE_ADJUSTMENT_OUT, "Adjustment Out"),
        (TYPE_ISSUE_TO_BATCH, "Issue To Batch"),
        (TYPE_RETURN_FROM_BATCH, "Return From Batch"),
    )

    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.CASCADE,
        related_name="material_transactions",
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantity_change = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    reference_type = models.CharField(max_length=100, blank=True)
    reference_id = models.UUIDField(null=True, blank=True)
    note = models.TextField(blank=True)

    class Meta:
        db_table = "material_transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vendor", "material", "created_at"]),
            models.Index(fields=["transaction_type", "created_at"]),
        ]


class ProductionBatch(BaseModel):
    STATUS_DRAFT = "draft"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = (
        (STATUS_DRAFT, "Draft"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    )

    vendor = models.ForeignKey(
        "vendors.Vendor", on_delete=models.CASCADE, related_name="production_batches"
    )
    code = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "production_batches"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "code"],
                name="unique_batch_code_per_vendor",
            )
        ]

    def __str__(self):
        return self.code


class ProductionBatchMaterial(BaseModel):
    batch = models.ForeignKey(
        ProductionBatch, on_delete=models.CASCADE, related_name="materials"
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.PROTECT,
        related_name="batch_materials",
    )
    planned_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    actual_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    actual_unit_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    class Meta:
        db_table = "production_batch_materials"
        constraints = [
            models.UniqueConstraint(
                fields=["batch", "material"],
                name="unique_material_per_batch",
            )
        ]


class ProductionBatchOutput(BaseModel):
    batch = models.ForeignKey(
        ProductionBatch, on_delete=models.CASCADE, related_name="outputs"
    )
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.PROTECT,
        related_name="production_outputs",
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    class Meta:
        db_table = "production_batch_outputs"
        constraints = [
            models.UniqueConstraint(
                fields=["batch", "variant"],
                name="unique_variant_output_per_batch",
            )
        ]


class FinishedGoodsReceipt(BaseModel):
    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.CASCADE,
        related_name="finished_goods_receipts",
    )
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.PROTECT,
        related_name="finished_goods_receipts",
    )
    supplier_name = models.CharField(max_length=200, blank=True)
    reference = models.CharField(max_length=100, blank=True)
    received_at = models.DateTimeField()
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    supplier_unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    landed_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.TextField(blank=True)

    class Meta:
        db_table = "finished_goods_receipts"
        ordering = ["-received_at", "-created_at"]
        indexes = [
            models.Index(fields=["vendor", "received_at"]),
        ]


class VariantStockTransaction(BaseModel):
    TYPE_PURCHASE_RECEIPT = "purchase_receipt"
    TYPE_PRODUCTION_RECEIPT = "production_receipt"
    TYPE_ADJUSTMENT_IN = "adjustment_in"
    TYPE_ADJUSTMENT_OUT = "adjustment_out"
    TYPE_ORDER_SALE = "order_sale"
    TYPE_ORDER_CANCEL_RETURN = "order_cancel_return"

    TYPE_CHOICES = (
        (TYPE_PURCHASE_RECEIPT, "Purchase Receipt"),
        (TYPE_PRODUCTION_RECEIPT, "Production Receipt"),
        (TYPE_ADJUSTMENT_IN, "Adjustment In"),
        (TYPE_ADJUSTMENT_OUT, "Adjustment Out"),
        (TYPE_ORDER_SALE, "Order Sale"),
        (TYPE_ORDER_CANCEL_RETURN, "Order Cancel Return"),
    )

    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.CASCADE,
        related_name="variant_stock_transactions",
    )
    variant = models.ForeignKey(
        "products.ProductVariant",
        on_delete=models.CASCADE,
        related_name="stock_transactions",
    )
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantity_change = models.IntegerField()
    unit_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    balance_after = models.IntegerField()
    reference_type = models.CharField(max_length=100, blank=True)
    reference_id = models.UUIDField(null=True, blank=True)
    note = models.TextField(blank=True)

    class Meta:
        db_table = "variant_stock_transactions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vendor", "variant", "created_at"]),
            models.Index(fields=["transaction_type", "created_at"]),
        ]

