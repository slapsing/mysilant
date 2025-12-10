from django.conf import settings
from django.db import models

from machines.models import Machine
from references.models import ReferenceItem


class Maintenance(models.Model):
    maintenance_type = models.ForeignKey(
        ReferenceItem,
        verbose_name="Вид ТО",
        on_delete=models.PROTECT,
        limit_choices_to={"category": ReferenceItem.Category.MAINTENANCE_TYPE},
        related_name="maintenances_as_type",
    )

    maintenance_date = models.DateField(
        "Дата проведения ТО",
    )

    operating_time = models.PositiveIntegerField(
        "Наработка, м/час",
        null=True,
        blank=True,
    )

    work_order_number = models.CharField(
        "№ заказ-наряда",
        max_length=100,
        blank=True,
    )

    work_order_date = models.DateField(
        "Дата заказ-наряда",
        null=True,
        blank=True,
    )

    service_organization = models.ForeignKey(
        ReferenceItem,
        verbose_name="Организация, проводившая ТО",
        on_delete=models.PROTECT,
        limit_choices_to={"category": ReferenceItem.Category.SERVICE_ORGANIZATION},
        related_name="maintenances_as_org",
        null=True,
        blank=True,
    )

    machine = models.ForeignKey(
        Machine,
        verbose_name="Машина",
        on_delete=models.CASCADE,
        related_name="maintenances",
    )

    service_company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="Сервисная компания",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="maintenances_as_service_company",
    )

    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "ТО"
        verbose_name_plural = "ТО"
        ordering = ["-maintenance_date", "-id"]

    def __str__(self) -> str:
        return f"ТО {self.maintenance_type} для {self.machine} от {self.maintenance_date}"
