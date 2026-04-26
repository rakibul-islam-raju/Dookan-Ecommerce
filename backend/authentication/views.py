from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from utils.email import (
    send_password_reset_success_email,
    send_verification_otp_email,
    send_welcome_email,
)

from .serializers import (
    StorefrontTokenObtainPairSerializer,
    StaffTokenObtainPairSerializer,
    UserRegistrationSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Storefront customer login — POST /auth/login/"""

    permission_classes = [AllowAny]
    serializer_class = StorefrontTokenObtainPairSerializer
    throttle_scope = "auth_login"


class StaffLoginView(TokenObtainPairView):
    """Vendor staff login — POST /auth/staff/login/"""

    permission_classes = [AllowAny]
    serializer_class = StaffTokenObtainPairSerializer
    throttle_scope = "auth_login"


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    throttle_scope = "auth_refresh"


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint.
    Creates user and sends email verification OTP.
    POST /auth/register/
    """

    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    throttle_scope = "auth_register"

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data["message"] = (
            "Registration successful. Please check your email for verification OTP."
        )
        return response


class EmailVerificationView(APIView):
    """
    Verify email with OTP.
    POST /auth/verify-email/
    """

    permission_classes = [AllowAny]
    throttle_scope = "auth_verify_email"

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)

        if serializer.is_valid():
            otp = serializer.validated_data["otp"]
            email = serializer.validated_data["email"]

            # Mark OTP as verified
            otp.is_verified = True
            otp.save()

            # Activate user and mark email as verified
            try:
                user = User.objects.get(email=email)
                user.is_email_verified = True
                user.is_active = True
                user.save()

                send_welcome_email(
                    email=user.email,
                    user_name=f"{user.first_name} {user.last_name}".strip() or "there",
                )

                return Response(
                    {"message": "Email verified successfully. You can now login."},
                    status=status.HTTP_200_OK,
                )
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    """
    Resend verification email.
    POST /auth/resend-verification/
    """

    permission_classes = [AllowAny]
    throttle_scope = "auth_resend_verification"

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.user

            send_verification_otp_email(
                email=user.email,
                user_name=f"{user.first_name} {user.last_name}",
                purpose="registration",
            )

            return Response(
                {"message": "Verification email sent successfully."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    Request password reset OTP.
    POST /auth/password-reset/
    """

    permission_classes = [AllowAny]
    throttle_scope = "auth_password_reset"

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)

        if serializer.is_valid():
            user = getattr(serializer, "user", None)

            if user:
                send_verification_otp_email(
                    email=user.email,
                    user_name=f"{user.first_name} {user.last_name}",
                    purpose="password_reset",
                )

            # Always return success to prevent email enumeration
            return Response(
                {"message": "If an account with this email exists, a password reset OTP has been sent."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    Confirm password reset with OTP and set new password.
    POST /auth/password-reset/confirm/
    """

    permission_classes = [AllowAny]
    throttle_scope = "auth_password_reset_confirm"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
            otp = serializer.validated_data["otp"]

            # Mark OTP as verified
            otp.is_verified = True
            otp.save()

            # Set new password
            user.set_password(serializer.validated_data["new_password"])
            user.save()

            send_password_reset_success_email(
                email=user.email,
                user_name=f"{user.first_name} {user.last_name}".strip() or "there",
            )

            return Response(
                {"message": "Password reset successfully. You can now login with your new password."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Logout endpoint - blacklist refresh token
    POST /auth/logout/
    """

    permission_classes = [IsAuthenticated]
    throttle_scope = "auth_logout"

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logout successful."}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
