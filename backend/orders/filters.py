from django_filters import rest_framework as filters
from django.db.models import Q

from orders.models import Order


class OrderFilter(filters.FilterSet):
    order_number = filters.CharFilter(
        field_name="order_number", lookup_expr="icontains"
    )
    user = filters.CharFilter(field_name="user", lookup_expr="exact")
    status = filters.CharFilter(field_name="status", lookup_expr="exact")
    payment_status = filters.CharFilter(
        field_name="payment_status", lookup_expr="exact"
    )
    order_date = filters.DateFilter(field_name="created_at", lookup_expr="exact")
    order_date_from = filters.DateFilter(field_name="created_at", lookup_expr="gte")
    order_date_to = filters.DateFilter(field_name="created_at", lookup_expr="lte")

    search = filters.CharFilter(method="filter_search")

    class Meta:
        model = Order
        fields = [
            "order_number",
            "user",
            "status",
            "payment_status",
            "order_date",
            "order_date_from",
            "order_date_to",
            "search",
        ]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(order_number__icontains=value)
            | Q(user__first_name__icontains=value)
            | Q(user__last_name__icontains=value)
            | Q(user__email__icontains=value)
            | Q(user__mobile_number__icontains=value)
            | Q(guest_mobile_number__icontains=value)
            | Q(customer_name__icontains=value)
            | Q(customer_email__icontains=value)
        )
