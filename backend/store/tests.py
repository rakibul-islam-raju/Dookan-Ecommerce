from decimal import Decimal

from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product, ProductVariant
from store.models import SiteConfig
from users.models import Role, User
from vendors.models import Vendor, VendorMembership


@override_settings(SECURE_SSL_REDIRECT=False)
class StorefrontGatingTests(APITestCase):
    def setUp(self):
        self.role = Role.objects.create(name="Manager", permissions=["manage_settings"])
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="pass1234",
            first_name="Admin",
            last_name="User",
            mobile_number="+8801000000101",
            is_active=True,
            is_email_verified=True,
            is_staff=True,
        )
        self.vendor = Vendor.objects.first()
        self.vendor.name = "Singleton Vendor"
        self.vendor.slug = "singleton-vendor"
        self.vendor.owner = self.admin_user
        self.vendor.storefront_enabled = False
        self.vendor.inventory_enabled = True
        self.vendor.expenses_enabled = True
        self.vendor.meta_pixel_enabled = True
        self.vendor.save()
        VendorMembership.objects.create(
            vendor=self.vendor,
            user=self.admin_user,
            role=self.role,
            is_owner=True,
        )
        self.site_config = SiteConfig.objects.create(
            tagline="Platform tagline",
            inside_dhaka_delivery_charge=60,
            outside_dhaka_delivery_charge=120,
            free_shipping_threshold=1000,
            tax_rate=0,
            meta_pixel_id="1234567890",
            meta_default_currency="BDT",
        )
        self.category = Category.objects.create(name="Category", slug="category")
        self.product = Product.objects.create(
            vendor=self.vendor,
            name="Dress",
            slug="dress-public",
            sku="P-STORE-1",
            category=self.category,
            base_price=Decimal("500.00"),
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku="V-STORE-1",
            name="Default",
            base_price=Decimal("500.00"),
            stock_quantity=5,
        )

    def test_public_storefront_endpoints_are_blocked_when_disabled(self):
        response = self.client.get(reverse("store:site-config"))
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

        response = self.client.get(reverse("products:product-list-create"))
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def test_admin_can_still_read_site_config_when_storefront_disabled(self):
        self.client.force_authenticate(self.admin_user)
        response = self.client.get(reverse("store:site-config"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["tagline"], "Platform tagline")

    def test_vendor_owner_can_update_site_config(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.patch(
            reverse("store:site-config"),
            {"tagline": "Updated by vendor owner"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.site_config.refresh_from_db()
        self.assertEqual(self.site_config.tagline, "Updated by vendor owner")

    def test_public_site_config_exposes_vendor_meta_fields(self):
        self.vendor.storefront_enabled = True
        self.vendor.save(update_fields=["storefront_enabled"])

        response = self.client.get(reverse("store:site-config"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["meta_pixel_enabled"])
        self.assertEqual(response.data["meta_pixel_id"], "1234567890")
        self.assertEqual(response.data["meta_default_currency"], "BDT")
