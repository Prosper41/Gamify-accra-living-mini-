from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .queries import get_available_items
from .serializers import (
    ShopItemSerializer,
    PurchaseRequestSerializer,
)
from .services import purchase_item


class ShopItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = get_available_items()

        return Response({
            "items": ShopItemSerializer(
                items,
                many=True,
            ).data
        })


class PurchaseItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseRequestSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        try:
            purchase, player = purchase_item(
                request.user,
                serializer.validated_data["item_id"],
            )
        except ValidationError as exc:
            return Response(
                {"error": exc.messages[0]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            from players.models import Player

            if isinstance(exc, Player.DoesNotExist):
                return Response(
                    {"error": "Player not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            raise

        return Response({
            "message": "Purchase successful!",
            "purchase_id": purchase.id,
            "item": purchase.item.name,
            "price_paid": purchase.price_paid,
            "balance": player.balance,
            "energy": player.energy,
        })