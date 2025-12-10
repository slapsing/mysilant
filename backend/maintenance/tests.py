from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from machines.models import Machine
from maintenance.models import Maintenance
from references.models import ReferenceItem
from rest_framework import status
from rest_framework.test import APIClient
from users.models import UserProfile

User = get_user_model()


class MaintenanceAPITests(TestCase):
    def setUp(self):
        self.api_client = APIClient()

        self.manager = User.objects.create_user(
            username="manager",
            password="pass123",
        )
        self.client_user = User.objects.create_user(
            username="client",
            password="pass123",
        )
        self.service_user = User.objects.create_user(
            username="service",
            password="pass123",
        )

        self.manager.profile.role = UserProfile.Role.MANAGER
        self.manager.profile.save()

        self.client_user.profile.role = UserProfile.Role.CLIENT
        self.client_user.profile.save()

        self.service_user.profile.role = UserProfile.Role.SERVICE
        self.service_user.profile.save()

        self.machine_model = ReferenceItem.objects.create(
            category=ReferenceItem.Category.MACHINE_MODEL,
            name="Silant 1.5",
        )
        self.engine_model = ReferenceItem.objects.create(
            category=ReferenceItem.Category.ENGINE_MODEL,
            name="Engine X",
        )
        self.transmission_model = ReferenceItem.objects.create(
            category=ReferenceItem.Category.TRANSMISSION_MODEL,
            name="Trans X",
        )
        self.drive_axle_model = ReferenceItem.objects.create(
            category=ReferenceItem.Category.DRIVE_AXLE_MODEL,
            name="Drive Axle X",
        )
        self.steer_axle_model = ReferenceItem.objects.create(
            category=ReferenceItem.Category.STEER_AXLE_MODEL,
            name="Steer Axle X",
        )

        self.maintenance_type_1 = ReferenceItem.objects.create(
            category=ReferenceItem.Category.MAINTENANCE_TYPE,
            name="ТО-1",
        )
        self.maintenance_type_2 = ReferenceItem.objects.create(
            category=ReferenceItem.Category.MAINTENANCE_TYPE,
            name="ТО-2",
        )

        self.service_org = ReferenceItem.objects.create(
            category=ReferenceItem.Category.SERVICE_ORGANIZATION,
            name="Сервисная организация 1",
        )

        self.machine1 = Machine.objects.create(
            serial_number="MACH-001",
            machine_model=self.machine_model,
            engine_model=self.engine_model,
            engine_serial_number="ENG-1",
            transmission_model=self.transmission_model,
            transmission_serial_number="TR-1",
            drive_axle_model=self.drive_axle_model,
            drive_axle_serial_number="DA-1",
            steer_axle_model=self.steer_axle_model,
            steer_axle_serial_number="SA-1",
            client=self.client_user,
            service_company=self.service_user,
        )

        self.machine2 = Machine.objects.create(
            serial_number="MACH-002",
            machine_model=self.machine_model,
            engine_model=self.engine_model,
            engine_serial_number="ENG-2",
            transmission_model=self.transmission_model,
            transmission_serial_number="TR-2",
            drive_axle_model=self.drive_axle_model,
            drive_axle_serial_number="DA-2",
            steer_axle_model=self.steer_axle_model,
            steer_axle_serial_number="SA-2",
            client=None,
            service_company=self.service_user,
        )

        self.machine3 = Machine.objects.create(
            serial_number="MACH-003",
            machine_model=self.machine_model,
            engine_model=self.engine_model,
            engine_serial_number="ENG-3",
            transmission_model=self.transmission_model,
            transmission_serial_number="TR-3",
            drive_axle_model=self.drive_axle_model,
            drive_axle_serial_number="DA-3",
            steer_axle_model=self.steer_axle_model,
            steer_axle_serial_number="SA-3",
            client=None,
            service_company=None,
        )

        self.maint1 = Maintenance.objects.create(
            maintenance_type=self.maintenance_type_1,
            maintenance_date=date(2024, 1, 10),
            operating_time=100,
            work_order_number="WO-1",
            work_order_date=date(2024, 1, 9),
            service_organization=self.service_org,
            machine=self.machine1,
            service_company=self.service_user,
        )

        self.maint2 = Maintenance.objects.create(
            maintenance_type=self.maintenance_type_2,
            maintenance_date=date(2024, 2, 5),
            operating_time=200,
            work_order_number="WO-2",
            work_order_date=date(2024, 2, 4),
            service_organization=self.service_org,
            machine=self.machine2,
            service_company=self.service_user,
        )

        self.maint3 = Maintenance.objects.create(
            maintenance_type=self.maintenance_type_1,
            maintenance_date=date(2024, 3, 1),
            operating_time=300,
            work_order_number="WO-3",
            work_order_date=date(2024, 2, 28),
            service_organization=self.service_org,
            machine=self.machine3,
            service_company=None,
        )

    def test_anonymous_cannot_access_maintenance_list(self):
        url = reverse("maintenance-list")
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_sees_all_maintenance(self):
        url = reverse("maintenance-list")
        self.api_client.force_authenticate(user=self.manager)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 3 записи ТО
        self.assertEqual(len(response.data), 3)

    def test_client_sees_only_own_machine_maintenance(self):
        url = reverse("maintenance-list")
        self.api_client.force_authenticate(user=self.client_user)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["machine"]["serial_number"], "MACH-001")

    def test_service_sees_maintenance_for_their_machines(self):
        url = reverse("maintenance-list")
        self.api_client.force_authenticate(user=self.service_user)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        serials = {item["machine"]["serial_number"] for item in response.data}
        self.assertEqual(serials, {"MACH-001", "MACH-002"})

    def test_filter_by_maintenance_type(self):
        url = reverse("maintenance-list")
        self.api_client.force_authenticate(user=self.manager)
        response = self.api_client.get(url, {"maintenance_type": self.maintenance_type_1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_ids = {item["id"] for item in response.data}
        self.assertEqual(returned_ids, {self.maint1.id, self.maint3.id})

    def test_filter_by_machine_serial_number(self):
        url = reverse("maintenance-list")
        self.api_client.force_authenticate(user=self.manager)
        response = self.api_client.get(url, {"machine__serial_number": "MACH-001"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["machine"]["serial_number"], "MACH-001")
