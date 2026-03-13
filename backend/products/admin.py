from django.contrib import admin

from .models import Category, Product, ProductImage


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
    list_display = ["name", "slug", "price", "stock_quantity", "is_active"]
    list_filter = ["name", "slug", "price", "stock_quantity", "is_active"]
    search_fields = ["name", "slug", "price", "stock_quantity", "is_active"]
    prepopulated_fields = {"slug": ("name",)}

    inlines = [ProductImageInline]
