from django.db import models
from players.models import Player


class ShopItem(models.Model):
    name = models.CharField(max_length=100, unique=True)
    price = models.PositiveIntegerField()
    energy_restore = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Purchase(models.Model):
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="purchases",
    )
    item = models.ForeignKey(
        ShopItem,
        on_delete=models.PROTECT,
    )
    price_paid = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]