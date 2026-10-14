from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from players.models import Player
from jobs.commands.start_delivery import (
    DeliveryError,
    start_delivery,
)
from jobs.commands.complete_delivery import (
    DeliveryCompletionError,
    complete_delivery,
)
from jobs.queries.get_active_delivery import get_active_delivery


def serialize_delivery(delivery):
    return {
        "id": delivery.id,
        "status": delivery.status,
        "reward": delivery.reward,
        "pickup_x": delivery.pickup_x,
        "pickup_z": delivery.pickup_z,
        "destination_x": delivery.destination_x,
        "destination_z": delivery.destination_z,
    }


class ActiveDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        delivery = get_active_delivery(request.user)

        return Response({
            "delivery": (
                serialize_delivery(delivery)
                if delivery
                else None
            )
        })


class StartDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            delivery = start_delivery(request.user)
        except Player.DoesNotExist:
            return Response(
                {"detail": "Create a character first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except DeliveryError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"delivery": serialize_delivery(delivery)},
            status=status.HTTP_201_CREATED,
        )


class CompleteDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            delivery, player = complete_delivery(request.user)
        except Player.DoesNotExist:
            return Response(
                {"detail": "Create a character first."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except DeliveryCompletionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "message": "Delivery completed!",
            "reward": delivery.reward,
            "balance": player.balance,
            "delivery": serialize_delivery(delivery),
        })