from django.db import models
from players.models import Player


class DeliveryJob(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"

    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="delivery_jobs",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    reward = models.PositiveIntegerField(default=200)

    pickup_x = models.FloatField(default=0)
    pickup_z = models.FloatField(default=0)

    destination_x = models.FloatField(default=15)
    destination_z = models.FloatField(default=15)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["player"],
                condition=models.Q(status="active"),
                name="one_active_delivery_per_player",
            ),
        ]

    def __str__(self):
        return f"Delivery #{self.id} - {self.player.character_name}"