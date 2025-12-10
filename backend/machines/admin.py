from django.contrib import admin

from .models import Machine


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = (
        "serial_number",
        "machine_model",
        "engine_model",
        "shipment_date",
        "client",
        "service_company",
    )
    list_filter = ("machine_model", "engine_model", "service_company")
    search_fields = ("serial_number", "client__username", "service_company__username")
    date_hierarchy = "shipment_date"
