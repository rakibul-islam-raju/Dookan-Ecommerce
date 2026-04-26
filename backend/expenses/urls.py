from django.urls import path

from expenses.views import (
    ExpenseCategoryListCreateAPIView,
    ExpenseCategoryRetrieveUpdateDestroyAPIView,
    ExpenseListCreateAPIView,
    ExpenseRetrieveUpdateDestroyAPIView,
    ExpenseSummaryAPIView,
)

app_name = "expenses"

urlpatterns = [
    path("categories/", ExpenseCategoryListCreateAPIView.as_view(), name="category-list-create"),
    path(
        "categories/<uuid:id>/",
        ExpenseCategoryRetrieveUpdateDestroyAPIView.as_view(),
        name="category-detail",
    ),
    path("entries/", ExpenseListCreateAPIView.as_view(), name="expense-list-create"),
    path(
        "entries/<uuid:id>/",
        ExpenseRetrieveUpdateDestroyAPIView.as_view(),
        name="expense-detail",
    ),
    path("reports/summary/", ExpenseSummaryAPIView.as_view(), name="expense-summary"),
]

