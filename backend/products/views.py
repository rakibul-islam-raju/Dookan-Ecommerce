from rest_framework import filters
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from utils.permissions import HasModulePermission

from products.filters import ProductFilter
from products.models import (
    Category,
    Product,
    ProductImage,
    ProductReview,
    ProductVariant,
    VariantOption,
    VariantType,
)
from products.serializers import (
    CategorySerializer,
    CategoryCreateUpdateSerializer,
    ProductCreateSerializer,
    VendorProductListSerializer,
    ConsumerProductListSerializer,
    VendorProductDetailsSerializer,
    ConsumerProductDetailsSerializer,
    ProductImageSerializer,
    ProductImageUploadSerializer,
    ProductReviewSerializer,
    ProductReviewCreateSerializer,
    VariantTypeSerializer,
    VariantTypeCreateSerializer,
    VariantOptionSerializer,
    ProductVariantSerializer,
    ProductVariantCreateSerializer,
)


class CategoryCreateListAPIView(generics.ListCreateAPIView):
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["name"]
    filterset_fields = ["is_active", "parent"]

    def get_queryset(self):
        qs = Category.objects.all() if self.request.user.is_staff else Category.objects.filter(is_active=True)
        qs = qs.select_related("parent").prefetch_related("children")

        # Allow filtering for top-level categories (parent=null)
        if "parent__isnull" in self.request.query_params:
            is_null = self.request.query_params["parent__isnull"].lower() in ("true", "1")
            qs = qs.filter(parent__isnull=is_null)

        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CategoryCreateUpdateSerializer
        return CategorySerializer

    def get_permissions(self):
        if self.request.method == "GET":
            permission_classes = [AllowAny]
        else:
            permission_classes = [HasModulePermission("manage_categories")]
        return [permission() for permission in permission_classes]


class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.select_related("parent").prefetch_related("children").all()
    permission_classes = [HasModulePermission("manage_categories")]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CategoryCreateUpdateSerializer
        return CategorySerializer


class ProductCreateListAPIView(generics.ListCreateAPIView):
    filterset_class = ProductFilter

    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all().prefetch_related("images", "variants")
        return Product.objects.filter(is_active=True).prefetch_related(
            "images", "variants", "category__parent"
        )

    def get_permissions(self):
        if self.request.method == "GET":
            permission_classes = [AllowAny]
        else:
            permission_classes = [HasModulePermission("manage_products")]
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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == "GET" and not getattr(self.request.user, "is_staff", False):
            from sales.utils import get_sale_prices_bulk
            context["sale_prices"] = get_sale_prices_bulk(self.get_queryset())
        return context


class ProductDetailsAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).prefetch_related(
        "images", "variants__options__variant_type", "category__parent"
    )
    serializer_class = ConsumerProductDetailsSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        from sales.utils import get_sale_prices_bulk
        product = self.get_object()
        context["sale_prices"] = get_sale_prices_bulk(
            Product.objects.filter(id=product.id).select_related("category__parent")
        )
        return context


class ProductRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all().prefetch_related(
                "images", "variants__options__variant_type"
            )
        return Product.objects.filter(is_active=True).prefetch_related(
            "images", "variants__options__variant_type"
        )

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
            permission_classes = [HasModulePermission("manage_products")]
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
            permission_classes = [HasModulePermission("manage_products")]
        return [permission() for permission in permission_classes]


class ProductImageDestroyAPIView(generics.DestroyAPIView):
    queryset = ProductImage.objects.all()
    permission_classes = [HasModulePermission("manage_products")]


class ProductReviewListAPIView(generics.ListAPIView):
    """
    List approved reviews for a product (public)
    GET /products/<product_id>/reviews/
    """

    serializer_class = ProductReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ProductReview.objects.filter(
            product_id=self.kwargs["product_id"],
            is_approved=True,
            is_active=True,
        ).select_related("user", "product")


class ProductReviewCreateAPIView(generics.CreateAPIView):
    """
    Create a review for a product (authenticated users)
    POST /products/reviews/
    """

    serializer_class = ProductReviewCreateSerializer
    permission_classes = [IsAuthenticated]


class AdminReviewListAPIView(generics.ListAPIView):
    """
    List all reviews for admin moderation
    GET /products/reviews/admin/
    """

    serializer_class = ProductReviewSerializer
    permission_classes = [HasModulePermission("manage_reviews")]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ["is_approved", "is_active", "rating"]
    search_fields = ["product__name", "user__email", "title", "comment"]

    def get_queryset(self):
        return ProductReview.objects.all().select_related("user", "product")


class AdminReviewStatusUpdateAPIView(APIView):
    """
    Approve or reject a review (admin only)
    PATCH /products/reviews/<id>/status/
    """

    permission_classes = [HasModulePermission("manage_reviews")]

    def patch(self, request, pk):
        try:
            review = ProductReview.objects.select_related("user", "product").get(pk=pk)
        except ProductReview.DoesNotExist:
            return Response(
                {"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND
            )

        is_approved = request.data.get("is_approved")
        if is_approved is None:
            return Response(
                {"detail": "is_approved field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        review.is_approved = is_approved
        review.save(update_fields=["is_approved"])
        serializer = ProductReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminReviewDeleteAPIView(generics.DestroyAPIView):
    """
    Delete a review (admin only)
    DELETE /products/reviews/<id>/
    """

    queryset = ProductReview.objects.all()
    permission_classes = [HasModulePermission("manage_reviews")]


# ============================================================
# Variant Type Views
# ============================================================


class VariantTypeListCreateAPIView(generics.ListCreateAPIView):
    """
    List all variant types or create a new one (admin only)
    GET/POST /products/variant-types/
    """

    queryset = VariantType.objects.prefetch_related("options").all()
    permission_classes = [HasModulePermission("manage_products")]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == "POST":
            return VariantTypeCreateSerializer
        return VariantTypeSerializer


class VariantTypeRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update or delete a variant type (admin only)
    GET/PUT/PATCH/DELETE /products/variant-types/<id>/
    """

    queryset = VariantType.objects.prefetch_related("options").all()
    permission_classes = [HasModulePermission("manage_products")]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return VariantTypeCreateSerializer
        return VariantTypeSerializer


class VariantOptionListCreateAPIView(generics.ListCreateAPIView):
    """
    List or create options for a variant type (admin only)
    GET/POST /products/variant-types/<variant_type_id>/options/
    """

    serializer_class = VariantOptionSerializer
    permission_classes = [HasModulePermission("manage_products")]

    def get_queryset(self):
        return VariantOption.objects.filter(
            variant_type_id=self.kwargs["variant_type_id"]
        )

    def perform_create(self, serializer):
        serializer.save(variant_type_id=self.kwargs["variant_type_id"])


class VariantOptionDestroyAPIView(generics.DestroyAPIView):
    """
    Delete a variant option (admin only)
    DELETE /products/variant-options/<id>/
    """

    queryset = VariantOption.objects.all()
    permission_classes = [HasModulePermission("manage_products")]


# ============================================================
# Product Variant Views
# ============================================================


class ProductVariantListCreateAPIView(generics.ListCreateAPIView):
    """
    List or create variants for a product (admin only)
    GET/POST /products/<product_id>/variants/
    """

    permission_classes = [HasModulePermission("manage_products")]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductVariantCreateSerializer
        return ProductVariantSerializer

    def get_queryset(self):
        return ProductVariant.objects.filter(
            product_id=self.kwargs["product_id"]
        ).prefetch_related("options__variant_type")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["product_id"] = self.kwargs["product_id"]
        return context


class ProductVariantRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update or delete a product variant (admin only)
    GET/PUT/PATCH/DELETE /products/variants/<id>/
    """

    queryset = ProductVariant.objects.prefetch_related("options__variant_type").all()
    permission_classes = [HasModulePermission("manage_products")]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return ProductVariantCreateSerializer
        return ProductVariantSerializer
