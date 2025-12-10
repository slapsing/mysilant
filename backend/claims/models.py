from django.conf import settings
from django.db import models

from machines.models import Machine
from references.models import ReferenceItem


class Claim(models.Model):
    failure_date = models.DateField(
        "Дата отказа",
    )

    operating_time = models.PositiveIntegerField(
        "Наработка, м/час",
        null=True,
        blank=True,
    )

    failure_node = models.ForeignKey(
        ReferenceItem,
        verbose_name="Узел отказа",
        on_delete=models.PROTECT,
        related_name="claims_as_failure_node",
        limit_choices_to={"category": ReferenceItem.Category.FAILURE_NODE},
    )

    failure_description = models.TextField(
        "Описание отказа",
    )

    repair_method = models.ForeignKey(
        ReferenceItem,
        verbose_name="Способ восстановления",
        on_delete=models.PROTECT,
        related_name="claims_as_repair_method",
        limit_choices_to={"category": ReferenceItem.Category.REPAIR_METHOD},
    )

    spare_parts = models.TextField(
        "Используемые запасные части",
        blank=True,
    )

    recovery_date = models.DateField(
        "Дата восстановления",
        null=True,
        blank=True,
    )

    downtime = models.PositiveIntegerField(
        "Время простоя техники, дни",
        null=True,
        blank=True,
        editable=False,
    )

    machine = models.ForeignKey(
        Machine,
        verbose_name="Машина",
        on_delete=models.CASCADE,
        related_name="claims",
    )

    service_company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="Сервисная компания",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="claims_as_service_company",
    )

    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Рекламация"
        verbose_name_plural = "Рекламации"
        ordering = ["-failure_date", "-id"]

    def __str__(self) -> str:
        return f"Рекламация по {self.machine} от {self.failure_date}"

    def save(self, *args, **kwargs):
        if self.failure_date and self.recovery_date:
            days = (self.recovery_date - self.failure_date).days
            self.downtime = max(days, 0)
        else:
            self.downtime = None

        super().save(*args, **kwargs)
