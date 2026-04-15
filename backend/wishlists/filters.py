from django_filters import rest_framework as filters
from django.db.models import Q

from wishlists.models import WishlistItem


class AdminWishlistFilter(filters.FilterSet):
    search = filters.CharFilter(method="filter_search")
    date_from = filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    date_to = filters.DateFilter(field_name="created_at", lookup_expr="date__lte")

    class Meta:
        model = WishlistItem
        fields = ["search", "date_from", "date_to"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(product__name__icontains=value)
            | Q(user__email__icontains=value)
            | Q(user__first_name__icontains=value)
            | Q(user__last_name__icontains=value)
        )
