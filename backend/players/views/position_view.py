from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from players.commands.update_position import update_position
from players.serializers.player_serializer import (
    PlayerSerializer,
    UpdatePositionSerializer,
)


class PositionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = UpdatePositionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        player = update_position(
            user=request.user,
            **serializer.validated_data,
        )

        return Response(PlayerSerializer(player).data)