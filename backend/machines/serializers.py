from references.serializers import ReferenceItemSerializer
from rest_framework import serializers
from users.serializers import UserShortSerializer

from .models import Machine


class MachineShortSerializer(serializers.ModelSerializer):
    machine_model = ReferenceItemSerializer(read_only=True)

    class Meta:
        model = Machine
        fields = (
            "id",
            "serial_number",
            "machine_model",
        )


class MachinePublicSerializer(serializers.ModelSerializer):
    machine_model = ReferenceItemSerializer(read_only=True)
    engine_model = ReferenceItemSerializer(read_only=True)
    transmission_model = ReferenceItemSerializer(read_only=True)
    drive_axle_model = ReferenceItemSerializer(read_only=True)
    steer_axle_model = ReferenceItemSerializer(read_only=True)

    class Meta:
        model = Machine
        fields = (
            "serial_number",
            "machine_model",
            "engine_model",
            "engine_serial_number",
            "transmission_model",
            "transmission_serial_number",
            "drive_axle_model",
            "drive_axle_serial_number",
            "steer_axle_model",
            "steer_axle_serial_number",
        )


class MachineSerializer(serializers.ModelSerializer):

    machine_model = ReferenceItemSerializer(read_only=True)
    engine_model = ReferenceItemSerializer(read_only=True)
    transmission_model = ReferenceItemSerializer(read_only=True)
    drive_axle_model = ReferenceItemSerializer(read_only=True)
    steer_axle_model = ReferenceItemSerializer(read_only=True)

    client = UserShortSerializer(read_only=True)
    service_company = UserShortSerializer(read_only=True)

    class Meta:
        model = Machine
        fields = (
            "id",
            "serial_number",
            "machine_model",
            "engine_model",
            "engine_serial_number",
            "transmission_model",
            "transmission_serial_number",
            "drive_axle_model",
            "drive_axle_serial_number",
            "steer_axle_model",
            "steer_axle_serial_number",
            "contract_number_and_date",
            "shipment_date",
            "consignee",
            "delivery_address",
            "options",
            "client",
            "service_company",
        )
