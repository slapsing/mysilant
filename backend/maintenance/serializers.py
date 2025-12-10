from machines.models import Machine
from machines.serializers import MachineShortSerializer
from references.models import ReferenceItem
from references.serializers import ReferenceItemSerializer
from rest_framework import serializers
from users.serializers import UserShortSerializer

from .models import Maintenance


class MaintenanceSerializer(serializers.ModelSerializer):
    maintenance_type = ReferenceItemSerializer(read_only=True)
    service_organization = ReferenceItemSerializer(read_only=True)
    machine = MachineShortSerializer(read_only=True)
    service_company = UserShortSerializer(read_only=True)


    maintenance_type_id = serializers.PrimaryKeyRelatedField(
        queryset=ReferenceItem.objects.filter(category="maintenance_type"),
        source="maintenance_type",
        write_only=True,
        required=True,
    )

    service_organization_id = serializers.PrimaryKeyRelatedField(
        queryset=ReferenceItem.objects.filter(category="service_organization"),
        source="service_organization",
        write_only=True,
        required=False,
        allow_null=True,
    )

    machine_id = serializers.PrimaryKeyRelatedField(
        queryset=Machine.objects.all(),
        source="machine",
        write_only=True,
        required=True,
    )

    class Meta:
        model = Maintenance
        fields = (
            "id",
            # read-only
            "maintenance_type",
            "service_organization",
            "machine",
            "service_company",
            # write-only id-поля
            "maintenance_type_id",
            "service_organization_id",
            "machine_id",
            # общие поля
            "maintenance_date",
            "operating_time",
            "work_order_number",
            "work_order_date",
            "created_at",
            "updated_at",
        )

    def validate_operating_time(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Наработка не может быть отрицательной.')
        return value
