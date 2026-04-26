from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify

from utils.models import BaseModel


class Vendor(BaseModel):
    INVENTORY_MODE_TRADING = "trading"
    INVENTORY_MODE_MANUFACTURING = "manufacturing"

    INVENTORY_MODE_CHOICES = (
        (INVENTORY_MODE_TRADING, "Trading"),
        (INVENTORY_MODE_MANUFACTURING, "Manufacturing"),
    )

    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, db_index=True, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_vendors",
    )
    inventory_enabled = models.BooleanField(default=False)
    expenses_enabled = models.BooleanField(default=True)
    storefront_enabled = models.BooleanField(default=True)
    inventory_mode = models.CharField(
        max_length=20,
        choices=INVENTORY_MODE_CHOICES,
        default=INVENTORY_MODE_TRADING,
    )
    meta_pixel_enabled = models.BooleanField(default=False)
    meta_capi_enabled = models.BooleanField(default=False)

    class Meta:
        db_table = "vendors"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["slug", "is_active"]),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        self.full_clean()
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()

        existing = Vendor.objects.exclude(pk=self.pk)
        if existing.exists():
            raise ValidationError("Only one vendor is allowed per deployment.")



class VendorMembership(BaseModel):
    vendor = models.ForeignKey(
        Vendor, on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vendor_memberships",
    )
    role = models.ForeignKey(
        "users.Role",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vendor_memberships",
    )
    is_owner = models.BooleanField(default=False)

    class Meta:
        db_table = "vendor_memberships"
        ordering = ["-is_owner", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "user"],
                name="unique_vendor_membership",
            )
        ]
        indexes = [
            models.Index(fields=["vendor", "user", "is_active"]),
            models.Index(fields=["user", "is_active"]),
        ]

    def __str__(self):
        return f"{self.user.email} @ {self.vendor.name}"
