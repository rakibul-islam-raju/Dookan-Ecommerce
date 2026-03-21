from rest_framework.permissions import BasePermission


class IsOwnerOrAdmin(BasePermission):
    """
    Custom permission: Owner of the order or admin can access
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access all orders
        if request.user.is_staff:
            return True

        # User can access their own orders
        if obj.user and obj.user == request.user:
            return True

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
            if not user.is_staff or not user.role:
                return False
            return permission_code in (user.role.permissions or [])

    _HasModulePermission.__name__ = f"HasModulePermission_{permission_code}"
    _HasModulePermission.__qualname__ = f"HasModulePermission_{permission_code}"
    return _HasModulePermission
