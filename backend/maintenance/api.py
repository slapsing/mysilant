from django.db.models import Q
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiTypes,
)
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from users.models import UserProfile

from .models import Maintenance
from .serializers import MaintenanceSerializer


@extend_schema_view(
    list=extend_schema(
        summary="Список записей ТО",
        description=(
                "История технического обслуживания машин, доступных текущему пользователю.\n\n"
                "Права доступа:\n"
                "- Клиент: ТО только по своим машинам\n"
                "- Сервисная организация: ТО по машинам, которые она обслуживает, "
                "а также записи, где она указана сервисной компанией\n"
                "- Менеджер: все записи ТО\n\n"
                "По умолчанию сортировка по дате проведения ТО."
        ),
        tags=["Maintenance"],
        parameters=[
            OpenApiParameter(
                name="maintenance_type",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Фильтр по виду ТО (ID справочника).",
            ),
            OpenApiParameter(
                name="machine__serial_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Заводской номер машины (точное совпадение или поиск по подстроке).",
            ),
            OpenApiParameter(
                name="service_company",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Фильтр по сервисной компании (ID пользователя).",
            ),
            OpenApiParameter(
                name="maintenance_date",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Точная дата проведения ТО.",
            ),
            OpenApiParameter(
                name="maintenance_date__gte",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Дата проведения ТО — не раньше указанной.",
            ),
            OpenApiParameter(
                name="maintenance_date__lte",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Дата проведения ТО — не позже указанной.",
            ),
            OpenApiParameter(
                name="export",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                required=False,
                description=(
                        "Если равно 1, возвращает все записи без пагинации "
                        "(удобно для выгрузки данных в JSON)."
                ),
            ),
        ],
    ),
    retrieve=extend_schema(
        summary="Детальная информация о записи ТО",
        description=(
                "Возвращает подробную информацию об одной записи технического обслуживания.\n\n"
                "Права доступа зависят от роли пользователя (клиент, сервисная организация, менеджер)."
        ),
        tags=["Maintenance"],
    ),
    create=extend_schema(
        summary="Создать запись ТО",
        description=(
                "Создаёт новую запись о техническом обслуживании машины.\n\n"
                "Доступно для ролей: клиент (по своим машинам), сервисная организация, менеджер."
        ),
        tags=["Maintenance"],
    ),
)
class MaintenanceViewSet(viewsets.ModelViewSet):
    """
    /api/maintenance/       — список ТО (GET), создание записи ТО (POST)
    /api/maintenance/{id}/  — детали ТО (GET)

    Доступ к данным:
    - менеджер: все записи
    - клиент: ТО только по своим машинам
    - сервис: ТО по своим машинам / где он указан как сервисная компания

    Создание (POST):
    - менеджер: может создать ТО для любой машины
    - клиент: только для машин, где он указан как клиент
    - сервис: только для машин, которые он обслуживает
    """

    serializer_class = MaintenanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    http_method_names = ["get", "post", "head", "options"]

    filterset_fields = {
        "maintenance_type": ["exact"],
        "machine__serial_number": ["exact", "icontains"],
        "service_company": ["exact"],
        "maintenance_date": ["exact", "gte", "lte"],
    }

    ordering = ["-maintenance_date", "-id"]
    ordering_fields = ["maintenance_date", "id"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Maintenance.objects.none()

        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)

        qs = Maintenance.objects.select_related(
            "maintenance_type",
            "service_organization",
            "machine",
            "machine__machine_model",
            "service_company",
        )

        if role == UserProfile.Role.MANAGER:
            return qs

        if role == UserProfile.Role.CLIENT:
            return qs.filter(machine__client=user)

        if role == UserProfile.Role.SERVICE:
            return qs.filter(
                Q(service_company=user) | Q(machine__service_company=user)
            )

        return Maintenance.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)

        machine = serializer.validated_data.get("machine")
        if machine is None:
            raise PermissionDenied("Не указана машина для ТО.")

        if role == UserProfile.Role.MANAGER:
            service_company = machine.service_company or None
            serializer.save(service_company=service_company)
            return

        if role == UserProfile.Role.CLIENT:
            if machine.client_id != user.id:
                raise PermissionDenied("Вы не можете добавить ТО к этой машине.")
            service_company = machine.service_company or None
            serializer.save(service_company=service_company)
            return

        if role == UserProfile.Role.SERVICE:
            if machine.service_company_id != user.id:
                raise PermissionDenied("Вы не обслуживаете эту машину.")
            serializer.save(service_company=user)
            return

        raise PermissionDenied("Недостаточно прав для создания записи ТО.")

    def list(self, request, *args, **kwargs):
        export = request.query_params.get("export") == "1"
        if not export:
            return super().list(request, *args, **kwargs)

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
