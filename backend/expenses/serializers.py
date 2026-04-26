from django.db.models import Sum
from rest_framework import serializers

from expenses.models import Expense, ExpenseCategory
from inventory.models import ProductionBatch
from products.models import ProductVariant


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ["id", "name", "slug", "description"]
        read_only_fields = ["id", "slug"]

    def create(self, validated_data):
        validated_data["vendor"] = self.context["vendor"]
        return super().create(validated_data)


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    product_name = serializers.CharField(source="product_variant.product.name", read_only=True, default=None)
    variant_name = serializers.CharField(source="product_variant.name", read_only=True, default=None)
    batch_code = serializers.CharField(source="production_batch.code", read_only=True, default=None)

    class Meta:
        model = Expense
        fields = [
            "id",
            "category",
            "category_name",
            "amount",
            "incurred_on",
            "reference",
            "notes",
            "production_batch",
            "batch_code",
            "product_variant",
            "product_name",
            "variant_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "category_name", "batch_code", "product_name", "variant_name"]

    def validate_category(self, value):
        vendor = self.context["vendor"]
        if value.vendor_id not in (None, vendor.id):
            raise serializers.ValidationError("Category does not belong to the active vendor.")
        return value

    def validate_production_batch(self, value):
        vendor = self.context["vendor"]
        if value and value.vendor_id != vendor.id:
            raise serializers.ValidationError("Batch does not belong to the active vendor.")
        return value

    def validate_product_variant(self, value):
        vendor = self.context["vendor"]
        if value and value.product.vendor_id != vendor.id:
            raise serializers.ValidationError("Variant does not belong to the active vendor.")
        return value

    def create(self, validated_data):
        validated_data["vendor"] = self.context["vendor"]
        return super().create(validated_data)


class ExpenseSummarySerializer(serializers.Serializer):
    total_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    by_category = serializers.ListField()
    batch_linked_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    general_total = serializers.DecimalField(max_digits=12, decimal_places=2)

    @classmethod
    def build(cls, vendor, *, start_date=None, end_date=None):
        queryset = Expense.objects.filter(vendor=vendor, is_active=True)
        if start_date:
            queryset = queryset.filter(incurred_on__gte=start_date)
        if end_date:
            queryset = queryset.filter(incurred_on__lte=end_date)

        total_expense = queryset.aggregate(total=Sum("amount"))["total"] or 0
        batch_linked_total = (
            queryset.filter(production_batch__isnull=False).aggregate(total=Sum("amount"))["total"] or 0
        )
        general_total = (
            queryset.filter(production_batch__isnull=True).aggregate(total=Sum("amount"))["total"] or 0
        )

        by_category = list(
            queryset.values("category__id", "category__name")
            .annotate(total=Sum("amount"))
            .order_by("category__name")
        )
        for item in by_category:
            item["category_id"] = str(item.pop("category__id"))
            item["category_name"] = item.pop("category__name")
            item["total"] = str(item["total"])

        return cls(
            {
                "total_expense": total_expense,
                "by_category": by_category,
                "batch_linked_total": batch_linked_total,
                "general_total": general_total,
            }
        )

