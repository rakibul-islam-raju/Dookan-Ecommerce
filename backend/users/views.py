from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

from users.models import User, UserAddress, Role
from utils.permissions import HasModulePermission

from .serializers import (
    UserListSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    UserAddressSerializer,
    UserAddressCreateSerializer,
    RoleSerializer,
    StaffListSerializer,
    StaffCreateSerializer,
    StaffUpdateSerializer,
)


class MeView(APIView):
    """
    Get current user profile
    GET /users/me/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserAddressesView(generics.ListCreateAPIView):
    """
    Get and create user addresses
    GET /users/profile/addresses/
    POST /users/profile/addresses/
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_default", "is_active"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserAddressCreateSerializer
        return UserAddressSerializer

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        # If this is the first address, set it as default
        is_first_address = not UserAddress.objects.filter(user=user).exists()
        if is_first_address:
            serializer.save(user=user, is_default=True)
        else:
            serializer.save(user=user)


class UserAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update and delete a user address
    GET /users/profile/addresses/<id>/
    PUT /users/profile/addresses/<id>/
    DELETE /users/profile/addresses/<id>/
    """

    serializer_class = UserAddressSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        # If setting this address as default, unset all other defaults
        if serializer.validated_data.get("is_default", False):
            UserAddress.objects.filter(user=self.request.user, is_default=True).update(
                is_default=False
            )
        serializer.save()


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile
    GET/PUT /users/profile/
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Change password endpoint
    POST /users/profile/change-password/
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data["new_password"])
            user.save()

            return Response(
                {"message": "Password changed successfully."}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    """
    User list endpoint (customers)
    GET /users/
    """

    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [HasModulePermission("manage_customers")]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ["is_active", "is_staff", "is_superuser", "is_mobile_verified"]
    search_fields = ["=email", "=mobile_number", "^first_name", "^last_name"]


class UserDetailView(generics.RetrieveAPIView):
    """
    Get user details (admin only)
    GET /users/<uuid:id>/
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasModulePermission("manage_customers")]
    lookup_field = "id"


class UserStatusUpdateView(APIView):
    """
    Toggle user active status (admin only)
    PATCH /users/<uuid:id>/status/
    """

    permission_classes = [HasModulePermission("manage_customers")]

    def patch(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        is_active = request.data.get("is_active")
        if is_active is None:
            return Response(
                {"detail": "is_active field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = is_active
        user.save(update_fields=["is_active"])
        serializer = UserListSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- Role Management ---


class RoleListCreateView(generics.ListCreateAPIView):
    """
    List and create roles
    GET/POST /users/roles/
    """

    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasModulePermission("manage_staff")]
    pagination_class = None


class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, delete a role
    GET/PUT/PATCH/DELETE /users/roles/<uuid:id>/
    """

    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasModulePermission("manage_staff")]
    lookup_field = "id"


# --- Staff Management ---


class StaffListCreateView(generics.ListCreateAPIView):
    """
    List and create staff members
    GET/POST /users/staff/
    """

    permission_classes = [HasModulePermission("manage_staff")]
    filter_backends = [filters.SearchFilter]
    search_fields = ["=email", "^first_name", "^last_name"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StaffCreateSerializer
        return StaffListSerializer

    def get_queryset(self):
        return User.objects.filter(is_staff=True)


class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, delete a staff member
    GET/PUT/PATCH/DELETE /users/staff/<uuid:id>/
    """

    permission_classes = [HasModulePermission("manage_staff")]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return StaffUpdateSerializer
        return StaffListSerializer

    def get_queryset(self):
        return User.objects.filter(is_staff=True)

    def perform_destroy(self, instance):
        if instance.is_superuser:
            from rest_framework.exceptions import ValidationError

            raise ValidationError("Cannot delete a superuser account.")
        instance.delete()
