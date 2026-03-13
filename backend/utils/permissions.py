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
