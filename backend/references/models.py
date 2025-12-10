from django.db import models


class ReferenceItem(models.Model):
    class Category(models.TextChoices):
        MACHINE_MODEL = "machine_model", "Модель техники"
        ENGINE_MODEL = "engine_model", "Модель двигателя"
        TRANSMISSION_MODEL = "transmission_model", "Модель трансмиссии"
        DRIVE_AXLE_MODEL = "drive_axle_model", "Модель ведущего моста"
        STEER_AXLE_MODEL = "steer_axle_model", "Модель управляемого моста"
        MAINTENANCE_TYPE = "maintenance_type", "Вид ТО"
        FAILURE_NODE = "failure_node", "Узел отказа"
        REPAIR_METHOD = "repair_method", "Способ восстановления"
        SERVICE_ORGANIZATION = "service_organization", "Организация, проводившая ТО"

    category = models.CharField(
        "Тип справочника",
        max_length=50,
        choices=Category.choices,
    )
    name = models.CharField("Название", max_length=255)
    description = models.TextField("Описание", blank=True)

    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Элемент справочника"
        verbose_name_plural = "Элементы справочников"
        ordering = ["category", "name"]

    def __str__(self) -> str:
        return f"{self.get_category_display()}: {self.name}"
