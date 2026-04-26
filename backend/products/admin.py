from django.contrib import admin

from .models import Category, Product, ProductImage, ProductVariant, VariantOption, VariantType


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    list_filter = ["name", "slug"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "vendor",
        "slug",
        "base_price",
        "total_stock",
        "is_digital",
        "is_active",
    ]
    list_filter = ["vendor", "is_digital", "is_featured", "is_active"]
    search_fields = ["name", "slug", "sku"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["total_stock"]
    autocomplete_fields = ["vendor", "category"]

    inlines = [ProductImageInline]


class VariantOptionInline(admin.TabularInline):
    model = VariantOption
    extra = 1


@admin.register(VariantType)
class VariantTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "display_order"]
    search_fields = ["name"]
    inlines = [VariantOptionInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ["product", "name", "sku", "base_price", "stock_quantity", "is_active"]
    list_filter = ["is_active", "product"]
    search_fields = ["name", "sku", "product__name"]
