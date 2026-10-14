from players.models import Player


def get_player(user):
    return Player.objects.filter(user=user).first()