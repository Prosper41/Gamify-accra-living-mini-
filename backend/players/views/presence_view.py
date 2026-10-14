from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from players.commands.update_presence import update_presence
from players.queries.get_online_count import get_online_count


class HeartbeatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        player = update_presence(request.user)

        return Response({
            "status": "online",
            "last_seen": player.last_seen,
        })


class OnlineCountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "online_players": get_online_count()
        })