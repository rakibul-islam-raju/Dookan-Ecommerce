from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    LogoutView,
    EmailVerificationView,
    ResendVerificationView,
)

app_name = "authentication"

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("register/", UserRegistrationView.as_view(), name="user_registration"),
    path("verify-email/", EmailVerificationView.as_view(), name="verify_email"),
    path(
        "resend-verification/",
        ResendVerificationView.as_view(),
        name="resend_verification",
    ),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
