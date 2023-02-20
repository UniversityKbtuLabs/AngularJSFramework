import datetime

from django.core.paginator import Paginator
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from api.models import Game, User
from api.serializers import GameSerializer, UserSerializer


class GetGamesByYearView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, year, number, page):
        games = Game.objects.all().filter(year=year)
        paginator = Paginator(games, number)
        page_obj = paginator.get_page(page)
        serializer = GameSerializer(page_obj, many=True)
        return Response(serializer.data)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'Успешно зарегестрированы'
        })


class UserView(APIView):
    def get(self, request):
        token = request.META['HTTP_AUTHORIZATION'].split()
        user = Token.objects.get(key=token[1]).user
        serializer = UserSerializer(user)

        return Response(serializer.data)


class LogoutView(APIView):
    def post(self, request):
        token_header = request.META['HTTP_AUTHORIZATION'].split()
        token = Token.objects.get(key=token_header[1])
        token.delete()
        return {
            'message': 'Вы вышли'
        }
