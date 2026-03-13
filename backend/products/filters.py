from django_filters import rest_framework as filters
from django.db.models import Q
from products.models import Product


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(field_name="category")
    is_active = filters.BooleanFilter(field_name="is_active")
    is_featured = filters.BooleanFilter(field_name="is_featured")
    is_in_stock = filters.BooleanFilter(field_name="is_in_stock")

    # search across name + short_description + description
    search = filters.CharFilter(method="filter_search")

    # price range
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")

    # ordering
    ordering = filters.OrderingFilter(
        fields=(
            ("price", "price"),
            ("created_at", "created_at"),
        )
    )

    class Meta:
        model = Product
        fields = [
            "category",
            "is_active",
            "is_featured",
            "min_price",
            "max_price",
        ]

    # -----------------------
    # Search by name + short_description + description
    # -----------------------
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value)
            | Q(short_description__icontains=value)
            | Q(description__icontains=value)
        )
