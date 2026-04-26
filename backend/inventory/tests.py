from decimal import Decimal

from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from expenses.models import Expense, ExpenseCategory
from inventory.models import (
    Material,
    MaterialCategory,
    ProductionBatch,
    ProductionBatchMaterial,
    ProductionBatchOutput,
    VariantStockTransaction,
)
from inventory.services import complete_production_batch
from products.models import Category, Product, ProductVariant
from users.models import Role, User
from vendors.models import Vendor, VendorMembership


@override_settings(SECURE_SSL_REDIRECT=False)
class InventoryBaseTestCase(APITestCase):
    def setUp(self):
        self.role = Role.objects.create(
            name="Inventory Manager",
            permissions=["manage_inventory", "manage_expenses", "manage_orders"],
        )
        self.user = User.objects.create_user(
            email="vendor@example.com",
            password="pass1234",
            first_name="Vendor",
            last_name="Owner",
            mobile_number="+8801000000000",
            is_active=True,
            is_email_verified=True,
            is_staff=True,
            role=self.role,
        )
        self.vendor = Vendor.objects.first()
        self.vendor.name = "Vendor A"
        self.vendor.slug = "vendor-a"
        self.vendor.owner = self.user
        self.vendor.inventory_enabled = True
        self.vendor.expenses_enabled = True
        self.vendor.storefront_enabled = True
        self.vendor.inventory_mode = Vendor.INVENTORY_MODE_TRADING
        self.vendor.save()
        VendorMembership.objects.create(
            vendor=self.vendor,
            user=self.user,
            role=self.role,
            is_owner=True,
        )
        self.category = Category.objects.create(name="Clothing", slug="clothing")
        self.product = Product.objects.create(
            vendor=self.vendor,
            name="Dress",
            slug="dress",
            sku="P-001",
            category=self.category,
            base_price=Decimal("1500.00"),
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku="V-001",
            name="Red / M",
            base_price=Decimal("1500.00"),
            stock_quantity=0,
        )
        self.client.force_authenticate(self.user)


class FinishedGoodsReceiptTests(InventoryBaseTestCase):
    def test_receipt_updates_variant_stock_and_cost(self):
        response = self.client.post(
            reverse("inventory:receipt-list-create"),
            {
                "variant": str(self.variant.id),
                "supplier_name": "ABC Sourcing",
                "reference": "INV-100",
                "received_at": timezone.now().isoformat(),
                "quantity": 10,
                "supplier_unit_cost": "500.00",
                "landed_cost": "250.00",
                "note": "Initial buy",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 10)
        self.assertEqual(self.variant.cost_price, Decimal("525.00"))
        self.assertTrue(
            VariantStockTransaction.objects.filter(
                variant=self.variant,
                transaction_type=VariantStockTransaction.TYPE_PURCHASE_RECEIPT,
            ).exists()
        )

    def test_trading_vendor_cannot_access_materials_endpoint(self):
        response = self.client.get(reverse("inventory:material-list-create"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_inventory_still_works_when_storefront_is_disabled(self):
        self.vendor.storefront_enabled = False
        self.vendor.save(update_fields=["storefront_enabled"])

        response = self.client.post(
            reverse("inventory:receipt-list-create"),
            {
                "variant": str(self.variant.id),
                "supplier_name": "ABC Sourcing",
                "reference": "INV-101",
                "received_at": timezone.now().isoformat(),
                "quantity": 2,
                "supplier_unit_cost": "400.00",
                "landed_cost": "0.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ProductionBatchTests(InventoryBaseTestCase):
    def setUp(self):
        super().setUp()
        self.vendor.inventory_mode = Vendor.INVENTORY_MODE_MANUFACTURING
        self.vendor.save(update_fields=["inventory_mode"])
        self.material_category = MaterialCategory.objects.create(
            vendor=self.vendor,
            name="Fabric",
        )
        self.material = Material.objects.create(
            vendor=self.vendor,
            category=self.material_category,
            name="Cotton",
            sku="MAT-001",
            unit="meter",
            current_quantity=Decimal("20.00"),
            weighted_average_cost=Decimal("100.00"),
        )
        self.expense_category = ExpenseCategory.objects.create(
            name="Labor / Making Cost",
            slug="labor-making-cost",
        )

    def test_batch_completion_updates_material_stock_and_finished_goods(self):
        batch = ProductionBatch.objects.create(vendor=self.vendor, code="BATCH-001")
        ProductionBatchMaterial.objects.create(
            batch=batch,
            material=self.material,
            actual_quantity=Decimal("4.00"),
        )
        ProductionBatchOutput.objects.create(
            batch=batch,
            variant=self.variant,
            quantity=2,
        )
        Expense.objects.create(
            vendor=self.vendor,
            category=self.expense_category,
            amount=Decimal("100.00"),
            incurred_on=timezone.now().date(),
            production_batch=batch,
        )

        complete_production_batch(batch)

        self.material.refresh_from_db()
        self.variant.refresh_from_db()
        batch.refresh_from_db()

        self.assertEqual(batch.status, ProductionBatch.STATUS_COMPLETED)
        self.assertEqual(self.material.current_quantity, Decimal("16.00"))
        self.assertEqual(self.variant.stock_quantity, 2)
        self.assertEqual(self.variant.cost_price, Decimal("250.00"))
