from decimal import Decimal

from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from expenses.models import Expense, ExpenseCategory
from inventory.models import ProductionBatch
from users.models import Role, User
from vendors.models import Vendor, VendorMembership


@override_settings(SECURE_SSL_REDIRECT=False)
class ExpenseSummaryTests(APITestCase):
    def setUp(self):
        self.role = Role.objects.create(
            name="Expense Manager",
            permissions=["manage_expenses"],
        )
        self.user = User.objects.create_user(
            email="expense@example.com",
            password="pass1234",
            first_name="Expense",
            last_name="Manager",
            mobile_number="+8801000000001",
            is_active=True,
            is_email_verified=True,
            is_staff=True,
        )
        self.vendor = Vendor.objects.first()
        self.vendor.name = "Vendor Expense"
        self.vendor.slug = "vendor-expense"
        self.vendor.owner = self.user
        self.vendor.inventory_enabled = True
        self.vendor.expenses_enabled = True
        self.vendor.storefront_enabled = True
        self.vendor.inventory_mode = Vendor.INVENTORY_MODE_MANUFACTURING
        self.vendor.save()
        VendorMembership.objects.create(
            vendor=self.vendor,
            user=self.user,
            role=self.role,
            is_owner=True,
        )
        self.category = ExpenseCategory.objects.create(name="Advertising", slug="advertising")
        self.batch = ProductionBatch.objects.create(vendor=self.vendor, code="BATCH-EXP")
        Expense.objects.create(
            vendor=self.vendor,
            category=self.category,
            amount=Decimal("300.00"),
            incurred_on=timezone.now().date(),
            notes="General",
        )
        Expense.objects.create(
            vendor=self.vendor,
            category=self.category,
            amount=Decimal("200.00"),
            incurred_on=timezone.now().date(),
            production_batch=self.batch,
            notes="Batch linked",
        )
        self.client.force_authenticate(self.user)

    def test_summary_splits_general_and_batch_linked_totals(self):
        response = self.client.get(reverse("expenses:expense-summary"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_expense"], "500.00")
        self.assertEqual(response.data["batch_linked_total"], "200.00")
        self.assertEqual(response.data["general_total"], "300.00")
