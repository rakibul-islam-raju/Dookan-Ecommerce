from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

from users.models import User, UserAddress

from .serializers import (
    UserListSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    UserAddressSerializer,
    UserAddressCreateSerializer,
)


class MeView(APIView):
    """
    Get current user profile
    GET /users/me/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
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
    User list endpoint
    GET /users/
    """

    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ["is_active", "is_staff", "is_superuser", "is_mobile_verified"]
    search_fields = ["=email", "=mobile_number", "^first_name", "^last_name"]
