from rest_framework import serializers
from players.models import Player


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [
            "id",
            "character_name",
            "balance",
            "health",
            "energy",
            "position_x",
            "position_y",
            "position_z",
            "last_seen",
            "created_at",
        ]
        read_only_fields = fields


class CreatePlayerSerializer(serializers.Serializer):
    character_name = serializers.CharField(max_length=50)


class UpdatePositionSerializer(serializers.Serializer):
    x = serializers.FloatField(min_value=-500, max_value=500)
    y = serializers.FloatField(min_value=0, max_value=100)
    z = serializers.FloatField(min_value=-500, max_value=500)