from django.urls import path

from .views import (
    UserListView,
    UserDetailView,
    UserStatusUpdateView,
    MeView,
    UserProfileView,
    ChangePasswordView,
    UserAddressesView,
    UserAddressDetailView,
    RoleListCreateView,
    RoleDetailView,
    StaffListCreateView,
    StaffDetailView,
)

app_name = "users"

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("profile/", UserProfileView.as_view(), name="user_profile"),
    path("profile/addresses/", UserAddressesView.as_view(), name="user_addresses"),
    path(
        "profile/addresses/<uuid:id>/",
        UserAddressDetailView.as_view(),
        name="user_address_detail",
    ),
    path(
        "profile/change-password/", ChangePasswordView.as_view(), name="change_password"
    ),
    # Roles
    path("roles/", RoleListCreateView.as_view(), name="role_list_create"),
    path("roles/<uuid:id>/", RoleDetailView.as_view(), name="role_detail"),
    # Staff
    path("staff/", StaffListCreateView.as_view(), name="staff_list_create"),
    path("staff/<uuid:id>/", StaffDetailView.as_view(), name="staff_detail"),
    # Customers (admin)
    path("", UserListView.as_view(), name="user_list"),
    path("<uuid:id>/", UserDetailView.as_view(), name="user_detail"),
    path("<uuid:id>/status/", UserStatusUpdateView.as_view(), name="user_status_update"),
]
