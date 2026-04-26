from django.db.models import Q
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from expenses.models import Expense, ExpenseCategory
from expenses.serializers import (
    ExpenseCategorySerializer,
    ExpenseSerializer,
    ExpenseSummarySerializer,
)
from utils.permissions import HasVendorModulePermission
from vendors.services import get_request_vendor


class ExpenseCategoryListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [HasVendorModulePermission("manage_expenses", "expenses_enabled")]

    def get_queryset(self):
        vendor = get_request_vendor(self.request, required=True)
        return ExpenseCategory.objects.filter(
            Q(vendor__isnull=True) | Q(vendor=vendor)
        ).order_by("name")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = get_request_vendor(self.request, required=True)
        return context


class ExpenseCategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [HasVendorModulePermission("manage_expenses", "expenses_enabled")]
    lookup_field = "id"

    def get_queryset(self):
        vendor = get_request_vendor(self.request, required=True)
        return ExpenseCategory.objects.filter(vendor=vendor)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = get_request_vendor(self.request, required=True)
        return context


class ExpenseListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [HasVendorModulePermission("manage_expenses", "expenses_enabled")]

    def get_queryset(self):
        vendor = get_request_vendor(self.request, required=True)
        queryset = Expense.objects.filter(vendor=vendor).select_related(
            "category",
            "production_batch",
            "product_variant__product",
        )
        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = get_request_vendor(self.request, required=True)
        return context


class ExpenseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [HasVendorModulePermission("manage_expenses", "expenses_enabled")]
    lookup_field = "id"

    def get_queryset(self):
        vendor = get_request_vendor(self.request, required=True)
        return Expense.objects.filter(vendor=vendor).select_related(
            "category",
            "production_batch",
            "product_variant__product",
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["vendor"] = get_request_vendor(self.request, required=True)
        return context


class ExpenseSummaryAPIView(APIView):
    permission_classes = [HasVendorModulePermission("manage_expenses", "expenses_enabled")]

    def get(self, request):
        vendor = get_request_vendor(request, required=True)
        serializer = ExpenseSummarySerializer.build(
            vendor,
            start_date=request.query_params.get("start_date"),
            end_date=request.query_params.get("end_date"),
        )
        return Response(serializer.data)
