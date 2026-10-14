from django.urls import path

from players.views.player_view import PlayerView
from players.views.position_view import PositionView
from players.views.presence_view import HeartbeatView, OnlineCountView

urlpatterns = [
    path("me/", PlayerView.as_view(), name="player-me"),
    path("me/position/", PositionView.as_view(), name="player-position"),
    path("heartbeat/", HeartbeatView.as_view(), name="player-heartbeat"),
    path("online/", OnlineCountView.as_view(), name="online-count"),
]