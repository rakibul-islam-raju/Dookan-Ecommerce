from django.db import models

from utils.models import BaseModel
from users.models import User
from products.models import Product


class WishlistItem(BaseModel):
    """Individual wishlist item linking a user to a product."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="wishlisted_by")

    class Meta:
        db_table = "wishlist_items"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "product"], name="unique_user_product_wishlist"),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"
