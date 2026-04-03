from rest_framework import generics
from rest_framework.permissions import AllowAny

from utils.permissions import HasModulePermission

from .models import Sale
from .serializers import SaleSerializer, SaleListSerializer, ActiveSaleSerializer
from .utils import get_active_sales


class SaleListCreateView(generics.ListCreateAPIView):
    """List all sales or create a new sale (Admin only)."""

    permission_classes = [HasModulePermission("manage_sales")]

    def get_queryset(self):
        return Sale.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return SaleListSerializer
        return SaleSerializer


class SaleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a sale (Admin only)."""

    serializer_class = SaleSerializer
    permission_classes = [HasModulePermission("manage_sales")]
    queryset = Sale.objects.all()
    lookup_field = "id"


class ActiveSalesView(generics.ListAPIView):
    """Public endpoint returning currently active sales (for frontend banners/badges)."""

    serializer_class = ActiveSaleSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return get_active_sales()
