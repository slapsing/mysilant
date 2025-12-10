from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import UserProfile


class IsManagerOrAdmin(BasePermission):
    """
    Разрешает только чтение (GET/HEAD/OPTIONS) всем авторизованным пользователям.
    Запись (POST/PUT/PATCH/DELETE) — только менеджеру.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        profile = getattr(user, "profile", None)
        role = getattr(profile, "role", None)
        return role == UserProfile.Role.MANAGER
