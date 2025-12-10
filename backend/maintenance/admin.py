from django.contrib import admin

from .models import Maintenance


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = (
        "maintenance_date",
        "maintenance_type",
        "machine",
        "operating_time",
        "service_organization",
        "service_company",
    )
    list_filter = (
        "maintenance_type",
        "service_organization",
        "service_company",
        "maintenance_date",
    )
    search_fields = (
        "machine__serial_number",
        "work_order_number",
    )
    date_hierarchy = "maintenance_date"
