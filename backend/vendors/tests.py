from django.core.exceptions import ValidationError
from django.test import TestCase

from users.models import User
from vendors.models import Vendor


class VendorSingletonTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com",
            password="pass1234",
            first_name="Owner",
            last_name="User",
            mobile_number="+8801000000100",
            is_active=True,
            is_email_verified=True,
            is_staff=True,
        )

    def test_only_one_vendor_is_allowed(self):
        vendor = Vendor.objects.first()
        vendor.name = "Primary Vendor"
        vendor.slug = "primary-vendor"
        vendor.owner = self.owner
        vendor.save()

        with self.assertRaises(ValidationError):
            Vendor.objects.create(
                name="Second Vendor",
                slug="second-vendor",
                owner=self.owner,
            )
