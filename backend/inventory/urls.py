from django.urls import path

from inventory.views import (
    FinishedGoodsReceiptListCreateAPIView,
    FinishedGoodsReceiptRetrieveAPIView,
    MaterialListCreateAPIView,
    MaterialRetrieveUpdateDestroyAPIView,
    MaterialTransactionListCreateAPIView,
    ProductionBatchCompleteAPIView,
    ProductionBatchListCreateAPIView,
    ProductionBatchRetrieveUpdateDestroyAPIView,
    VariantStockTransactionListAPIView,
)

app_name = "inventory"

urlpatterns = [
    path("materials/", MaterialListCreateAPIView.as_view(), name="material-list-create"),
    path(
        "materials/<uuid:id>/",
        MaterialRetrieveUpdateDestroyAPIView.as_view(),
        name="material-detail",
    ),
    path(
        "material-transactions/",
        MaterialTransactionListCreateAPIView.as_view(),
        name="material-transactions",
    ),
    path("batches/", ProductionBatchListCreateAPIView.as_view(), name="batch-list-create"),
    path(
        "batches/<uuid:id>/",
        ProductionBatchRetrieveUpdateDestroyAPIView.as_view(),
        name="batch-detail",
    ),
    path(
        "batches/<uuid:id>/complete/",
        ProductionBatchCompleteAPIView.as_view(),
        name="batch-complete",
    ),
    path("receipts/", FinishedGoodsReceiptListCreateAPIView.as_view(), name="receipt-list-create"),
    path(
        "receipts/<uuid:id>/",
        FinishedGoodsReceiptRetrieveAPIView.as_view(),
        name="receipt-detail",
    ),
    path(
        "variant-transactions/",
        VariantStockTransactionListAPIView.as_view(),
        name="variant-transactions",
    ),
]

