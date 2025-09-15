from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from account.models import CustomUser
from todos.models import Task


class TaskAPITestCase(APITestCase):
    fixtures = ["account/fixtures/users.json",
                "todos/fixtures/todos.json"]

    def setUp(self):
        self.admin_user = CustomUser.objects.create_superuser(
            email="admin@example.com",
            password="AdminPass123",
            first_name="Admin",
            last_name="User",
        )
        self.assigned_to = CustomUser.objects.get(email="testuser@example.com")

        self.token = RefreshToken.for_user(self.admin_user).access_token

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        self.task_data = {
            "task_id": "TASK002",
            "title": "Test Task",
            "description": "This is a test task.",
            "assigned_to": self.assigned_to,
            "priority": "HIGH",
            "start_date":"2024-11-26",
            "end_date":"2028-12-23",
            "notes": "Some notes",
            "status": "in_progress"
        }
        self.task = Task.objects.create(owner=self.admin_user, **self.task_data)

    def test_create_task(self):
        create_data = {
            "task_id": "TASK003",
            "title": "New Task",
            "description": "This is a new task.",
            "assigned_to": self.assigned_to.id,
            "start_date": "2024-10-21",
            "end_date": "2024-10-23",
            "notes": "Some notes",
            "status": "in_progress",
        }

        url = reverse("task-list-create")
        response = self.client.post(url, create_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_tasks(self):
        response = self.client.get(reverse("task-list-create"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

    def test_get_task_detail(self):
        response = self.client.get(reverse("task-detail", args=[self.task.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], self.task.title)

    def test_update_task(self):
        update_data = {"title": "Updated Task Title", "end_date": "2026-10-23"}

        url = reverse("task-detail", kwargs={"pk": self.task.pk})
        response = self.client.patch(url, update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_task(self):
        response = self.client.delete(reverse("task-detail", args=[self.task.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 1)
