from django.urls import path

from wishlists.views import (
    WishlistListView,
    WishlistAddView,
    WishlistRemoveView,
    WishlistToggleView,
    WishlistProductIdsView,
    AdminWishlistListView,
)

app_name = "wishlists"

urlpatterns = [
    path("", WishlistListView.as_view(), name="wishlist-list"),
    path("admin/", AdminWishlistListView.as_view(), name="admin-wishlist-list"),
    path("add/", WishlistAddView.as_view(), name="wishlist-add"),
    path("remove/<uuid:product_id>/", WishlistRemoveView.as_view(), name="wishlist-remove"),
    path("toggle/", WishlistToggleView.as_view(), name="wishlist-toggle"),
    path("product-ids/", WishlistProductIdsView.as_view(), name="wishlist-product-ids"),
]
