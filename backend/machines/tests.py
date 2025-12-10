from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from machines.models import Machine
from references.models import ReferenceItem
from rest_framework import status
from rest_framework.test import APIClient
from users.models import UserProfile

User = get_user_model()


class MachineAPITests(TestCase):
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

    def test_public_search_requires_serial_param(self):
        url = reverse("public-machine-search")
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_public_search_returns_404_for_unknown_serial(self):
        url = reverse("public-machine-search")
        response = self.api_client.get(url, {"serial": "UNKNOWN"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_search_returns_machine_data(self):
        url = reverse("public-machine-search")
        response = self.api_client.get(url, {"serial": self.machine1.serial_number})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["serial_number"], self.machine1.serial_number)
        self.assertIn("machine_model", response.data)


    def test_anonymous_cannot_access_machine_list(self):
        """Неавторизованный пользователь не видит список машин."""
        url = reverse("machine-list")
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_sees_all_machines(self):
        """Менеджер видит все машины."""
        url = reverse("machine-list")
        self.api_client.force_authenticate(user=self.manager)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # у нас 3 машины в setUp
        self.assertEqual(len(response.data), 3)

    def test_client_sees_only_own_machines(self):
        """Клиент видит только свои машины."""
        url = reverse("machine-list")
        self.api_client.force_authenticate(user=self.client_user)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["serial_number"], self.machine1.serial_number)

    def test_service_sees_only_service_machines(self):
        """Сервисная компания видит только машины, которые она обслуживает."""
        url = reverse("machine-list")
        self.api_client.force_authenticate(user=self.service_user)
        response = self.api_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        serials = {item["serial_number"] for item in response.data}
        self.assertEqual(
            serials,
            {self.machine1.serial_number, self.machine2.serial_number},
        )

    def test_client_cannot_access_foreign_machine_detail(self):
        """Клиент не может получить детальную инфу по чужой машине."""
        url = reverse("machine-detail", args=[self.machine3.id])
        self.api_client.force_authenticate(user=self.client_user)
        response = self.api_client.get(url)
        # так как в queryset клиенту просто недоступна эта машина — будет 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
