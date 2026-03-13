from django.contrib import admin
from .models import Order, OrderItem, ShippingAddress, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "product_sku", "unit_price", "total_price")
    can_delete = False


class ShippingAddressInline(admin.StackedInline):
    model = ShippingAddress
    extra = 0
    can_delete = False


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ("status", "note", "created_by", "created_at")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    date_hierarchy = "created_at"
    list_display = [
        "order_number",
        "customer_name",
        "status",
        "payment_status",
        "payment_method",
        "cod_shipping_paid",
        "total_amount",
        "created_at",
    ]
    list_filter = [
        "status",
        "payment_status",
        "payment_method",
        "cod_shipping_paid",
        "created_at",
    ]
    search_fields = [
        "order_number",
        "customer_name",
        "customer_email",
        "guest_mobile_number",
    ]
    readonly_fields = [
        "order_number",
        "subtotal",
        "tax_amount",
        "shipping_amount",
        "total_amount",
        "created_at",
        "updated_at",
    ]
    inlines = [OrderItemInline, ShippingAddressInline, OrderStatusHistoryInline]

    fieldsets = (
        (
            "Order Information",
            {
                "fields": (
                    "order_number",
                    "user",
                    "status",
                    "payment_status",
                    "payment_method",
                    "delivery_type",
                    "delivery_charge",
                )
            },
        ),
        (
            "COD Shipping Payment",
            {
                "fields": (
                    "cod_shipping_paid",
                    "cod_shipping_transaction_id",
                ),
                "description": "For COD orders: Record shipping cost payment before confirming the order.",
            },
        ),
        (
            "Customer Information",
            {"fields": ("customer_name", "customer_email", "guest_mobile_number")},
        ),
        (
            "Pricing",
            {
                "fields": (
                    "subtotal",
                    "discount_amount",
                    "tax_amount",
                    "shipping_amount",
                    "total_amount",
                )
            },
        ),
        ("Notes", {"fields": ("customer_note", "admin_note")}),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                    "confirmed_at",
                    "shipped_at",
                    "delivered_at",
                )
            },
        ),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "product_name",
        "quantity",
        "unit_price",
        "total_price",
    ]
    list_filter = ["created_at"]
    search_fields = ["order__order_number", "product_name", "product_sku"]
    readonly_fields = ["total_price"]
