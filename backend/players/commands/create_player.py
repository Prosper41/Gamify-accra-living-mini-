from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError

from players.models import Player


def create_player(user, character_name):
    if Player.objects.filter(user=user).exists():
        raise ValidationError({
            "detail": "You already have a player character."
        })

    try:
        with transaction.atomic():
            return Player.objects.create(
                user=user,
                character_name=character_name,
            )
    except IntegrityError:
        raise ValidationError({
            "detail": "You already have a player character."
        })