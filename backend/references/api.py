from django.db.models.deletion import ProtectedError
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes
from rest_framework import status
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from users.models import UserProfile

from .models import ReferenceItem
from .serializers import ReferenceItemSerializer


@extend_schema_view(
    list=extend_schema(
        summary="Список элементов справочника",
        description=(
                "Возвращает элементы справочника по заданной категории.\n\n"
                "Примеры категорий: machine_model, engine_model, transmission_model, "
                "drive_axle_model, steer_axle_model, maintenance_type, failure_node, repair_method и т.д."
        ),
        tags=["References"],
        parameters=[
            OpenApiParameter(
                name='category',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Код категории справочника (например, machine_model).',
            ),
        ],
    ),
    retrieve=extend_schema(
        summary="Детали элемента справочника",
        description="Возвращает один элемент справочника по его ID.",
        tags=["References"],
    ),
    create=extend_schema(
        summary="Создать элемент справочника",
        description=(
                "Создаёт новый элемент справочника (например, новую модель техники).\n\n"
                "Доступно только роли менеджера."
        ),
        tags=["References"],
    ),
    partial_update=extend_schema(
        summary="Обновить элемент справочника",
        description="Частично обновляет элемент справочника по ID (название, описание).",
        tags=["References"],
    ),
    destroy=extend_schema(
        summary="Удалить элемент справочника",
        description="Удаляет элемент справочника по ID. Доступно только менеджеру.",
        tags=["References"],
    ),
)
class ReferenceItemViewSet(viewsets.ModelViewSet):
    """
    /api/references/        — список элементов справочников, создание (POST)
    /api/references/{id}/   — детали, обновление, удаление

    Доступ к данным:
    - все авторизованные пользователи могут читать (GET)
    - изменять (POST/PUT/PATCH/DELETE) может только менеджер
    """

    serializer_class = ReferenceItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    http_method_names = [
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "head",
        "options",
    ]

    filterset_fields = ["category", "name"]
    ordering = ["category", "name"]
    ordering_fields = ["category", "name"]

    def get_queryset(self):
        return ReferenceItem.objects.all()

    def _ensure_manager(self):
        user = self.request.user
        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)
        if role != UserProfile.Role.MANAGER:
            raise PermissionDenied("Только менеджер может изменять справочники.")

    def create(self, request, *args, **kwargs):
        self._ensure_manager()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        self._ensure_manager()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._ensure_manager()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._ensure_manager()

        instance = self.get_object()
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "Нельзя удалить элемент справочника, который уже используется "
                        "в машинах, ТО или рекламациях."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
