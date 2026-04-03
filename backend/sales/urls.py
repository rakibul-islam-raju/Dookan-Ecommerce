from django.urls import path

from .views import SaleListCreateView, SaleDetailView, ActiveSalesView

app_name = "sales"

urlpatterns = [
    path("", SaleListCreateView.as_view(), name="sale-list-create"),
    path("active/", ActiveSalesView.as_view(), name="sale-active"),
    path("<uuid:id>/", SaleDetailView.as_view(), name="sale-detail"),
]
