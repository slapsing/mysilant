from machines.models import Machine
from machines.serializers import MachineShortSerializer
from references.models import ReferenceItem
from references.serializers import ReferenceItemSerializer
from rest_framework import serializers
from users.serializers import UserShortSerializer

from .models import Claim


class ClaimSerializer(serializers.ModelSerializer):
    failure_node = ReferenceItemSerializer(read_only=True)
    repair_method = ReferenceItemSerializer(read_only=True)
    machine = MachineShortSerializer(read_only=True)
    service_company = UserShortSerializer(read_only=True)

    failure_node_id = serializers.PrimaryKeyRelatedField(
        queryset=ReferenceItem.objects.filter(category="failure_node"),
        source="failure_node",
        write_only=True,
        required=True,
    )

    repair_method_id = serializers.PrimaryKeyRelatedField(
        queryset=ReferenceItem.objects.filter(category="repair_method"),
        source="repair_method",
        write_only=True,
        required=True,
    )

    machine_id = serializers.PrimaryKeyRelatedField(
        queryset=Machine.objects.all(),
        source="machine",
        write_only=True,
        required=True,
    )

    downtime = serializers.IntegerField(read_only=True)

    class Meta:
        model = Claim
        fields = (
            "id",
            "failure_date",
            "operating_time",
            "failure_node",
            "failure_node_id",
            "failure_description",
            "repair_method",
            "repair_method_id",
            "spare_parts",
            "recovery_date",
            "downtime",
            "machine",
            "machine_id",
            "service_company",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        """
        Общая валидация:
        - дата восстановления не может быть раньше даты отказа;
        - наработка не может быть отрицательной.
        """

        failure_date = attrs.get("failure_date") or getattr(
            self.instance, "failure_date", None
        )
        recovery_date = attrs.get("recovery_date") or getattr(
            self.instance, "recovery_date", None
        )

        if failure_date and recovery_date and recovery_date < failure_date:
            raise serializers.ValidationError(
                {
                    "recovery_date": "Дата восстановления не может быть раньше даты отказа."
                }
            )

        operating_time = attrs.get("operating_time")
        if operating_time is not None and operating_time < 0:
            raise serializers.ValidationError(
                {
                    "operating_time": "Наработка не может быть отрицательной."
                }
            )

        return attrs
