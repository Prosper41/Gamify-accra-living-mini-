from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.queries.get_current_user import get_current_user
from accounts.serializers.user_serializer import UserSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = get_current_user(request.user)
        return Response(UserSerializer(user).data)