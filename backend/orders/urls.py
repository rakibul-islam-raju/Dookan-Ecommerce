from django.urls import path
from .views import (
    OrderCreateView,
    OrderListView,
    OrderDetailView,
    OrderInvoiceDownloadView,
    MyOrdersView,
    OrderStatusUpdateView,
    OrderCancelView,
    GuestOrderOTPRequestView,
    GuestOrderTrackingView,
    GuestOrderDetailView,
    OrderPaymentUpdateView,
    ProductOrdersView,
)
from .dashboard import DashboardMetricsView

app_name = "orders"

urlpatterns = [
    # Dashboard
    path("dashboard/metrics/", DashboardMetricsView.as_view(), name="dashboard-metrics"),
    # Order management
    path("create/", OrderCreateView.as_view(), name="order-create"),
    path("", OrderListView.as_view(), name="order-list"),
    path(
        "<uuid:id>/status/",
        OrderStatusUpdateView.as_view(),
        name="order-update-status",
    ),
    path(
        "<uuid:id>/payment-status/",
        OrderPaymentUpdateView.as_view(),
        name="order-update-payment",
    ),
    path("<uuid:id>/invoice/", OrderInvoiceDownloadView.as_view(), name="order-invoice"),
    path("<uuid:id>/", OrderDetailView.as_view(), name="order-detail"),
    path("my-orders/", MyOrdersView.as_view(), name="my-orders"),
    path("<uuid:id>/cancel/", OrderCancelView.as_view(), name="order-cancel"),
    # Product orders (get all orders containing a specific product)
    path(
        "by-product/<uuid:product_id>/",
        ProductOrdersView.as_view(),
        name="orders-by-product",
    ),
    # Guest order tracking
    path(
        "guest-orders/request-otp/",
        GuestOrderOTPRequestView.as_view(),
        name="guest-order-request-otp",
    ),
    path(
        "guest-orders/track/",
        GuestOrderTrackingView.as_view(),
        name="guest-order-track",
    ),
    path(
        "guest-orders/<str:order_number>/",
        GuestOrderDetailView.as_view(),
        name="guest-order-detail",
    ),
]
