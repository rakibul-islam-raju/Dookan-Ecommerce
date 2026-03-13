from rest_framework import filters
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from products.filters import ProductFilter
from products.models import Category, Product, ProductImage
from products.serializers import (
    CategorySerializer,
    ProductCreateSerializer,
    VendorProductListSerializer,
    ConsumerProductListSerializer,
    VendorProductDetailsSerializer,
    ConsumerProductDetailsSerializer,
    ProductImageSerializer,
    ProductImageUploadSerializer,
)


class CategoryCreateListAPIView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["name"]
    filterset_fields = ["is_active"]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Category.objects.all()
        return Category.objects.filter(is_active=True)

    def get_permissions(self):
        if self.request.method == "GET":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]


class ProductCreateListAPIView(generics.ListCreateAPIView):
    filterset_class = ProductFilter

    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all().prefetch_related("images")
        return Product.objects.filter(is_active=True).prefetch_related("images")

    def get_permissions(self):
        if self.request.method == "GET":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.request.method == "GET" and self.request.user.is_staff:
            return VendorProductListSerializer
        elif self.request.method == "GET" and (
            not self.request.user.is_staff or not self.request.user.is_authenticated
        ):
            return ConsumerProductListSerializer
        elif self.request.method == "POST":
            return ProductCreateSerializer
        return ProductCreateSerializer


class ProductDetailsAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).prefetch_related("images")
    serializer_class = ConsumerProductDetailsSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"


class ProductRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all().prefetch_related("images")
        return Product.objects.filter(is_active=True).prefetch_related("images")

    def get_serializer_class(self):
        if self.request.method == "GET" and self.request.user.is_staff:
            return VendorProductDetailsSerializer
        elif self.request.method == "GET" and (
            not self.request.user.is_staff or not self.request.user.is_authenticated
        ):
            return ConsumerProductDetailsSerializer
        elif self.request.method in ["PUT", "PATCH"]:
            return ProductCreateSerializer
        return ProductCreateSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class ProductImageListCreateAPIView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductImageUploadSerializer
        return ProductImageSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return ProductImage.objects.filter(product=self.kwargs["product_id"])
        return ProductImage.objects.filter(
            is_active=True, product=self.kwargs["product_id"]
        )

    def create(self, request, *args, **kwargs):
        product_id = self.kwargs.get("product_id")

        # Pass product_id in serializer context
        serializer = self.get_serializer(
            data=request.data, context={"product_id": product_id}
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_permissions(self):
        if self.request.method == "GET":
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class ProductImageDestroyAPIView(generics.DestroyAPIView):
    queryset = ProductImage.objects.all()
    permission_classes = [IsAdminUser]
