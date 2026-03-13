from django.urls import path

from .views import (
    CategoryCreateListAPIView,
    CategoryRetrieveUpdateDestroyAPIView,
    ProductCreateListAPIView,
    ProductDetailsAPIView,
    ProductRetrieveUpdateDestroyAPIView,
    ProductImageListCreateAPIView,
    ProductImageDestroyAPIView,
)

app_name = "products"

urlpatterns = [
    path(
        "categories/", CategoryCreateListAPIView.as_view(), name="category-list-create"
    ),
    path(
        "categories/<str:pk>/",
        CategoryRetrieveUpdateDestroyAPIView.as_view(),
        name="category-detail",
    ),
    path("", ProductCreateListAPIView.as_view(), name="product-list-create"),
    path(
        "images/<str:pk>/",
        ProductImageDestroyAPIView.as_view(),
        name="product-image-destroy",
    ),
    path(
        "slug/<str:slug>/",
        ProductDetailsAPIView.as_view(),
        name="product-detail",
    ),
    path(
        "<str:pk>/",
        ProductRetrieveUpdateDestroyAPIView.as_view(),
        name="product-detail",
    ),
    path(
        "<str:product_id>/images/",
        ProductImageListCreateAPIView.as_view(),
        name="product-image-list-create",
    ),
]
