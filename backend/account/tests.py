from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from account.models import CustomUser, EmployeeDetail, PasswordResetOTP


class RegisterAPIViewTest(APITestCase):
    fixtures = ["account/fixtures/users.json"]

    def setUp(self):
        # Create an admin user for authentication
        self.admin_user = CustomUser.objects.create_superuser(
            email="admin@example.com",
            password="AdminPass123",
            first_name="Admin",
            last_name="User",
            role="admin",
        )
        self.token = RefreshToken.for_user(self.admin_user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self.url = reverse("register")  # Ensure the URL name is correct

    def test_register_user_success(self):
        employee_detail = {
            "employee_id": 23,
            "address": "string",
            "city": "string",
            "state": "Stockholm",
            "country": "SE",
            "zip_code": "string",
            "contact_no": "17313733112",
            "hiring_date": "2024-11-01",
            "shift": "Morning",
        }

        data = {
            "email": "anjali@avioxtechnologies.com",
            "first_name": "Anjali",
            "last_name": "Worker",
            "role": "worker",
            "employee_detail": employee_detail,
        }

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(
            response.status_code, status.HTTP_201_CREATED
        )  # Expect a 201 response
        self.assertIn("user", response.data)
        self.assertIn("message", response.data)

        # Verify user creation
        user = get_user_model().objects.get(email="anjali@avioxtechnologies.com")
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, "Anjali")
        self.assertEqual(user.last_name, "Worker")

    # flake8: noqa: E501
    def test_register_user_failure(self):
        self.url = reverse("register")
        employee_detail = {
            "employee_id": 213,
            "address": "string",
            "city": "string",
            "state": "Stockholm",
            "country": "SE",
            "zip_code": "string",
            "contact_no": "17313733112",
            "hiring_date": "2024-11-01",
            "shift": "Morning",
        }
        data = {
            "email": "testuser1@example.com",
            "password": "pbkdf2_sha256$870000$Ne8gEoh0fxPZQsqpf4gSjc$aOMNmgeXRLjMyFTstIssEHEcGt0UYN94lD4M/LMsFvA=",
            "first_name": "Test",
            "last_name": "User",
            "role": "worker",
            "employee_detail": employee_detail,
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data["message"])
        self.assertEqual(response.data["message"]["email"][0].code, "invalid")


class LoginAPIViewTest(TestCase):

    fixtures = ["account/fixtures/users.json"]

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("login")

    def test_login_success(self):
        data = {"email": "testuser@example.com", "password": "testpassword123"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("refresh", response.data)
        self.assertIn("access", response.data)

    def test_login_failure(self):
        data = {"email": "testuser@example.com", "password": "wrongpassword"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)


class ForgetPasswordAPIViewTestCase(TestCase):
    fixtures = ["account/fixtures/users.json"]  # Load the user data from fixture

    def setUp(self):
        self.url = reverse("forget-password")  # Adjust to your URL name
        self.valid_data = {"email": "testuser@example.com"}
        self.invalid_data = {"email": "nonexistentuser@example.com"}

        # Fetch user from the database after loading fixtures
        self.user = CustomUser.objects.get(email=self.valid_data["email"])

    @patch("account.views.send_mail")  # Mock send_mail
    def test_forget_password_success(self, mock_send_mail):
        # Mock the send_mail function to prevent actual emails from being sent
        mock_send_mail.return_value = None

        response = self.client.post(self.url, self.valid_data, format="json")

        # Check that the response is successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "OTP has been sent to your email."})

        # Check that the OTP was generated and saved
        otp_instance = PasswordResetOTP.objects.get(user=self.user)
        self.assertTrue(otp_instance.is_valid)
        self.assertIsNotNone(otp_instance.otp)

        # Check that the email sending function was called
        mock_send_mail.assert_called_once()

    def test_forget_password_user_not_found(self):
        response = self.client.post(self.url, self.invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            response.data, {"error": "User with this email does not exist."}
        )


class ResetPasswordAPIViewTestCase(TestCase):
    fixtures = ["account/fixtures/users.json"]

    def setUp(self):
        self.user = CustomUser.objects.get(
            email="user@example.com", role="stock_manager"
        )
        self.old_password = "testpassword123"
        self.user.set_password(self.old_password)
        self.user.save()

        self.valid_payload = {
            "email": self.user.email,
            "old_password": self.old_password,
            "new_password": "NewPassword123",
        }

        self.invalid_old_password_payload = {
            "email": self.user.email,
            "old_password": "WrongOldPassword",
            "new_password": "NewPassword123",
        }

        self.same_as_old_payload = {
            "email": self.user.email,
            "old_password": self.old_password,
            "new_password": self.old_password,
        }

        self.token = RefreshToken.for_user(self.user)
        self.url = reverse("create-new-password")

    def test_reset_password_success(self):
        """
        Test successful password reset with correct old password.
        """
        self.user.is_staff = True
        self.user.save()
        response = self.client.post(
            self.url,
            self.valid_payload,
            HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Password reset successful.")

        # Verify that the password has been updated
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPassword123"))

    def test_reset_password_invalid_old_password(self):
        """
        Test password reset fails with an incorrect old password.
        """
        self.user.is_staff = True
        self.user.save()
        response = self.client.post(
            self.url,
            self.invalid_old_password_payload,
            HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Old password is incorrect.")

    def test_reset_password_same_as_old(self):
        """
        Test password reset fails if new password is the same as the old password.
        """
        response = self.client.post(
            self.url,
            self.same_as_old_payload,
            HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["error"], "New password could not be same as old password"
        )


class ResetPasswordOtpAPIViewTestCase(TestCase):
    fixtures = [
        "account/fixtures/users.json",
        "account/fixtures/reset_password.json",
    ]  # Load user and OTP fixtures

    def setUp(self):
        # Load the user and OTP from the fixture
        self.user = CustomUser.objects.get(email="testuser@example.com")
        self.otp_instance = PasswordResetOTP.objects.get(user=self.user)

        # Define valid and invalid payloads
        self.valid_payload = {"email": self.user.email, "otp": self.otp_instance.otp}

        self.invalid_otp_payload = {
            "email": self.user.email,
            "otp": "654321",  # Invalid OTP
        }

        self.invalid_email_payload = {
            "email": "wronguser@example.com",
            "otp": self.otp_instance.otp,
        }

        self.url = reverse(
            "reset-password-otp-verify"
        )  # Make sure to use the correct URL name

    def test_reset_password_success(self):
        """
        Test successful password reset with valid OTP and email.
        """
        response = self.client.post(self.url, self.valid_payload)
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Otp Verification successful.")

        # Verify that the password has been updated
        self.user.refresh_from_db()

    def test_reset_password_invalid_otp(self):
        """
        Test password reset fails with an invalid OTP.
        """
        response = self.client.post(self.url, self.invalid_otp_payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Invalid OTP.")

    def test_reset_password_invalid_email(self):
        """
        Test password reset fails with an invalid email.
        """
        response = self.client.post(self.url, self.invalid_email_payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "User with this email does not exist.")

    def test_reset_password_expired_otp(self):
        """
        Test password reset fails if OTP is expired.
        """
        # Manually expire the OTP for testing
        self.otp_instance.created_at = timezone.now() - timedelta(minutes=10)
        self.otp_instance.save()

        response = self.client.post(self.url, self.valid_payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "OTP has expired.")


class UserManagementAPIViewTest(APITestCase):
    fixtures = ["account/fixtures/users.json"]  # Adjust your fixtures path as needed

    def setUp(self):
        # Create an admin user for authentication
        self.admin_user = CustomUser.objects.create_superuser(
            email="admin@example.com",
            password="AdminPass123",
            first_name="Admin",
            last_name="User",
            role="admin",
        )
        self.token = RefreshToken.for_user(self.admin_user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        # Create a test user and employee detail
        self.user = CustomUser.objects.create(
            email="testusers@example.com",
            password="TestPass123",
            first_name="Test",
            last_name="User",
            role="employee",
        )
        self.employee_detail = EmployeeDetail.objects.create(
            user=self.user, hiring_date="2024-11-01", shift="Morning"
        )

        # URLs
        self.detail_url = reverse("employee_detail", args=[self.user.id])

    def test_get_users_success(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_user_success(self):
        updated_data = {"shift": "Night"}
        response = self.client.patch(self.detail_url, updated_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()

    def test_patch_user_not_found(self):
        # Use a very large or unlikely ID to avoid collisions with fixture data
        response = self.client.patch(
            reverse("employee_detail", args=[9999]),
            {"email": "newemail@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "User not found")
