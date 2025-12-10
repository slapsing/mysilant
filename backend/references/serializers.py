from rest_framework import serializers

from .models import ReferenceItem


class ReferenceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferenceItem
        fields = ("id", "category", "name", "description")
