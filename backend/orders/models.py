from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _

from coupons.models import Coupon
from products.models import Product
from users.models import User
from utils.models import BaseModel


class Order(BaseModel):
    """
    Order model for both registered and guest users
    """

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    )

    PAYMENT_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    )

    PAYMENT_METHOD_CHOICES = (
        ("cod", "Cash on Delivery"),
        ("online", "Online Payment"),
        ("card", "Card Payment"),
        ("upi", "UPI"),  # Unified Payments Interface
    )
    DELIVERY_TYPE_CHOICES = (
        ("inside_dhaka", "Inside Dhaka"),
        ("outside_dhaka", "Outside Dhaka"),
        ("free_delivery", "Free Delivery"),
    )

    order_number = models.CharField(max_length=20, unique=True, db_index=True)

    # Customer information
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    # For guest orders
    guest_mobile_number = models.CharField(max_length=17, db_index=True, blank=True)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField(blank=True)

    # Order details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending"
    )
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, default="cod"
    )
    delivery_charge = models.PositiveIntegerField(default=0)
    delivery_type = models.CharField(
        max_length=20, choices=DELIVERY_TYPE_CHOICES, default="inside_dhaka"
    )

    # COD shipping cost payment (advance payment for shipping)
    cod_shipping_transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text=_("Transaction ID for shipping cost payment on COD orders"),
    )
    cod_shipping_paid = models.BooleanField(
        default=False,
        help_text=_("Whether shipping cost has been paid for COD orders"),
    )

    # Coupon
    coupon = models.ForeignKey(
        Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    coupon_code = models.CharField(max_length=50, blank=True)

    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Notes
    customer_note = models.TextField(blank=True, null=True)
    admin_note = models.TextField(blank=True, null=True)

    # Timestamps
    confirmed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order_number"]),
            models.Index(fields=["user", "status"]),
            models.Index(fields=["guest_mobile_number", "created_at"]),
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["payment_status"]),
        ]

    def save(self, *args, **kwargs):
        if self.delivery_type == "free_delivery":
            self.delivery_charge = 0
        else:
            if self.delivery_type == "inside_dhaka":
                self.delivery_charge = 60
            else:
                self.delivery_charge = 120
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number}"

    @property
    def is_guest_order(self):
        return self.user is None


class OrderItem(BaseModel):
    """
    Individual items in an order
    """

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="order_items"
    )

    # Product snapshot at time of order
    product_name = models.CharField(max_length=200)
    product_sku = models.CharField(max_length=50)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "order_items"
        indexes = [
            models.Index(fields=["order", "product"]),
        ]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    def save(self, *args, **kwargs):
        # Auto-calculate total_price
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class ShippingAddress(BaseModel):
    """
    Shipping address for orders
    """

    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="shipping_address"
    )

    full_name = models.CharField(max_length=200)
    mobile_number = models.CharField(max_length=17)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="Bangladesh")

    class Meta:
        db_table = "shipping_addresses"

    def __str__(self):
        return f"{self.full_name} - {self.city}"


class OrderStatusHistory(BaseModel):
    """
    Track order status changes for audit trail
    """

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="status_history"
    )
    status = models.CharField(max_length=20)
    note = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        db_table = "order_status_history"
        ordering = ["-created_at"]
        verbose_name_plural = "Order status histories"

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"
