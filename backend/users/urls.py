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
)

app_name = "users"

urlpatterns = [
    path("", UserListView.as_view(), name="user_list"),
    path("<uuid:id>/", UserDetailView.as_view(), name="user_detail"),
    path("<uuid:id>/status/", UserStatusUpdateView.as_view(), name="user_status_update"),
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
]
