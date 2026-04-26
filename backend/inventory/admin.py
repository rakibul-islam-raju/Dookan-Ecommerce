from django.contrib import admin

from inventory.models import (
    FinishedGoodsReceipt,
    Material,
    MaterialCategory,
    MaterialTransaction,
    ProductionBatch,
    ProductionBatchMaterial,
    ProductionBatchOutput,
    VariantStockTransaction,
)


@admin.register(MaterialCategory)
class MaterialCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "vendor", "is_active"]
    list_filter = ["vendor", "is_active"]
    search_fields = ["name", "vendor__name"]
    autocomplete_fields = ["vendor"]


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "vendor",
        "sku",
        "unit",
        "current_quantity",
        "weighted_average_cost",
        "is_active",
    ]
    list_filter = ["vendor", "is_active"]
    search_fields = ["name", "sku", "vendor__name"]
    autocomplete_fields = ["vendor", "category"]


@admin.register(MaterialTransaction)
class MaterialTransactionAdmin(admin.ModelAdmin):
    list_display = [
        "material",
        "vendor",
        "transaction_type",
        "quantity_change",
        "unit_cost",
        "balance_after",
        "created_at",
    ]
    list_filter = ["vendor", "transaction_type"]
    search_fields = ["material__name", "material__sku", "note"]
    autocomplete_fields = ["vendor", "material"]


class ProductionBatchMaterialInline(admin.TabularInline):
    model = ProductionBatchMaterial
    extra = 0
    autocomplete_fields = ["material"]


class ProductionBatchOutputInline(admin.TabularInline):
    model = ProductionBatchOutput
    extra = 0
    autocomplete_fields = ["variant"]


@admin.register(ProductionBatch)
class ProductionBatchAdmin(admin.ModelAdmin):
    list_display = ["code", "vendor", "status", "started_at", "completed_at"]
    list_filter = ["vendor", "status"]
    search_fields = ["code", "vendor__name"]
    autocomplete_fields = ["vendor"]
    inlines = [ProductionBatchMaterialInline, ProductionBatchOutputInline]


@admin.register(FinishedGoodsReceipt)
class FinishedGoodsReceiptAdmin(admin.ModelAdmin):
    list_display = [
        "variant",
        "vendor",
        "quantity",
        "unit_cost",
        "total_cost",
        "received_at",
    ]
    list_filter = ["vendor", "received_at"]
    search_fields = ["variant__sku", "variant__product__name", "supplier_name", "reference"]
    autocomplete_fields = ["vendor", "variant"]


@admin.register(VariantStockTransaction)
class VariantStockTransactionAdmin(admin.ModelAdmin):
    list_display = [
        "variant",
        "vendor",
        "transaction_type",
        "quantity_change",
        "balance_after",
        "created_at",
    ]
    list_filter = ["vendor", "transaction_type"]
    search_fields = ["variant__sku", "variant__product__name", "note"]
    autocomplete_fields = ["vendor", "variant"]

