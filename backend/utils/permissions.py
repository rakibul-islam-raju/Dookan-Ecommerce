from rest_framework.permissions import BasePermission

from vendors.services import get_effective_permissions, get_request_vendor, get_request_vendor_membership


class IsOwnerOrAdmin(BasePermission):
    """
    Custom permission: Owner of the order or admin can access
    """
    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin can access all orders
        if user.is_superuser:
            return True

        # User can access their own orders
        if obj.user and obj.user == user:
            return True

        membership = get_request_vendor_membership(request)
        vendor = get_request_vendor(request)
        permissions = get_effective_permissions(user, membership=membership)

        if vendor and ("manage_orders" in permissions or (membership and membership.is_owner)):
            return obj.items.filter(product__vendor=vendor).exists()

        return False


def HasModulePermission(permission_code):
    """
    Factory that returns a DRF permission class checking for a specific module permission.
    Superusers always pass. Staff must have the permission in their role.
    """
    class _HasModulePermission(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
            if user.is_superuser:
                return True
            membership = get_request_vendor_membership(request)
            if membership and membership.is_owner:
                return True
            if not user.is_staff and not membership:
                return False
            return permission_code in get_effective_permissions(user, membership=membership)

    _HasModulePermission.__name__ = f"HasModulePermission_{permission_code}"
    _HasModulePermission.__qualname__ = f"HasModulePermission_{permission_code}"
    return _HasModulePermission


def HasVendorModulePermission(permission_code, feature_flag=None):
    class _HasVendorModulePermission(BasePermission):
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False

            vendor = get_request_vendor(request)
            membership = get_request_vendor_membership(request)

            if user.is_superuser:
                if not vendor:
                    return False
                if feature_flag and not getattr(vendor, feature_flag, False):
                    return False
                return True

            if not membership or not vendor:
                return False

            if feature_flag and not getattr(vendor, feature_flag, False):
                return False

            if membership.is_owner:
                return True

            return permission_code in get_effective_permissions(
                user,
                membership=membership,
            )

    _HasVendorModulePermission.__name__ = f"HasVendorModulePermission_{permission_code}"
    _HasVendorModulePermission.__qualname__ = (
        f"HasVendorModulePermission_{permission_code}"
    )
    return _HasVendorModulePermission
