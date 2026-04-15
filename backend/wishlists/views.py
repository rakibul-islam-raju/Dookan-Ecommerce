from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django_filters.rest_framework import DjangoFilterBackend

from utils.permissions import HasModulePermission
from wishlists.filters import AdminWishlistFilter
from wishlists.models import WishlistItem
from wishlists.serializers import (
    WishlistItemSerializer,
    WishlistItemCreateSerializer,
    AdminWishlistItemSerializer,
)


class WishlistListView(generics.ListAPIView):
    """
    List all wishlist items for the authenticated user.
    GET /api/v1/wishlists/
    """

    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related(
            "product", "product__category"
        )


class WishlistAddView(generics.CreateAPIView):
    """
    Add a product to the wishlist.
    POST /api/v1/wishlists/add/
    """

    serializer_class = WishlistItemCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        response_serializer = WishlistItemSerializer(item, context={"request": request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class WishlistRemoveView(APIView):
    """
    Remove a product from the wishlist by product ID.
    DELETE /api/v1/wishlists/remove/{product_id}/
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        deleted, _ = WishlistItem.objects.filter(
            user=request.user, product_id=product_id
        ).delete()

        if deleted == 0:
            return Response(
                {"detail": "Product not in wishlist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class WishlistToggleView(APIView):
    """
    Toggle a product in the wishlist (add if not present, remove if present).
    POST /api/v1/wishlists/toggle/
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response(
                {"detail": "product_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item = WishlistItem.objects.filter(user=request.user, product_id=product_id).first()

        if item:
            item.delete()
            return Response({"status": "removed"}, status=status.HTTP_200_OK)

        # Validate product exists
        from products.models import Product

        if not Product.objects.filter(id=product_id, is_active=True).exists():
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        WishlistItem.objects.create(user=request.user, product_id=product_id)
        return Response({"status": "added"}, status=status.HTTP_201_CREATED)


class AdminWishlistListView(generics.ListAPIView):
    """
    Admin: List all wishlist items across all users with search and filter.
    GET /api/v1/wishlists/admin/
    """

    serializer_class = AdminWishlistItemSerializer
    permission_classes = [HasModulePermission("manage_wishlists")]
    filter_backends = [DjangoFilterBackend]
    filterset_class = AdminWishlistFilter

    def get_queryset(self):
        return WishlistItem.objects.select_related(
            "user", "product", "product__category"
        ).order_by("-created_at")


class WishlistProductIdsView(APIView):
    """
    Get list of product IDs in the user's wishlist (lightweight endpoint for UI).
    GET /api/v1/wishlists/product-ids/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        product_ids = list(
            WishlistItem.objects.filter(user=request.user).values_list("product_id", flat=True)
        )
        return Response(product_ids)
