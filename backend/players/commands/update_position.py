from django.db import transaction
from rest_framework.exceptions import NotFound

from players.models import Player


@transaction.atomic
def update_position(user, x, y, z):
    player = Player.objects.select_for_update().filter(user=user).first()

    if player is None:
        raise NotFound("Player not found.")

    player.position_x = x
    player.position_y = y
    player.position_z = z

    player.save(
        update_fields=["position_x", "position_y", "position_z"]
    )

    return player