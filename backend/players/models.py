from django.conf import settings
from django.db import models


class Player(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="player",
    )

    character_name = models.CharField(max_length=50)
    balance = models.PositiveIntegerField(default=5000)
    health = models.PositiveSmallIntegerField(default=100)
    energy = models.PositiveSmallIntegerField(default=100)

    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    position_z = models.FloatField(default=0)

    last_seen = models.DateTimeField(null=
    True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.character_name
