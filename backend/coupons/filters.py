import django_filters

from .models import Coupon


class CouponFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(field_name="code", lookup_expr="icontains")
    discount_type = django_filters.ChoiceFilter(choices=Coupon.DISCOUNT_TYPE_CHOICES)
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = Coupon
        fields = ["search", "discount_type", "is_active"]
