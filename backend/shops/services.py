from django.db import transaction
from django.core.exceptions import ValidationError

from players.models import Player
from .models import ShopItem, Purchase


@transaction.atomic
def purchase_item(user, item_id):
    player = Player.objects.select_for_update().get(user=user)

    try:
        item = ShopItem.objects.get(
            id=item_id,
            is_available=True,
        )
    except ShopItem.DoesNotExist:
        raise ValidationError("Item is unavailable.")

    if player.balance < item.price:
        raise ValidationError("Insufficient balance.")

    player.balance -= item.price
    player.energy = min(
        100,
        player.energy + item.energy_restore,
    )

    player.save(update_fields=["balance", "energy"])

    purchase = Purchase.objects.create(
        player=player,
        item=item,
        price_paid=item.price,
    )

    return purchase, player