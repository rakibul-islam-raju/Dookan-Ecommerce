from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product, ProductVariant
from store.meta_oauth import MetaGraphAPIError, list_existing_meta_pixels
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


@override_settings(
    SECURE_SSL_REDIRECT=False,
    META_APP_ID="app-id",
    META_APP_SECRET="app-secret",
    META_OAUTH_REDIRECT_URL="http://localhost:5173/store/settings/meta/callback",
    ADMIN_URL="http://localhost:5173",
)
class MetaOAuthTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.staff_user = User.objects.create_user(
            email="staff@example.com",
            password="pass1234",
            first_name="Staff",
            last_name="User",
            mobile_number="+8801000000202",
            is_active=True,
            is_email_verified=True,
            is_staff=True,
        )
        self.owner_user = User.objects.create_user(
            email="vendor-owner@example.com",
            password="pass1234",
            first_name="Vendor",
            last_name="Owner",
            mobile_number="+8801000000204",
            is_active=True,
            is_email_verified=True,
            is_staff=True,
        )
        self.other_superuser = User.objects.create_superuser(
            email="other@example.com",
            password="pass1234",
            first_name="Other",
            last_name="Owner",
            mobile_number="+8801000000203",
        )
        self.site_config = SiteConfig.objects.create(
            meta_pixel_id="1111111111",
            meta_access_token="existing-capi-token",
            meta_test_event_code="TEST123",
            meta_default_currency="BDT",
        )
        self.vendor = Vendor.objects.first()
        self.vendor.owner = self.owner_user
        self.vendor.save(update_fields=["owner"])
        VendorMembership.objects.create(
            vendor=self.vendor,
            user=self.owner_user,
            is_owner=True,
        )

    def test_oauth_start_requires_manage_settings(self):
        url = reverse("store:meta-oauth-start")

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(self.staff_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vendor_owner_oauth_start_returns_authorization_url_and_state(self):
        self.client.force_authenticate(self.owner_user)

        response = self.client.post(reverse("store:meta-oauth-start"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("authorization_url", response.data)
        self.assertIn("state", response.data)
        self.assertIn("client_id=app-id", response.data["authorization_url"])
        self.assertIn("state=", response.data["authorization_url"])

    def test_callback_rejects_missing_state(self):
        self.client.force_authenticate(self.owner_user)

        response = self.client.post(
            reverse("store:meta-oauth-callback"),
            {"code": "code", "state": "missing"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_callback_rejects_wrong_user_state(self):
        self.client.force_authenticate(self.owner_user)
        start_response = self.client.post(reverse("store:meta-oauth-start"))

        self.client.force_authenticate(self.other_superuser)
        response = self.client.post(
            reverse("store:meta-oauth-callback"),
            {"code": "code", "state": start_response.data["state"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("store.views.exchange_code_for_access_token", return_value="oauth-token")
    @patch("store.views.list_existing_meta_pixels")
    def test_callback_returns_normalized_pixel_options(self, mock_pixels, _mock_exchange):
        mock_pixels.return_value = [
            {
                "pixel_id": "2222222222",
                "pixel_name": "Main Pixel",
                "ad_account_id": "act_123",
                "ad_account_name": "Primary Ads",
                "business_id": "biz_1",
                "business_name": "Business",
            }
        ]
        self.client.force_authenticate(self.owner_user)
        start_response = self.client.post(reverse("store:meta-oauth-start"))

        response = self.client.post(
            reverse("store:meta-oauth-callback"),
            {"code": "code", "state": start_response.data["state"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pixels"], mock_pixels.return_value)

    @patch("store.views.exchange_code_for_access_token", return_value="oauth-token")
    @patch("store.views.list_existing_meta_pixels")
    def test_callback_returns_bad_gateway_for_meta_failure(self, mock_pixels, _mock_exchange):
        mock_pixels.side_effect = MetaGraphAPIError("Meta failed")
        self.client.force_authenticate(self.owner_user)
        start_response = self.client.post(reverse("store:meta-oauth-start"))

        response = self.client.post(
            reverse("store:meta-oauth-callback"),
            {"code": "code", "state": start_response.data["state"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)

    def test_pixel_select_saves_only_pixel_id(self):
        self.client.force_authenticate(self.owner_user)

        response = self.client.post(
            reverse("store:meta-pixel-select"),
            {"pixel_id": "3333333333"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.site_config.refresh_from_db()
        self.assertEqual(self.site_config.meta_pixel_id, "3333333333")
        self.assertEqual(self.site_config.meta_access_token, "existing-capi-token")
        self.assertEqual(self.site_config.meta_test_event_code, "TEST123")
        self.assertEqual(self.site_config.meta_default_currency, "BDT")

    def test_pixel_select_validates_pixel_id(self):
        self.client.force_authenticate(self.owner_user)

        response = self.client.post(
            reverse("store:meta-pixel-select"),
            {"pixel_id": "not-a-pixel"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("store.meta_oauth._request_json")
    def test_list_existing_meta_pixels_normalizes_accounts_and_pixels(self, mock_request_json):
        mock_request_json.return_value = {
            "data": [
                {
                    "id": "act_123",
                    "name": "Primary Ads",
                    "business": {"id": "biz_1", "name": "Business"},
                    "adspixels": {
                        "data": [
                            {"id": "4444444444", "name": "Primary Pixel"},
                            {"id": "5555555555", "name": "Backup Pixel"},
                        ]
                    },
                }
            ]
        }

        pixels = list_existing_meta_pixels("oauth-token")

        self.assertEqual(len(pixels), 2)
        self.assertEqual(pixels[0]["pixel_id"], "4444444444")
        self.assertEqual(pixels[0]["pixel_name"], "Primary Pixel")
        self.assertEqual(pixels[0]["ad_account_id"], "act_123")
        self.assertEqual(pixels[0]["business_name"], "Business")
