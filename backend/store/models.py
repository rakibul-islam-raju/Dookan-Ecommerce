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
