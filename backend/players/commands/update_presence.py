from django.utils import timezone
from rest_framework.exceptions import NotFound

from players.models import Player


def update_presence(user):
    player = Player.objects.filter(user=user).first()

    if player is None:
        raise NotFound("Player not found.")

    player.last_seen = timezone.now()
    player.save(update_fields=["last_seen"])

    return player