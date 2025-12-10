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

from .models import Claim
from .serializers import ClaimSerializer


@extend_schema_view(
    list=extend_schema(
        summary="Список рекламаций",
        description=(
                "Рекламации (отказы) по машинам, доступным текущему пользователю.\n\n"
                "Права доступа:\n"
                "- Клиент: только рекламации по своим машинам\n"
                "- Сервисная организация: рекламации по машинам, которые она обслуживает, "
                "а также записи, где она указана сервисной компанией\n"
                "- Менеджер: все рекламации\n\n"
                "По умолчанию сортировка по дате отказа."
        ),
        tags=["Claims"],
        parameters=[
            OpenApiParameter(
                name="failure_node",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Фильтр по узлу отказа (ID справочника).",
            ),
            OpenApiParameter(
                name="repair_method",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Фильтр по способу восстановления (ID справочника).",
            ),
            OpenApiParameter(
                name="service_company",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Фильтр по сервисной компании (ID пользователя).",
            ),
            OpenApiParameter(
                name="machine__serial_number",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Заводской номер машины (точное совпадение или поиск по подстроке).",
            ),
            OpenApiParameter(
                name="failure_date",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Точная дата отказа.",
            ),
            OpenApiParameter(
                name="failure_date__gte",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Дата отказа — не ранее указанной.",
            ),
            OpenApiParameter(
                name="failure_date__lte",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Дата отказа — не позднее указанной.",
            ),
        ],
    ),
    retrieve=extend_schema(
        summary="Детальная информация о рекламации",
        description=(
                "Возвращает подробные данные по одной рекламации: даты отказа и восстановления, "
                "узел отказа, способ восстановления, простой и т.д."
        ),
        tags=["Claims"],
    ),
    create=extend_schema(
        summary="Создать рекламацию",
        description=(
                "Создаёт новую рекламацию по машине.\n\n"
                "Доступно для ролей: сервисная организация и менеджер.\n"
                "Клиент рекламации только просматривает."
        ),
        tags=["Claims"],
    ),
)
class ClaimViewSet(viewsets.ModelViewSet):
    """
    /api/claims/       — список рекламаций (GET), создание рекламации (POST)
    /api/claims/{id}/  — детали рекламации (GET)

    Доступ к данным:
    - менеджер: все рекламации
    - клиент: только по своим машинам
    - сервис: по машинам, которые он обслуживает / где указан как сервисная компания

    Создание (POST):
    - менеджер: может создать рекламацию по любой машине
    - сервис: может создать рекламацию только по машинам, которые он обслуживает
    - клиент: рекламации не создаёт (только просмотр)
    """

    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated]


    http_method_names = ["get", "post", "head", "options"]

    # фильтры:
    # узел отказа, способ восстановления, сервисная компания, зав. номер машины, дата отказа
    filterset_fields = {
        "failure_node": ["exact"],
        "repair_method": ["exact"],
        "service_company": ["exact"],
        "machine__serial_number": ["exact", "icontains"],
        "failure_date": ["exact", "gte", "lte"],
    }

    # сортировка по дате отказа (от новых к старым)
    ordering = ["-failure_date", "-id"]
    ordering_fields = ["failure_date", "id"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Claim.objects.none()

        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)

        qs = Claim.objects.select_related(
            "failure_node",
            "repair_method",
            "machine",
            "machine__machine_model",
            "service_company",
        )

        if role == UserProfile.Role.MANAGER:
            return qs

        if role == UserProfile.Role.CLIENT:
            # клиент видит рекламации только по своим машинам
            return qs.filter(machine__client=user)

        if role == UserProfile.Role.SERVICE:
            # сервис видит рекламации:
            # - где он указан как сервисная компания
            # - или по машинам, которые он обслуживает
            return qs.filter(
                Q(service_company=user) | Q(machine__service_company=user)
            )

        return Claim.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)

        machine = serializer.validated_data.get("machine")
        if machine is None:
            raise PermissionDenied("Не указана машина для рекламации.")

        # Менеджер: может создать рекламацию для любой машины,
        if role == UserProfile.Role.MANAGER:
            service_company = machine.service_company or None
            serializer.save(service_company=service_company)
            return

        # Сервисная организация: только для машин, которые она обслуживает
        if role == UserProfile.Role.SERVICE:
            if machine.service_company_id != user.id:
                raise PermissionDenied("Вы не обслуживаете эту машину.")
            serializer.save(service_company=user)
            return

        # Клиент и прочие роли не создают рекламации
        raise PermissionDenied("Недостаточно прав для создания рекламации.")

    def list(self, request, *args, **kwargs):
        export = request.query_params.get("export") == "1"
        if not export:
            return super().list(request, *args, **kwargs)

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
