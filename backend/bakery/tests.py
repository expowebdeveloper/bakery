from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from account.models import CustomUser as User
from bakery.models import Bakery, BakeryOTP


class RegisterBakeryTestCase(APITestCase):
    fixtures = ["bakery/fixtures/fixture_data.json"]

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.get(pk=1)
        self.client.force_authenticate(user=self.user)

    def test_register_bakery_success(self):
        url = reverse("bakery_register")
        data ={
            "name": "Example Bakery",
            "contact_no": "1234567890",
            "term_condition": True,
            "user": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "test@example.com",
                "password": "securepassword",
                "role":"bakery"
            },
            "address": "123 Bakery St",
            "city": "Bakerstown",
            "state": "CA",
            "country": "US",
            "zipcode": "12345",
            "primary": True
}


        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_register_bakery_failure(self):
        url = reverse("bakery_register")
        data = {
            "name": "Example Bakery",
            "contact_no": "1234567890",
            "term_condition": True,
            "user": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "johne2@example.com",
                "password": "securepassword",
                "role":"bakery"
            },
            "address": "123 Bakery St",
            "city": "Bakerstown",
            "state": "CA",
            "country": "US",
            "zipcode": "12345",
            "primary": True
        }

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Ensure that neither the user nor the bakery was created
        self.assertFalse(User.objects.filter(email="bakery@example.com").exists())
        self.assertFalse(Bakery.objects.filter(name="Sweet Bakery").exists())


class UpdateBakeryAPIViewTestCase(APITestCase):
    fixtures = ["bakery/fixtures/fixture_data.json"]

    def setUp(self):
        # Authenticate the user
        self.user = User.objects.get(pk=1)
        self.client.force_authenticate(user=self.user)
        self.bakery_url = reverse("update-bakery")

    def test_update_bakery(self):
        data = {"name": "Updated Bakery", "contact_no": "0987654321"}
        response = self.client.patch(self.bakery_url, data, format="json")
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"], "Bakery updated successfully"
        )
        self.assertEqual(response.data["data"]["name"], "Updated Bakery")
        self.assertEqual(response.data["data"]["contact_no"], "0987654321")

    def test_update_bakery_invalid_contact_no(self):
        data = {"contact_no": "12345"}
        response = self.client.patch(self.bakery_url, data, format="json")

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("contact_no", response.data)

    def test_update_bakery_not_found(self):
        other_user = User.objects.create_user(
            password="password", email="otheruser@example.com", role="bakery"
        )
        self.client.force_authenticate(user=other_user)
        response = self.client.patch(
            self.bakery_url, {"name": "Attempted Update"}, format="json"
        )

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "No bakery found for this user")


class SendEmailOTPAPIViewTestCase(APITestCase):
    fixtures = ["bakery/fixtures/fixture_data.json"]

    def setUp(self):
        # Authenticate the user
        self.user = User.objects.get(pk=1)
        self.client.force_authenticate(user=self.user)
        self.email_otp_url = reverse("email-otp")

    @patch("bakery.views.send_verification_otp")
    def test_send_email_otp_success(self, mock_send_otp):
        mock_send_otp.return_value = None
        response = self.client.post(self.email_otp_url, format="json")
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "OTP sent to email successfully")

    @patch("bakery.views.send_verification_otp")
    def test_send_email_otp_invalid_email(self, mock_send_otp):
        mock_send_otp.side_effect = Exception("Invalid Email address")
        response = self.client.post(self.email_otp_url, format="json")
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)
        self.assertTrue("Invalid Email address" in response.data["message"])

    def test_send_email_otp_no_email(self):
        # Update fixture data to simulate no email
        self.user.email = ""
        self.user.save()

        response = self.client.post(self.email_otp_url, format="json")
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Something Went Wrong")


class SendSMSOTPAPIViewTestCase(APITestCase):
    fixtures = ["bakery/fixtures/fixture_data.json"]

    def setUp(self):
        # Authenticate the user
        self.user = User.objects.get(pk=1)
        self.bakery = Bakery.objects.get(
            user=self.user
        )  # Load bakery associated with user
        self.client.force_authenticate(user=self.user)
        self.sms_otp_url = reverse("sms-otp")

    @patch("bakery.views.send_verification_otp")
    def test_send_sms_otp_success(self, mock_send_otp):
        # Simulate successful OTP sending
        mock_send_otp.return_value = None

        response = self.client.post(self.sms_otp_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "OTP sent via SMS successfully")
        mock_send_otp.assert_called_once_with(self.bakery, phone=True)

    @patch("bakery.views.send_verification_otp")
    def test_send_sms_otp_invalid_contact(self, mock_send_otp):
        # Simulate an error in OTP sending (invalid phone number)
        mock_send_otp.side_effect = Exception("Invalid Phone number")

        response = self.client.post(self.sms_otp_url, format="json")
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "Invalid Phone number")

    def test_send_sms_otp_no_contact(self):
        # Remove the bakery's contact number to simulate missing contact
        self.bakery.contact_no = ""
        self.bakery.save()

        response = self.client.post(self.sms_otp_url, format="json")
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Contact number not found.")


class VerifyOTPAPIViewTestCase(APITestCase):
    fixtures = ["bakery/fixtures/fixture_data.json"]

    def setUp(self):
        self.user = User.objects.get(pk=1)
        self.bakery = Bakery.objects.get(user=self.user)
        self.bakery_otp = BakeryOTP.objects.get(bakery=self.bakery)
        self.client.force_authenticate(user=self.user)
        self.verify_otp_url = reverse("verify-otp")

    def test_verify_email_otp_success(self):
        """Test that email OTP verification is successful."""
        data = {
            "email_otp": "123456",
        }
        response = self.client.post(self.verify_otp_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Email OTP verification successful")
        self.bakery.refresh_from_db()
        self.assertTrue(self.bakery.email_verified)

    def test_verify_phone_otp_success(self):
        """Test that phone OTP verification is successful."""
        data = {
            "phone_otp": "654321",
        }
        response = self.client.post(self.verify_otp_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Phone OTP verification successful")
        self.bakery.refresh_from_db()
        self.assertTrue(self.bakery.contact_no_verified)

    def test_verify_invalid_email_otp(self):
        """Test that an invalid email OTP results in a 400 error."""
        data = {
            "email_otp": "999999",
        }
        response = self.client.post(self.verify_otp_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Invalid Email OTP")
        self.bakery.refresh_from_db()
        self.assertFalse(self.bakery.email_verified)

    def test_verify_expired_otp(self):
        """Test that an expired OTP cannot be used."""
        # Mock that the OTP has expired
        self.bakery_otp.expires_at = timezone.now() - timezone.timedelta(minutes=1)
        self.bakery_otp.save()

        data = {
            "email_otp": "123456",
        }
        response = self.client.post(self.verify_otp_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "OTP has expired.")
