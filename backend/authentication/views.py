from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from users.serializers import UserSerializer
from utils.email import send_verification_otp_email, send_welcome_email, send_password_reset_success_email

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view with additional user data
    POST /auth/login/
    """

    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint.
    Creates user and sends email verification OTP.
    POST /auth/register/
    """

    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

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
