from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.views import APIView

from django_filters.rest_framework import DjangoFilterBackend

from .models import Coupon
from .filters import CouponFilter
from .serializers import CouponSerializer, CouponListSerializer, CouponValidateSerializer


class CouponListCreateView(generics.ListCreateAPIView):
    """
    List all coupons or create a new coupon (Admin only)
    """

    permission_classes = [IsAdminUser]
    filterset_class = CouponFilter
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        return Coupon.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return CouponListSerializer
        return CouponSerializer


class CouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a coupon (Admin only)
    """

    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]
    queryset = Coupon.objects.all()
    lookup_field = "id"


class CouponValidateView(APIView):
    """
    Validate a coupon code and return discount amount
    POST /api/v1/coupons/validate/
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CouponValidateSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            coupon = serializer.validated_data["coupon"]
            discount_amount = serializer.validated_data["discount_amount"]

            return Response(
                {
                    "valid": True,
                    "code": coupon.code,
                    "discount_type": coupon.discount_type,
                    "discount_value": str(coupon.discount_value),
                    "discount_amount": str(discount_amount),
                    "description": coupon.description,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
