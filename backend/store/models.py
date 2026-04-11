from django.db import models

from utils.models import BaseModel


class Announcement(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class SiteConfig(BaseModel):
    """Singleton model for site-wide configuration"""

    tagline = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    facebook_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to="site/", blank=True, null=True)
    meta_pixel_enabled = models.BooleanField(default=False)
    meta_pixel_id = models.CharField(max_length=32, blank=True)
    meta_capi_enabled = models.BooleanField(default=False)
    meta_access_token = models.TextField(blank=True)
    meta_test_event_code = models.CharField(max_length=100, blank=True)
    meta_default_currency = models.CharField(max_length=10, default="BDT")

    # Shipping & Tax Configuration
    inside_dhaka_delivery_charge = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=60,
        help_text="Delivery charge for orders within Dhaka city (BDT)",
    )
    outside_dhaka_delivery_charge = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=120,
        help_text="Delivery charge for orders outside Dhaka city (BDT)",
    )
    free_shipping_threshold = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=1000,
        help_text="Orders at or above this amount qualify for free shipping. Set to 0 to disable free shipping.",
    )
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Tax percentage applied to the order total (e.g. 5 means 5%). Set to 0 for no tax.",
    )

    class Meta:
        verbose_name = "Site Configuration"
        verbose_name_plural = "Site Configuration"

    def __str__(self):
        return "Site Configuration"

    def save(self, *args, **kwargs):
        # Ensure only one SiteConfig instance exists
        if not self.pk and SiteConfig.objects.exists():
            raise ValueError("Only one SiteConfig instance is allowed")
        return super().save(*args, **kwargs)


class Banner(BaseModel):
    """Model for offer/campaign banners with images"""

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="banners/")
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["display_order", "-created_at"]

    def __str__(self):
        return self.title
