from datetime import date, timedelta

from claims.models import Claim
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from machines.models import Machine
from references.models import ReferenceItem
from rest_framework import status
from rest_framework.test import APIClient
from users.models import UserProfile

User = get_user_model()


class ClaimAPITests(TestCase):
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

        self.failure_node_1 = ReferenceItem.objects.create(
            category=ReferenceItem.Category.FAILURE_NODE,
            name="Двигатель",
        )
        self.failure_node_2 = ReferenceItem.objects.create(
            category=ReferenceItem.Category.FAILURE_NODE,
            name="Гидравлика",
        )

        self.repair_method_1 = ReferenceItem.objects.create(
            category=ReferenceItem.Category.REPAIR_METHOD,
            name="Замена узла",
        )
        self.repair_method_2 = ReferenceItem.objects.create(
            category=ReferenceItem.Category.REPAIR_METHOD,
            name="Регулировка",
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

        self.claim1 = Claim.objects.create(
            failure_date=date(2024, 1, 10),
            operating_time=100,
            failure_node=self.failure_node_1,
            failure_description="Заглох двигатель",
            repair_method=self.repair_method_1,
            spare_parts="Фильтр, масло",
            recovery_date=date(2024, 1, 15),
            machine=self.machine1,
            service_company=self.service_user,
        )

        self.claim2 = Claim.objects.create(
            failure_date=date(2024, 2, 1),
            operating_time=200,
            failure_node=self.failure_node_2,
            failure_description="Протечка гидравлики",
            repair_method=self.repair_method_2,
            spare_parts="Уплотнения",
            recovery_date=date(2024, 2, 3),
            machine=self.machine2,
            service_company=self.service_user,
        )

        self.claim3 = Claim.objects.create(
            failure_date=date(2024, 3, 5),
            operating_time=300,
            failure_node=self.failure_node_1,
            failure_description="Повторный отказ двигателя",
            repair_method=self.repair_method_1,
            spare_parts="Двигатель в сборе",
            recovery_date=None,
            machine=self.machine3,
            service_company=None,
        )

    def test_downtime_is_calculated_on_save(self):
        self.assertEqual(self.claim1.downtime, 5)
        self.assertEqual(self.claim2.downtime, 2)
        self.assertIsNone(self.claim3.downtime)

        self.claim1.recovery_date = self.claim1.failure_date + timedelta(days=10)
        self.claim1.save()
        self.assertEqual(self.claim1.downtime, 10)

    def test_anonymous_cannot_access_claims_list(self):
        url = reverse("claim-list")
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_sees_all_claims(self):
        url = reverse("claim-list")
        self.api_client.force_authenticate(user=self.manager)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_client_sees_only_own_machine_claims(self):
        url = reverse("claim-list")
        self.api_client.force_authenticate(user=self.client_user)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["machine"]["serial_number"], "MACH-001")

    def test_service_sees_claims_for_their_machines(self):
        url = reverse("claim-list")
        self.api_client.force_authenticate(user=self.service_user)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        serials = {item["machine"]["serial_number"] for item in response.data}
        self.assertEqual(serials, {"MACH-001", "MACH-002"})

    def test_filter_by_failure_node(self):
        url = reverse("claim-list")
        self.api_client.force_authenticate(user=self.manager)
        response = self.api_client.get(url, {"failure_node": self.failure_node_1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = {item["id"] for item in response.data}
        self.assertEqual(ids, {self.claim1.id, self.claim3.id})

    def test_filter_by_repair_method(self):
        url = reverse("claim-list")
        self.api_client.force_authenticate(user=self.manager)
        response = self.api_client.get(url, {"repair_method": self.repair_method_2.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ids = {item["id"] for item in response.data}
        self.assertEqual(ids, {self.claim2.id})
