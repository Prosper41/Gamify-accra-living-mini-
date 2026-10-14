from django.db import transaction
from django.db.models import F
from django.utils import timezone

from jobs.models import DeliveryJob
from players.models import Player


INTERACTION_RADIUS = 3.0


class DeliveryCompletionError(Exception):
    pass


def complete_delivery(user):
    with transaction.atomic():
        player = Player.objects.select_for_update().get(user=user)

        delivery = (
            DeliveryJob.objects.select_for_update()
            .filter(
                player=player,
                status=DeliveryJob.Status.ACTIVE,
            )
            .first()
        )

        if delivery is None:
            raise DeliveryCompletionError("No active delivery found.")

        distance_squared = (
            (player.position_x - delivery.destination_x) ** 2
            + (player.position_z - delivery.destination_z) ** 2
        )

        if distance_squared > INTERACTION_RADIUS ** 2:
            raise DeliveryCompletionError(
                "Move closer to the delivery destination."
            )

        delivery.status = DeliveryJob.Status.COMPLETED
        delivery.completed_at = timezone.now()
        delivery.save(update_fields=["status", "completed_at"])

        Player.objects.filter(pk=player.pk).update(
            balance=F("balance") + delivery.reward
        )

        player.refresh_from_db(fields=["balance"])

        return delivery, player