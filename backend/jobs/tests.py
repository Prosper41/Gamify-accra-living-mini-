from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from jobs.models import DeliveryJob
from players.models import Player


class DeliveryJobTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="deliverytester",
            password="TestPassword123!",
        )

        self.player = Player.objects.create(
            user=self.user,
            character_name="Kofi",
            balance=5000,
            position_x=0,
            position_z=0,
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_player_can_start_delivery(self):
        response = self.client.post("/api/jobs/delivery/start/")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["delivery"]["reward"], 200)

    def test_player_cannot_start_two_active_deliveries(self):
        self.client.post("/api/jobs/delivery/start/")

        response = self.client.post("/api/jobs/delivery/start/")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            DeliveryJob.objects.filter(
                player=self.player,
                status=DeliveryJob.Status.ACTIVE,
            ).count(),
            1,
        )

    def test_player_must_be_near_pickup(self):
        self.player.position_x = 20
        self.player.save(update_fields=["position_x"])

        response = self.client.post("/api/jobs/delivery/start/")

        self.assertEqual(response.status_code, 400)

    def test_player_earns_200_after_delivery(self):
        self.client.post("/api/jobs/delivery/start/")

        self.player.position_x = 15
        self.player.position_z = 15
        self.player.save(update_fields=["position_x", "position_z"])

        response = self.client.post("/api/jobs/delivery/complete/")

        self.assertEqual(response.status_code, 200)

        self.player.refresh_from_db()
        self.assertEqual(self.player.balance, 5200)

    def test_player_cannot_claim_reward_twice(self):
        self.client.post("/api/jobs/delivery/start/")

        self.player.position_x = 15
        self.player.position_z = 15
        self.player.save(update_fields=["position_x", "position_z"])

        first_response = self.client.post("/api/jobs/delivery/complete/")
        second_response = self.client.post("/api/jobs/delivery/complete/")

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 400)

        self.player.refresh_from_db()
        self.assertEqual(self.player.balance, 5200)

    def test_player_cannot_complete_from_far_away(self):
        self.client.post("/api/jobs/delivery/start/")

        response = self.client.post("/api/jobs/delivery/complete/")

        self.assertEqual(response.status_code, 400)

        self.player.refresh_from_db()
        self.assertEqual(self.player.balance, 5000)