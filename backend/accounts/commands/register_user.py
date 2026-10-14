from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError

User = get_user_model()


def register_user(username, email, password):
    if User.objects.filter(username=username).exists():
        raise ValidationError({"username": "Username already exists."})

    if User.objects.filter(email__iexact=email).exists():
        raise ValidationError({"email": "Email already exists."})

    try:
        validate_password(password)
    except Exception as exc:
        from django.core.exceptions import ValidationError as DjangoValidationError

        if isinstance(exc, DjangoValidationError):
            raise ValidationError({"password": exc.messages}) from exc
        raise

    return User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )