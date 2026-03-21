from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum, Count, Q, Avg, F
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from orders.models import Order
from products.models import Product
from users.models import User


class DashboardMetricsView(APIView):
    """
    Dashboard metrics for admin panel.
    GET /api/v1/orders/dashboard/metrics/
    """

    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
        last_month_end = current_month_start - timedelta(microseconds=1)

        # -- Revenue metrics --
        paid_filter = Q(payment_status="paid")

        current_month_revenue = (
            Order.objects.filter(paid_filter, created_at__gte=current_month_start)
            .aggregate(total=Sum("total_amount"))["total"]
            or Decimal("0")
        )
        last_month_revenue = (
            Order.objects.filter(
                paid_filter,
                created_at__gte=last_month_start,
                created_at__lte=last_month_end,
            )
            .aggregate(total=Sum("total_amount"))["total"]
            or Decimal("0")
        )
        total_revenue = (
            Order.objects.filter(paid_filter).aggregate(total=Sum("total_amount"))["total"]
            or Decimal("0")
        )

        # -- Order metrics --
        total_orders = Order.objects.count()
        current_month_orders = Order.objects.filter(created_at__gte=current_month_start).count()
        last_month_orders = Order.objects.filter(
            created_at__gte=last_month_start, created_at__lte=last_month_end
        ).count()

        orders_by_status = dict(
            Order.objects.values_list("status").annotate(count=Count("id")).values_list("status", "count")
        )

        avg_order_value = (
            Order.objects.filter(paid_filter).aggregate(avg=Avg("total_amount"))["avg"]
            or Decimal("0")
        )

        # -- Customer metrics --
        total_customers = User.objects.filter(is_staff=False).count()
        new_customers_this_month = User.objects.filter(
            is_staff=False, created_at__gte=current_month_start
        ).count()
        new_customers_last_month = User.objects.filter(
            is_staff=False,
            created_at__gte=last_month_start,
            created_at__lte=last_month_end,
        ).count()

        # -- Product metrics --
        total_products = Product.objects.filter(is_active=True).count()
        low_stock_products = list(
            Product.objects.filter(
                is_active=True,
                track_inventory=True,
                stock_quantity__gt=0,
                stock_quantity__lte=F("low_stock_threshold"),
            ).values("id", "name", "slug", "stock_quantity", "low_stock_threshold")[:10]
        )
        out_of_stock_count = Product.objects.filter(
            is_active=True, track_inventory=True, stock_quantity=0
        ).count()

        # -- Recent orders --
        recent_orders = list(
            Order.objects.order_by("-created_at")[:5].values(
                "id",
                "order_number",
                "customer_name",
                "customer_email",
                "status",
                "payment_status",
                "total_amount",
                "created_at",
            )
        )

        return Response(
            {
                "revenue": {
                    "total": str(total_revenue),
                    "current_month": str(current_month_revenue),
                    "last_month": str(last_month_revenue),
                    "change_percent": _calc_change(last_month_revenue, current_month_revenue),
                },
                "orders": {
                    "total": total_orders,
                    "current_month": current_month_orders,
                    "last_month": last_month_orders,
                    "change_percent": _calc_change(last_month_orders, current_month_orders),
                    "by_status": orders_by_status,
                    "avg_order_value": str(avg_order_value.quantize(Decimal("0.01")) if isinstance(avg_order_value, Decimal) else Decimal("0")),
                },
                "customers": {
                    "total": total_customers,
                    "new_this_month": new_customers_this_month,
                    "new_last_month": new_customers_last_month,
                    "change_percent": _calc_change(
                        new_customers_last_month, new_customers_this_month
                    ),
                },
                "products": {
                    "total": total_products,
                    "out_of_stock": out_of_stock_count,
                    "low_stock": low_stock_products,
                },
                "recent_orders": recent_orders,
            }
        )


def _calc_change(old_value, new_value):
    """Calculate percentage change between two values."""
    if old_value == 0:
        return 100.0 if new_value > 0 else 0.0
    return round(float((new_value - old_value) / old_value) * 100, 1)
