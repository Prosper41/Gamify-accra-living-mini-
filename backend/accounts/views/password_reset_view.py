
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView


User = get_user_model()


class PasswordResetThrottle(AnonRateThrottle):
    scope = "password_reset"
    rate = "5/hour"


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        email = request.data.get("email")

        email_field = serializers.EmailField()

        try:
            email = email_field.run_validation(email)
        except serializers.ValidationError:
            return Response(
                {"email": ["Enter a valid email address."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = {
            "message": (
                "If an account exists with this email, "
                "a password reset link will be sent."
            )
        }

        user = User.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if user and user.has_usable_password():
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            frontend_url = settings.FRONTEND_URL.rstrip("/")

            reset_link = (
                f"{frontend_url}/reset-password"
                f"?uid={uid}&token={token}"
            )

            send_mail(
                subject="Reset Your Accra Life Mini Password",
                message=(
                    f"Hello {user.username},\n\n"
                    "We received a request to reset your password.\n\n"
                    "Click the link below to create a new password:\n\n"
                    f"{reset_link}\n\n"
                    "If you did not request this change, "
                    "you can safely ignore this email.\n\n"
                    "Accra Life Mini Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(message, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")

        if not all(
            isinstance(value, str) and value
            for value in (uid, token, password)
        ):
            return Response(
                {"error": "UID, token and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invalid_link = {
            "error": "Invalid or expired password reset link."
        }

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            User.DoesNotExist,
        ):
            return Response(
                invalid_link,
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                invalid_link,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(password, user=user)
        except DjangoValidationError as exc:
            return Response(
                {"password": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=["password"])

        return Response(
            {
                "message": (
                    "Password reset successful. "
                    "You can now log in."
                )
            },
            status=status.HTTP_200_OK,
        )
