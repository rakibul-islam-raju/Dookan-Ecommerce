from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import (
    FinishedGoodsReceipt,
    Material,
    MaterialTransaction,
    ProductionBatch,
    VariantStockTransaction,
)
from inventory.serializers import (
    FinishedGoodsReceiptSerializer,
    MaterialSerializer,
    MaterialTransactionSerializer,
    ProductionBatchCompleteSerializer,
    ProductionBatchSerializer,
    VariantStockTransactionSerializer,
)
from products.models import ProductVariant
from utils.permissions import HasVendorModulePermission
from vendors.services import get_request_vendor


class ManufacturingModeMixin:
    def get_vendor(self):
        vendor = get_request_vendor(self.request, required=True)
        if vendor.inventory_mode != vendor.INVENTORY_MODE_MANUFACTURING:
            from rest_framework.exceptions import ValidationError

            raise ValidationError("This endpoint is only available for manufacturing vendors.")
        return vendor


class MaterialListCreateAPIView(ManufacturingModeMixin, generics.ListCreateAPIView):
    serializer_class = MaterialSerializer
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]

    def get_queryset(self):
        vendor = self.get_vendor()
        return Material.objects.filter(vendor=vendor).select_related("category")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = self.get_vendor()
        return context


class MaterialRetrieveUpdateDestroyAPIView(
    ManufacturingModeMixin, generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = MaterialSerializer
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]
    lookup_field = "id"

    def get_queryset(self):
        vendor = self.get_vendor()
        return Material.objects.filter(vendor=vendor).select_related("category")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = self.get_vendor()
        return context


class MaterialTransactionListCreateAPIView(
    ManufacturingModeMixin, generics.ListCreateAPIView
):
    serializer_class = MaterialTransactionSerializer
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]

    def get_queryset(self):
        vendor = self.get_vendor()
        return MaterialTransaction.objects.filter(vendor=vendor).select_related("material")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = self.get_vendor()
        return context


class ProductionBatchListCreateAPIView(ManufacturingModeMixin, generics.ListCreateAPIView):
    serializer_class = ProductionBatchSerializer
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]

    def get_queryset(self):
        vendor = self.get_vendor()
        return ProductionBatch.objects.filter(vendor=vendor).prefetch_related(
            "materials__material",
            "outputs__variant__product",
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        vendor = self.get_vendor()
        context["vendor"] = vendor
        context["variant_queryset"] = ProductVariant.objects.filter(product__vendor=vendor)
        return context


class ProductionBatchRetrieveUpdateDestroyAPIView(
    ManufacturingModeMixin, generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ProductionBatchSerializer
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]
    lookup_field = "id"

    def get_queryset(self):
        vendor = self.get_vendor()
        return ProductionBatch.objects.filter(vendor=vendor).prefetch_related(
            "materials__material",
            "outputs__variant__product",
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        vendor = self.get_vendor()
        context["vendor"] = vendor
        context["variant_queryset"] = ProductVariant.objects.filter(product__vendor=vendor)
        return context


class ProductionBatchCompleteAPIView(ManufacturingModeMixin, APIView):
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]

    def post(self, request, id):
        batch = get_object_or_404(
            ProductionBatch.objects.filter(vendor=self.get_vendor()),
            id=id,
        )
        serializer = ProductionBatchCompleteSerializer(data={}, context={"batch": batch})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response_serializer = ProductionBatchSerializer(
            batch,
            context={
                "request": request,
                "vendor": batch.vendor,
                "variant_queryset": ProductVariant.objects.filter(product__vendor=batch.vendor),
            },
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class FinishedGoodsReceiptListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = FinishedGoodsReceiptSerializer
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]

    def get_queryset(self):
        vendor = get_request_vendor(self.request, required=True)
        return FinishedGoodsReceipt.objects.filter(vendor=vendor).select_related(
            "variant__product"
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = get_request_vendor(self.request, required=True)
        return context


class FinishedGoodsReceiptRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = FinishedGoodsReceiptSerializer
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]
    lookup_field = "id"

    def get_queryset(self):
        vendor = get_request_vendor(self.request, required=True)
        return FinishedGoodsReceipt.objects.filter(vendor=vendor).select_related(
            "variant__product"
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = get_request_vendor(self.request, required=True)
        return context


class VariantStockTransactionListAPIView(generics.ListAPIView):
    serializer_class = VariantStockTransactionSerializer
    permission_classes = [HasVendorModulePermission("manage_inventory", "inventory_enabled")]

    def get_queryset(self):
        vendor = get_request_vendor(self.request, required=True)
        queryset = VariantStockTransaction.objects.filter(vendor=vendor).select_related(
            "variant__product"
        )
        variant_id = self.request.query_params.get("variant")
        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)
        return queryset
