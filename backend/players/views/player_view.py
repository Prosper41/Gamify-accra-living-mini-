from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from players.commands.create_player import create_player
from players.queries.get_player import get_player
from players.serializers.player_serializer import (
    CreatePlayerSerializer,
    PlayerSerializer,
)


class PlayerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        player = get_player(request.user)

        if player is None:
            return Response(
                {"detail": "Player not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(PlayerSerializer(player).data)

    def post(self, request):
        serializer = CreatePlayerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        player = create_player(
            user=request.user,
            **serializer.validated_data,
        )

        return Response(
            PlayerSerializer(player).data,
            status=status.HTTP_201_CREATED,
        )