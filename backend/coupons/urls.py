from django.urls import path

from .views import CouponListCreateView, CouponDetailView, CouponValidateView

app_name = "coupons"

urlpatterns = [
    path("", CouponListCreateView.as_view(), name="coupon-list-create"),
    path("validate/", CouponValidateView.as_view(), name="coupon-validate"),
    path("<uuid:id>/", CouponDetailView.as_view(), name="coupon-detail"),
]
