from rest_framework import serializers
from .models import ShopItem


class ShopItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopItem
        fields = [
            "id",
            "name",
            "price",
            "energy_restore",
        ]


class PurchaseRequestSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(min_value=1)