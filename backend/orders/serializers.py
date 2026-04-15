import uuid
from decimal import Decimal

from django.utils import timezone
from django.db import transaction
from django.conf import settings

from rest_framework import serializers

from users.models import OTPVerification
from utils.email import send_order_confirmation_email
from coupons.models import Coupon
from products.models import ProductVariant
from .models import (
    Order,
    OrderItem,
    ShippingAddress,
    OrderStatusHistory,
    Product,
)


class ShippingAddressSerializer(serializers.ModelSerializer):
    """
    Shipping address serializer
    """

    class Meta:
        model = ShippingAddress
        fields = [
            "id",
            "full_name",
            "mobile_number",
            "address_line1",
            "address_line2",
            "city",
            "state",
            "postal_code",
            "country",
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Order item serializer with product details
    """

    product_id = serializers.UUIDField(write_only=True)
    variant_id = serializers.UUIDField(write_only=True)
    product_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_id",
            "variant_id",
            "product_name",
            "product_sku",
            "variant_name",
            "variant_sku",
            "unit_price",
            "quantity",
            "total_price",
            "sale_discount_amount",
            "sale_name",
            "product_details",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "product_sku",
            "variant_name",
            "variant_sku",
            "unit_price",
            "total_price",
            "sale_discount_amount",
            "sale_name",
        ]

    def get_product_details(self, obj):
        """
        Return basic product info
        """
        return {
            "id": str(obj.product.id),
            "name": obj.product.name,
            "slug": obj.product.slug,
            "image": (
                obj.product.images.filter(is_primary=True).first().image.url
                if obj.product.images.filter(is_primary=True).exists()
                else None
            ),
        }


class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Create order serializer for both registered and guest users
    """

    items = OrderItemSerializer(many=True, write_only=True)
    shipping_address = ShippingAddressSerializer(write_only=True)
    coupon_code = serializers.CharField(
        max_length=50, required=False, allow_blank=True, write_only=True
    )
    meta_event_id = serializers.CharField(
        required=False, allow_blank=True, write_only=True
    )

    class Meta:
        model = Order
        fields = [
            "customer_name",
            "customer_email",
            "guest_mobile_number",
            "payment_method",
            "customer_note",
            "items",
            "shipping_address",
            "delivery_type",
            "coupon_code",
            "meta_event_id",
        ]

    def validate_items(self, value):
        """
        Validate order items
        """
        if not value:
            raise serializers.ValidationError("At least one item is required.")

        for item in value:
            try:
                product = Product.objects.get(id=item["product_id"])
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    f"Product with id {item['product_id']} does not exist."
                )

            if not product.is_active:
                raise serializers.ValidationError(
                    f"Product '{product.name}' is not available."
                )

            variant_id = item.get("variant_id")
            if not variant_id:
                raise serializers.ValidationError(
                    f"variant_id is required for '{product.name}'."
                )

            try:
                variant = ProductVariant.objects.get(id=variant_id)
            except ProductVariant.DoesNotExist:
                raise serializers.ValidationError(
                    f"Variant with id {variant_id} does not exist."
                )

            if variant.product_id != product.id:
                raise serializers.ValidationError(
                    f"Variant {variant_id} does not belong to product '{product.name}'."
                )

            if not variant.is_active:
                raise serializers.ValidationError(
                    f"Variant '{variant.name}' is not available."
                )

            # Check stock (skip for digital products)
            if not product.is_digital and variant.stock_quantity < item["quantity"]:
                raise serializers.ValidationError(
                    f"Insufficient stock for '{product.name} - {variant.name}'. "
                    f"Available: {variant.stock_quantity}"
                )

        return value

    def validate(self, attrs):
        """
        Validate guest vs registered user order
        """
        request = self.context.get("request")

        # If user is authenticated, use user info
        if request and request.user.is_authenticated:
            attrs["user"] = request.user
            attrs["guest_mobile_number"] = ""
        else:
            # Guest order - mobile number is required
            if not attrs.get("guest_mobile_number"):
                raise serializers.ValidationError(
                    {
                        "guest_mobile_number": "Mobile number is required for guest orders."
                    }
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        """
        Create order with items and shipping address
        """
        items_data = validated_data.pop("items")
        shipping_data = validated_data.pop("shipping_address")
        coupon_code = validated_data.pop("coupon_code", "").strip().upper()
        validated_data.pop("meta_event_id", None)

        # Generate unique order number
        order_number = self._generate_order_number()

        # Calculate totals — apply sale prices per item
        from sales.utils import get_best_sale_for_product, get_active_sales

        subtotal = Decimal("0.00")
        order_items = []
        has_non_stackable_sale = False
        active_sales = list(get_active_sales())

        for item_data in items_data:
            product = Product.objects.select_related("category__parent").get(
                id=item_data["product_id"]
            )
            variant = ProductVariant.objects.get(id=item_data["variant_id"])
            quantity = item_data["quantity"]

            sale, sale_price = get_best_sale_for_product(product, active_sales)
            # Use variant's base_price as the reference price, apply same sale %
            if sale:
                discount_pct = (product.base_price - sale_price) / product.base_price
                variant_sale_price = variant.base_price * (1 - discount_pct)
                variant_sale_price = variant_sale_price.quantize(Decimal("0.01"))
            else:
                variant_sale_price = variant.base_price
            sale_discount_per_unit = variant.base_price - variant_sale_price
            unit_price = variant_sale_price
            total_price = unit_price * quantity

            subtotal += total_price

            if sale and not sale.allow_coupon_stacking:
                has_non_stackable_sale = True

            order_items.append(
                {
                    "product": product,
                    "variant": variant,
                    "product_name": product.name,
                    "product_sku": product.sku,
                    "variant_name": variant.name,
                    "variant_sku": variant.sku,
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "total_price": total_price,
                    "sale_discount_amount": sale_discount_per_unit,
                    "sale_name": sale.name if sale else "",
                }
            )

        # Apply coupon discount (only if no non-stackable sale blocks it)
        coupon = None
        discount_amount = Decimal("0.00")
        if coupon_code:
            if has_non_stackable_sale:
                raise serializers.ValidationError(
                    {
                        "coupon_code": (
                            "A coupon cannot be applied to orders containing items "
                            "with a non-stackable sale discount."
                        )
                    }
                )
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if coupon.is_valid:
                    # Check per-user limit
                    request = self.context.get("request")
                    can_use = True
                    if (
                        request
                        and request.user.is_authenticated
                        and coupon.max_uses_per_user
                    ):
                        user_usage = Order.objects.filter(
                            user=request.user, coupon=coupon
                        ).exclude(status="cancelled").count()
                        if user_usage >= coupon.max_uses_per_user:
                            can_use = False

                    if can_use:
                        discount_amount = coupon.calculate_discount(subtotal)
                        coupon.used_count += 1
                        coupon.save()
            except Coupon.DoesNotExist:
                pass  # Invalid coupon code silently ignored during order creation

        # Calculate tax and shipping (you can customize this logic)
        tax_rate = Decimal("0.00")  # 0% tax for now
        tax_amount = subtotal * tax_rate

        # Free shipping over certain amount, else flat rate
        shipping_amount = Decimal("0.00") if subtotal >= 1000 else Decimal("50.00")

        total_amount = subtotal - discount_amount + tax_amount + shipping_amount

        # Create order
        order = Order.objects.create(
            order_number=order_number,
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            coupon=coupon if discount_amount > 0 else None,
            coupon_code=coupon_code if discount_amount > 0 else "",
            **validated_data,
        )

        # Create order items and deduct variant stock
        for item_data in order_items:
            OrderItem.objects.create(order=order, **item_data)

            # Deduct variant stock (skip for digital products)
            product = item_data["product"]
            variant = item_data["variant"]
            if not product.is_digital:
                variant.stock_quantity -= item_data["quantity"]
                variant.save(update_fields=["stock_quantity"])

        # Create shipping address
        ShippingAddress.objects.create(order=order, **shipping_data)

        # Create initial status history
        OrderStatusHistory.objects.create(
            order=order, status="pending", note="Order created"
        )

        # Send order confirmation email
        if order.customer_email:
            send_order_confirmation_email(order)

        return order

    def _generate_order_number(self):
        """
        Generate unique order number: ORD-YYYYMMDD-XXXX
        """
        from datetime import datetime

        date_str = datetime.now().strftime("%Y%m%d")
        random_str = str(uuid.uuid4().hex)[:4].upper()
        return f"ORD-{date_str}-{random_str}"


class OrderDetailSerializer(serializers.ModelSerializer):
    """
    Detailed order serializer for reading
    """

    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = ShippingAddressSerializer(read_only=True)
    status_history = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "customer_name",
            "customer_email",
            "guest_mobile_number",
            "status",
            "payment_status",
            "payment_method",
            "coupon_code",
            "subtotal",
            "discount_amount",
            "tax_amount",
            "shipping_amount",
            "total_amount",
            "customer_note",
            "items",
            "shipping_address",
            "created_at",
            "updated_at",
            "confirmed_at",
            "shipped_at",
            "delivered_at",
            "status_history",
        )

    def get_status_history(self, obj):
        """
        Get order status history
        """
        history = obj.status_history.all()[:5]  # Last 5 status changes
        return [
            {
                "status": h.status,
                "note": h.note,
                "created_at": h.created_at,
                "created_by": h.created_by.email if h.created_by else "System",
            }
            for h in history
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """
    Simplified order list serializer
    """

    items_count = serializers.SerializerMethodField()
    is_guest_order = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "is_guest_order",
            "status",
            "payment_status",
            "total_amount",
            "items_count",
            "created_at",
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class OrderStatusUpdateSerializer(serializers.Serializer):
    """
    Update order status
    """

    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, value):
        """
        Validate status transition
        """
        order = self.context.get("order")
        current_status = order.status

        # Define valid status transitions
        valid_transitions = {
            "pending": ["confirmed", "cancelled"],
            "confirmed": ["processing", "cancelled"],
            "processing": ["shipped", "cancelled"],
            "shipped": ["delivered", "cancelled"],
            "delivered": ["refunded"],
            "cancelled": [],
            "refunded": [],
        }

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from '{current_status}' to '{value}'."
            )

        return value


class OrderPaymentUpdateSerializer(serializers.ModelSerializer):
    """
    Update order payment details (admin only)
    """

    class Meta:
        model = Order
        fields = [
            "payment_status",
            "cod_shipping_transaction_id",
            "cod_shipping_paid",
        ]


class GuestOrderOTPRequestSerializer(serializers.Serializer):
    """
    Request OTP for guest order tracking.
    """

    email = serializers.EmailField()

    def validate_email(self, value):
        """
        Validate that orders exist for this email.
        """
        if not Order.objects.filter(customer_email=value, user__isnull=True).exists():
            raise serializers.ValidationError("No guest orders found for this email.")
        return value


class GuestOrderTrackingSerializer(serializers.Serializer):
    """
    Guest order tracking with email OTP verification.
    """

    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        """
        Verify OTP before allowing order tracking.
        """
        email = attrs.get("email")
        otp_code = attrs.get("otp_code")

        try:
            otp = OTPVerification.objects.filter(
                email=email,
                otp_code=otp_code,
                purpose="guest_order",
                is_verified=False,
                expires_at__gt=timezone.now(),
            ).latest("created_at")

            # Check attempts
            if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
                raise serializers.ValidationError(
                    {"detail": "Maximum attempts exceeded. Please request a new OTP."}
                )

            # Verify OTP code
            if otp.otp_code != otp_code:
                otp.attempts += 1
                otp.save()
                raise serializers.ValidationError({"detail": "Invalid OTP code."})

            # Mark as verified
            otp.is_verified = True
            otp.save()

        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid or expired OTP."})

        return attrs
