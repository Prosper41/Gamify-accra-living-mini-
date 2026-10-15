from .models import ShopItem


def get_available_items():
    return ShopItem.objects.filter(
        is_available=True
    ).order_by("price")