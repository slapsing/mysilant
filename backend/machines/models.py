from django.conf import settings
from django.db import models

from references.models import ReferenceItem


class Machine(models.Model):
    serial_number = models.CharField(
        "Зав. № машины",
        max_length=50,
        unique=True,
    )

    machine_model = models.ForeignKey(
        ReferenceItem,
        verbose_name="Модель техники",
        on_delete=models.PROTECT,
        related_name="machines_as_model",
        limit_choices_to={"category": ReferenceItem.Category.MACHINE_MODEL},
    )

    engine_model = models.ForeignKey(
        ReferenceItem,
        verbose_name="Модель двигателя",
        on_delete=models.PROTECT,
        related_name="machines_engine_model",
        limit_choices_to={"category": ReferenceItem.Category.ENGINE_MODEL},
    )
    engine_serial_number = models.CharField(
        "Зав. № двигателя",
        max_length=50,
        blank=True,
    )

    transmission_model = models.ForeignKey(
        ReferenceItem,
        verbose_name="Модель трансмиссии",
        on_delete=models.PROTECT,
        related_name="machines_transmission_model",
        limit_choices_to={"category": ReferenceItem.Category.TRANSMISSION_MODEL},
    )
    transmission_serial_number = models.CharField(
        "Зав. № трансмиссии",
        max_length=50,
        blank=True,
    )

    drive_axle_model = models.ForeignKey(
        ReferenceItem,
        verbose_name="Модель ведущего моста",
        on_delete=models.PROTECT,
        related_name="machines_drive_axle_model",
        limit_choices_to={"category": ReferenceItem.Category.DRIVE_AXLE_MODEL},
    )
    drive_axle_serial_number = models.CharField(
        "Зав. № ведущего моста",
        max_length=50,
        blank=True,
    )

    steer_axle_model = models.ForeignKey(
        ReferenceItem,
        verbose_name="Модель управляемого моста",
        on_delete=models.PROTECT,
        related_name="machines_steer_axle_model",
        limit_choices_to={"category": ReferenceItem.Category.STEER_AXLE_MODEL},
    )
    steer_axle_serial_number = models.CharField(
        "Зав. № управляемого моста",
        max_length=50,
        blank=True,
    )

    contract_number_and_date = models.CharField(
        "Договор поставки №, дата",
        max_length=255,
        blank=True,
    )
    shipment_date = models.DateField(
        "Дата отгрузки с завода",
        null=True,
        blank=True,
    )
    consignee = models.CharField(
        "Грузополучатель (конечный потребитель)",
        max_length=255,
        blank=True,
    )
    delivery_address = models.CharField(
        "Адрес поставки (эксплуатации)",
        max_length=255,
        blank=True,
    )
    options = models.TextField(
        "Комплектация (доп. опции)",
        blank=True,
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="Клиент",
        related_name="client_machines",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    service_company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="Сервисная компания",
        related_name="service_machines",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    created_at = models.DateTimeField("Создано", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Машина"
        verbose_name_plural = "Машины"
        ordering = ["-shipment_date", "serial_number"]

    def __str__(self) -> str:
        return f"{self.serial_number} ({self.machine_model})"
