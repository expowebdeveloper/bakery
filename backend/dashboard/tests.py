from django.urls import reverse
import json
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from account.models import CustomUser as User
from dashboard.models import ZipCodeConfig
from dashboard.serializers import ZipCodeConfigSerializer

class ZipViewSetTestCase(APITestCase):
    fixtures = ["dashboard/fixtures/zip_conf.json"]
    
    def setUp(self): 
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager" 
        )

        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")
    
    def test_list_zip_code(self):
        url = reverse("deliery-list")
        response = self.client.get(url)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)


    def test_zip_code_creation(self):
        url = reverse("deliery-list")
        self.user.is_staff = True
        self.user.save()
        data = {
            "zip_code": "09287",
            "state": "CA",
            "city": "Mohali",
            "address": "Aviox",
            "min_order_quantity": 3,
            "delivery_availability": "available",
            "delivery_threshold": 6,
            "notes": "recipe notes",
            "is_deleted": False
    }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_zip_code(self):
        zip_id = ZipCodeConfig.objects.first().id
        url = reverse("delivery-list", args=[zip_id])
        response = self.client.get(url)
        zip_code = ZipCodeConfig.objects.get(id=zip_id)
        serializer = ZipCodeConfigSerializer(zip_code)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_update_zip_code(self):
        zip_id = ZipCodeConfig.objects.first().id
        zip_code = ZipCodeConfig.objects.get(id=zip_id)
        self.user.is_staff = True
        self.user.save()
        url = reverse("delivery-list", args=[zip_id])
        data = {
            "zip_code": "56789",
            "state": "AL",
            "city": "string",
            "min_order_quantity": 100,
            "delivery_availability": "available",
            "delivery_threshold": 10,
            "notes": "string",
            "is_deleted": False
}

        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        zip_code.refresh_from_db()

    
    def test_delete_zip_code(self):
        self.user.is_staff = True
        self.user.save()
        zip_id = ZipCodeConfig.objects.first().id
        zip_code = ZipCodeConfig.objects.get(id=zip_id)
        url = reverse("delivery-list", args=[zip_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        zip_code.refresh_from_db() 
