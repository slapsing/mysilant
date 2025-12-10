from django.contrib import admin

from .models import ReferenceItem


@admin.register(ReferenceItem)
class ReferenceItemAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "name")
    list_filter = ("category",)
    search_fields = ("name", "description")
