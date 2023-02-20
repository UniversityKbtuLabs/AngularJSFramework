from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


class Game(models.Model):
    name = models.CharField(max_length=200)
    image = models.CharField(max_length=200)
    year = models.IntegerField()
    genre = models.CharField(max_length=200)

    class StatusType(models.TextChoices):
        BUYED = 'B'
        NOT_BUYED = 'N'

    status = models.CharField(
        max_length=1,
        choices=StatusType.choices,
        default=StatusType.NOT_BUYED,
    )


class User(AbstractUser):
    username = models.CharField(max_length=200, unique=True)
    password = models.CharField(max_length=200)
    cart = models.ManyToManyField(Game)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
