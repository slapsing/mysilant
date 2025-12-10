from django.shortcuts import get_object_or_404
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiTypes,
)
from references.models import ReferenceItem
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import UserProfile

from .models import Machine
from .serializers import MachineSerializer, MachinePublicSerializer


@extend_schema_view(
    list=extend_schema(
        summary="Список машин",
        description=(
                "Возвращает список машин, доступных текущему пользователю.\n\n"
                "Права доступа:\n"
                "- Клиент: только свои машины\n"
                "- Сервисная организация: машины, которые она обслуживает\n"
                "- Менеджер: все машины\n\n"
                "По умолчанию сортировка по дате отгрузки с завода."
        ),
        tags=["Machines"],
        parameters=[
            OpenApiParameter(
                name='machine_model',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Фильтр по модели техники (ID элемента справочника).',
            ),
            OpenApiParameter(
                name='engine_model',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Фильтр по модели двигателя (ID справочника).',
            ),
            OpenApiParameter(
                name='transmission_model',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Фильтр по модели трансмиссии (ID справочника).',
            ),
            OpenApiParameter(
                name='drive_axle_model',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Фильтр по модели ведущего моста (ID справочника).',
            ),
            OpenApiParameter(
                name='steer_axle_model',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Фильтр по модели управляемого моста (ID справочника).',
            ),
        ],
    ),
    retrieve=extend_schema(
        summary="Детальная информация о машине",
        description=(
                "Полная информация о машине и её комплектации.\n\n"
                "Гость (неавторизованный пользователь) в публичном API видит только ограниченный набор полей (1–10), "
                "авторизованные пользователи — все поля.\n\n"
                "Состав данных и доступ к машинам зависят от роли (клиент, сервисная организация, менеджер)."
        ),
        tags=["Machines"],
    ),
)
class MachineViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/machines/ — список машин (только для авторизованных)
    /api/machines/{id}/ — детальная информация
    """

    serializer_class = MachineSerializer
    permission_classes = [permissions.IsAuthenticated]

    filterset_fields = {
        "machine_model": ["exact"],
        "engine_model": ["exact"],
        "transmission_model": ["exact"],
        "steer_axle_model": ["exact"],
        "drive_axle_model": ["exact"],
    }

    ordering_fields = ["shipment_date", "serial_number", "id"]

    search_fields = ["serial_number"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Machine.objects.none()

        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)

        qs = Machine.objects.select_related(
            "machine_model",
            "engine_model",
            "transmission_model",
            "drive_axle_model",
            "steer_axle_model",
            "client",
            "service_company",
        )

        if role == UserProfile.Role.MANAGER:
            return qs

        if role == UserProfile.Role.CLIENT:
            return qs.filter(client=user)

        if role == UserProfile.Role.SERVICE:
            return qs.filter(service_company=user)

        return Machine.objects.none()

    def list(self, request, *args, **kwargs):
        export = request.query_params.get('export') == '1'
        if not export:
            return super().list(request, *args, **kwargs)

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@extend_schema(
    summary="Публичный поиск машины по заводскому номеру",
    description=(
            "Гостевой доступ без авторизации.\n\n"
            "Пользователь передаёт заводской номер машины и получает ограниченную информацию "
            "о комплектации (поля 1–10 по ТЗ). Если машина не найдена, возвращается сообщение об ошибке."
    ),
    tags=["Public"],
    parameters=[
        OpenApiParameter(
            name='serial_number',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            required=True,
            description='Заводской номер машины.',
        ),
    ],
)
class PublicMachineSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        serial = request.query_params.get("serial")
        if not serial:
            return Response(
                {"detail": "Параметр 'serial' обязателен."},
                status=400,
            )

        machine = get_object_or_404(
            Machine.objects.select_related(
                "machine_model",
                "engine_model",
                "transmission_model",
                "drive_axle_model",
                "steer_axle_model",
            ),
            serial_number=serial,
        )

        serializer = MachinePublicSerializer(machine)
        return Response(serializer.data)
