from django.db import IntegrityError, transaction

from jobs.models import DeliveryJob
from players.models import Player


PICKUP_X = 0.0
PICKUP_Z = 0.0
INTERACTION_RADIUS = 3.0


class DeliveryError(Exception):
    pass


def start_delivery(user):
    with transaction.atomic():
        player = Player.objects.select_for_update().get(user=user)

        if DeliveryJob.objects.filter(
            player=player,
            status=DeliveryJob.Status.ACTIVE,
        ).exists():
            raise DeliveryError("You already have an active delivery.")

        distance_squared = (
            (player.position_x - PICKUP_X) ** 2
            + (player.position_z - PICKUP_Z) ** 2
        )

        if distance_squared > INTERACTION_RADIUS ** 2:
            raise DeliveryError("Move closer to the delivery station.")

        try:
            return DeliveryJob.objects.create(
                player=player,
                pickup_x=PICKUP_X,
                pickup_z=PICKUP_Z,
                destination_x=15,
                destination_z=15,
                reward=200,
            )
        except IntegrityError:
            raise DeliveryError("You already have an active delivery.")