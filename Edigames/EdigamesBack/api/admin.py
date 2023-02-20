from django.contrib import admin

from api.models import Game


@admin.register(Game)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('name', 'image', 'year', 'genre')
    list_display_links = ('name',)
    list_filter = ('year',)
    search_fields = ('name',)
