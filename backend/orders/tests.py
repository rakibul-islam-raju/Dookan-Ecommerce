from decimal import Decimal

from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from inventory.models import VariantStockTransaction
from products.models import Category, Product, ProductVariant
from store.models import SiteConfig
from users.models import User
from vendors.models import Vendor


@override_settings(SECURE_SSL_REDIRECT=False)
class OrderInventoryIntegrationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="customer@example.com",
            password="pass1234",
            first_name="Cust",
            last_name="Omer",
            mobile_number="+8801000000002",
            is_active=True,
            is_email_verified=True,
        )
        self.vendor = Vendor.objects.first()
        self.vendor.name = "Order Vendor"
        self.vendor.slug = "order-vendor"
        self.vendor.inventory_enabled = True
        self.vendor.expenses_enabled = True
        self.vendor.storefront_enabled = True
        self.vendor.save()
        self.category = Category.objects.create(name="Order Cat", slug="order-cat")
        self.product = Product.objects.create(
            vendor=self.vendor,
            name="Order Product",
            slug="order-product",
            sku="OP-001",
            category=self.category,
            base_price=Decimal("200.00"),
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku="OPV-001",
            name="Default",
            base_price=Decimal("200.00"),
            stock_quantity=5,
        )
        self.client.force_authenticate(self.user)

    def test_order_create_and_cancel_write_stock_transactions(self):
        create_response = self.client.post(
            reverse("orders:order-create"),
            {
                "customer_name": "Customer",
                "customer_email": "customer@example.com",
                "payment_method": "cod",
                "delivery_type": "inside_dhaka",
                "items": [
                    {
                        "product_id": str(self.product.id),
                        "variant_id": str(self.variant.id),
                        "quantity": 2,
                    }
                ],
                "shipping_address": {
                    "full_name": "Customer",
                    "mobile_number": "+8801000000002",
                    "address_line1": "123 Street",
                    "address_line2": "",
                    "city": "Dhaka",
                    "state": "Dhaka",
                    "postal_code": "1200",
                    "country": "Bangladesh",
                },
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        order_id = create_response.data["id"]
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 3)
        self.assertTrue(
            VariantStockTransaction.objects.filter(
                variant=self.variant,
                transaction_type=VariantStockTransaction.TYPE_ORDER_SALE,
            ).exists()
        )

        cancel_response = self.client.post(
            reverse("orders:order-cancel", kwargs={"id": order_id}),
            format="json",
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 5)
        self.assertTrue(
            VariantStockTransaction.objects.filter(
                variant=self.variant,
                transaction_type=VariantStockTransaction.TYPE_ORDER_CANCEL_RETURN,
            ).exists()
        )

    def test_order_totals_use_site_shipping_and_tax_config(self):
        site_config = SiteConfig.objects.first() or SiteConfig.objects.create()
        site_config.inside_dhaka_delivery_charge = Decimal("70.00")
        site_config.outside_dhaka_delivery_charge = Decimal("90.00")
        site_config.free_shipping_threshold = Decimal("1000.00")
        site_config.tax_rate = Decimal("5.00")
        site_config.save()

        response = self.client.post(
            reverse("orders:order-create"),
            {
                "customer_name": "Customer",
                "customer_email": "customer@example.com",
                "payment_method": "cod",
                "delivery_type": "outside_dhaka",
                "items": [
                    {
                        "product_id": str(self.product.id),
                        "variant_id": str(self.variant.id),
                        "quantity": 2,
                    }
                ],
                "shipping_address": {
                    "full_name": "Customer",
                    "mobile_number": "+8801000000002",
                    "address_line1": "123 Street",
                    "address_line2": "",
                    "city": "Dhaka",
                    "state": "Dhaka",
                    "postal_code": "1200",
                    "country": "Bangladesh",
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["subtotal"], "400.00")
        self.assertEqual(response.data["shipping_amount"], "90.00")
        self.assertEqual(response.data["tax_amount"], "20.00")
        self.assertEqual(response.data["total_amount"], "510.00")

    def test_order_invoice_download_returns_backend_generated_pdf_attachment(self):
        create_response = self.client.post(
            reverse("orders:order-create"),
            {
                "customer_name": "Customer",
                "customer_email": "customer@example.com",
                "payment_method": "cod",
                "delivery_type": "inside_dhaka",
                "items": [
                    {
                        "product_id": str(self.product.id),
                        "variant_id": str(self.variant.id),
                        "quantity": 1,
                    }
                ],
                "shipping_address": {
                    "full_name": "Customer",
                    "mobile_number": "+8801000000002",
                    "address_line1": "123 Street",
                    "address_line2": "",
                    "city": "Dhaka",
                    "state": "Dhaka",
                    "postal_code": "1200",
                    "country": "Bangladesh",
                },
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        order_id = create_response.data["id"]
        order_number = create_response.data["order_number"]

        response = self.client.get(
            reverse("orders:order-invoice", kwargs={"id": order_id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertIn("attachment;", response["Content-Disposition"])
        self.assertIn(f"invoice-{order_number}.pdf", response["Content-Disposition"])
        self.assertTrue(response.content.startswith(b"%PDF-1.4"))
        self.assertIn(order_number.encode("ascii"), response.content)

    def test_public_order_create_is_blocked_when_storefront_disabled(self):
        self.client.force_authenticate(user=None)
        self.vendor.storefront_enabled = False
        self.vendor.save(update_fields=["storefront_enabled"])

        response = self.client.post(
            reverse("orders:order-create"),
            {
                "customer_name": "Customer",
                "customer_email": "customer@example.com",
                "guest_mobile_number": "+8801000000002",
                "payment_method": "cod",
                "delivery_type": "inside_dhaka",
                "items": [
                    {
                        "product_id": str(self.product.id),
                        "variant_id": str(self.variant.id),
                        "quantity": 1,
                    }
                ],
                "shipping_address": {
                    "full_name": "Customer",
                    "mobile_number": "+8801000000002",
                    "address_line1": "123 Street",
                    "address_line2": "",
                    "city": "Dhaka",
                    "state": "Dhaka",
                    "postal_code": "1200",
                    "country": "Bangladesh",
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
