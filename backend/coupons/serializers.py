from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = [
            "id",
            "code",
            "description",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "max_discount_amount",
            "max_uses",
            "max_uses_per_user",
            "used_count",
            "valid_from",
            "valid_until",
            "is_active",
            "is_valid",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "used_count", "created_at", "updated_at"]

    def validate(self, attrs):
        valid_from = attrs.get("valid_from", getattr(self.instance, "valid_from", None))
        valid_until = attrs.get(
            "valid_until", getattr(self.instance, "valid_until", None)
        )

        if valid_from and valid_until and valid_from >= valid_until:
            raise serializers.ValidationError(
                {"valid_until": "End date must be after start date."}
            )

        discount_type = attrs.get(
            "discount_type", getattr(self.instance, "discount_type", None)
        )
        discount_value = attrs.get(
            "discount_value", getattr(self.instance, "discount_value", None)
        )

        if discount_type == "percentage" and discount_value and discount_value > 100:
            raise serializers.ValidationError(
                {"discount_value": "Percentage discount cannot exceed 100%."}
            )

        return attrs


class CouponListSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = [
            "id",
            "code",
            "description",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "max_discount_amount",
            "max_uses",
            "used_count",
            "valid_from",
            "valid_until",
            "is_active",
            "is_valid",
            "created_at",
        ]


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, attrs):
        code = attrs["code"].upper()
        subtotal = attrs["subtotal"]

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"code": "Invalid coupon code."})

        if not coupon.is_active:
            raise serializers.ValidationError({"code": "This coupon is no longer active."})

        now = timezone.now()
        if now < coupon.valid_from:
            raise serializers.ValidationError({"code": "This coupon is not yet valid."})
        if now > coupon.valid_until:
            raise serializers.ValidationError({"code": "This coupon has expired."})

        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            raise serializers.ValidationError(
                {"code": "This coupon has reached its usage limit."}
            )

        if subtotal < coupon.min_order_amount:
            raise serializers.ValidationError(
                {
                    "code": f"Minimum order amount of ৳{coupon.min_order_amount} required."
                }
            )

        # Check per-user limit
        request = self.context.get("request")
        if (
            request
            and request.user.is_authenticated
            and coupon.max_uses_per_user
        ):
            from orders.models import Order

            user_usage = Order.objects.filter(
                user=request.user, coupon=coupon
            ).exclude(status="cancelled").count()
            if user_usage >= coupon.max_uses_per_user:
                raise serializers.ValidationError(
                    {"code": "You have already used this coupon the maximum number of times."}
                )

        attrs["coupon"] = coupon
        attrs["discount_amount"] = coupon.calculate_discount(subtotal)
        return attrs
