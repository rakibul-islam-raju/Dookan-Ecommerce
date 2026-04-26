from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from users.models import User
from vendors.models import Vendor, VendorMembership
from utils.email import send_staff_invitation_email


class Command(BaseCommand):
    help = "Create a vendor owner account and send a password setup email"

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Owner's email address")
        parser.add_argument("--first-name", required=True, help="First name")
        parser.add_argument("--last-name", required=True, help="Last name")
        parser.add_argument("--mobile", required=True, help="Mobile number (e.g. +8801XXXXXXXXX)")

    def handle(self, *args, **options):
        email = options["email"]
        first_name = options["first_name"]
        last_name = options["last_name"]
        mobile = options["mobile"]

        if User.objects.filter(email=email).exists():
            raise CommandError(f"A user with email '{email}' already exists.")

        if User.objects.filter(mobile_number=mobile).exists():
            raise CommandError(f"A user with mobile '{mobile}' already exists.")

        vendor = Vendor.objects.filter(is_active=True).first()
        if not vendor:
            raise CommandError("No active vendor found. Create a vendor first.")

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                mobile_number=mobile,
                is_staff=True,
                is_active=True,
                is_email_verified=True,
            )

            if not vendor.owner:
                vendor.owner = user
                vendor.save(update_fields=["owner"])

            membership, created = VendorMembership.objects.get_or_create(
                vendor=vendor,
                user=user,
                defaults={"is_owner": True, "is_active": True},
            )
            if not created:
                membership.is_owner = True
                membership.is_active = True
                membership.save(update_fields=["is_owner", "is_active"])

            send_staff_invitation_email(
                email=user.email,
                user_name=f"{first_name} {last_name}".strip(),
            )

        self.stdout.write(self.style.SUCCESS(
            f"Vendor owner account created for {email}. "
            f"Password setup email sent."
        ))
