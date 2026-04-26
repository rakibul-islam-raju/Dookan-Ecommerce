from dataclasses import dataclass

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.exceptions import ValidationError

from vendors.models import Vendor, VendorMembership


@dataclass(frozen=True)
class VendorContext:
    vendor: Vendor | None
    membership: VendorMembership | None
    permissions: list[str]
    enabled_features: list[str]


class StorefrontDisabled(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Storefront is currently disabled."
    default_code = "storefront_disabled"


def get_singleton_vendor(required=False):
    vendor = Vendor.objects.filter(is_active=True).order_by("created_at").first()
    if required and vendor is None:
        raise ValidationError("No active vendor configured.")
    return vendor


def get_active_vendor_membership(user, vendor_id=None):
    if not user or not user.is_authenticated:
        return None

    vendor = get_singleton_vendor(required=False)
    if not vendor:
        return None

    queryset = VendorMembership.objects.filter(
        user=user,
        is_active=True,
        vendor=vendor,
    ).select_related("vendor", "role")

    return queryset.order_by("-is_owner", "created_at").first()


def get_request_vendor(request, required=False):
    user = getattr(request, "user", None)

    vendor = get_singleton_vendor(required=required)
    if not vendor:
        return None

    if user and user.is_authenticated and user.is_superuser:
        return vendor

    membership = get_active_vendor_membership(user)
    if membership:
        return membership.vendor

    if required:
        raise ValidationError("No active vendor membership available.")
    return None


def get_request_vendor_membership(request):
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated or user.is_superuser:
        return None
    return get_active_vendor_membership(user)


def get_effective_permissions(user, membership=None):
    if not user or not user.is_authenticated:
        return []
    if user.is_superuser:
        from users.models import Role

        return Role.ALL_PERMISSIONS

    if membership and membership.is_owner:
        from users.models import Role

        return Role.ALL_PERMISSIONS

    if membership and membership.role:
        return membership.role.permissions or []

    return []


def get_vendor_context(request):
    user = getattr(request, "user", None)
    vendor = get_request_vendor(request)
    membership = get_request_vendor_membership(request)
    permissions = get_effective_permissions(user, membership=membership)

    enabled_features = []
    if vendor:
        if vendor.storefront_enabled:
            enabled_features.append("storefront")
        if vendor.inventory_enabled:
            enabled_features.append("inventory")
        if vendor.expenses_enabled:
            enabled_features.append("expenses")

    return VendorContext(
        vendor=vendor,
        membership=membership,
        permissions=permissions,
        enabled_features=enabled_features,
    )


def serialize_vendor_context(request):
    context = get_vendor_context(request)
    vendor = context.vendor
    membership = context.membership

    return {
        "active_vendor": (
            {
                "id": str(vendor.id),
                "name": vendor.name,
                "slug": vendor.slug,
            }
            if vendor
            else None
        ),
        "enabled_features": context.enabled_features,
        "inventory_mode": vendor.inventory_mode if vendor else None,
        "storefront_enabled": bool(vendor and vendor.storefront_enabled),
        "vendor_permissions": context.permissions,
        "is_vendor_owner": bool(membership and membership.is_owner),
    }


def filter_queryset_by_vendor(queryset, request, field_name="vendor"):
    vendor = get_request_vendor(request)
    user = getattr(request, "user", None)

    if not vendor:
        return queryset

    filter_kwargs = {field_name: vendor}

    if user and user.is_authenticated and user.is_superuser:
        return queryset.filter(**filter_kwargs)

    return queryset.filter(**filter_kwargs)


def is_backoffice_request(request):
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    return get_request_vendor_membership(request) is not None


def assert_storefront_enabled(request):
    if is_backoffice_request(request):
        return

    vendor = get_singleton_vendor(required=False)
    if vendor and not vendor.storefront_enabled:
        raise StorefrontDisabled()
