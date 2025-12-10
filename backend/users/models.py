from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    class Role(models.TextChoices):
        CLIENT = "client", "Клиент"
        SERVICE = "service", "Сервисная организация"
        MANAGER = "manager", "Менеджер"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
        verbose_name="Пользователь",
    )
    role = models.CharField(
        "Роль",
        max_length=20,
        choices=Role.choices,
    )
    organization_name = models.CharField(
        "Название организации",
        max_length=255,
        blank=True,
    )
    phone = models.CharField(
        "Телефон",
        max_length=50,
        blank=True,
    )

    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователей"

    def __str__(self) -> str:
        return f"{self.user.username} ({self.get_role_display()})"
