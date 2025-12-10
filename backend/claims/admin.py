from django.contrib import admin

from .models import Claim


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = (
        "failure_date",
        "machine",
        "failure_node",
        "repair_method",
        "downtime",
        "service_company",
    )
    list_filter = (
        "failure_node",
        "repair_method",
        "service_company",
        "failure_date",
    )
    search_fields = (
        "machine__serial_number",
        "failure_description",
        "spare_parts",
    )
    date_hierarchy = "failure_date"
    readonly_fields = ("downtime", "created_at", "updated_at")
