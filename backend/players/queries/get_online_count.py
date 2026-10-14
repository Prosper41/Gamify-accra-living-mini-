from datetime import timedelta

from django.utils import timezone

from players.models import Player


def get_online_count():
    cutoff = timezone.now() - timedelta(seconds=60)

    return Player.objects.filter(
        last_seen__gte=cutoff
    ).count()