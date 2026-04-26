from django.contrib import admin

from expenses.models import Expense, ExpenseCategory


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "vendor", "slug", "is_active"]
    list_filter = ["vendor", "is_active"]
    search_fields = ["name", "slug"]
    autocomplete_fields = ["vendor"]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = [
        "category",
        "vendor",
        "amount",
        "incurred_on",
        "production_batch",
        "product_variant",
        "is_active",
    ]
    list_filter = ["vendor", "category", "incurred_on", "is_active"]
    search_fields = ["reference", "notes", "product_variant__sku", "production_batch__code"]
    autocomplete_fields = ["vendor", "category", "production_batch", "product_variant"]

