from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from account.models import CustomUser as User
from bakery.models import Bakery
from cart.models import Cart, CartItem
from orders.models import Order
from orders.serializers import OrderSerializer
from product.models import Category, Product, ProductVariant


class CheckoutAPITestCase(APITestCase):
    fixtures = ["orders/fixtures/orders_data.json"]

    def setUp(self):
        self.client = APIClient()
        self.user_bakery = User.objects.get(pk=1)

        self.bakery, created = Bakery.objects.get_or_create(
            user=self.user_bakery,
            defaults={
                "name": "Test Bakery",
                "address": "123 Bakery St",
                "city": "Bakery City",
                "state": "Bakery State",
                "country": "Bakery Country",
                "zipcode": "12345",
                "contact_no": "1234567890",
                "email_verified": True,
            },
        )

        self.cart, created = Cart.objects.get_or_create(user=self.user_bakery)
        self.category = Category.objects.create(name="Cat1")
        self.product = Product.objects.create(name="Product", category=self.category)
        self.product_variant = ProductVariant.objects.create(
            product=self.product,
            price=10.00,
            weight=100,
        )

        # Create a cart item
        CartItem.objects.create(
            cart=self.cart, product_variant=self.product_variant, quantity=2
        )

        self.client.force_authenticate(user=self.user_bakery)

    def test_checkout_success_bakery_user(self):
        """Test successful checkout for bakery user."""
        self.bakery.email_verified = True
        self.bakery.save()

        CartItem.objects.create(
            cart=self.cart, product_variant=self.product_variant, quantity=2
        )

        url = reverse("checkout")
        response = self.client.post(
            url, data={"shipping_address": "123 Bakery St, Bakery City"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("order_id", response.data)
        self.assertTrue(Order.objects.filter(id=response.data["order_id"]).exists())

    def test_checkout_empty_cart(self):
        """Test checkout when the cart is empty."""
        CartItem.objects.filter(cart=self.cart).delete()

        url = reverse("checkout")
        response = self.client.post(
            url, data={"shipping_address": "123 Bakery St, Bakery City"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Your cart is empty")

    def test_checkout_bakery_profile_not_found(self):
        """Test checkout when bakery profile does not exist."""
        self.bakery.delete()

        url = reverse("checkout")
        response = self.client.post(
            url, data={"shipping_address": "123 Bakery St, Bakery City"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Bakery profile not found")

    def test_checkout_regular_user(self):
        """Test checkout for a regular user with contact information in session."""
        self.client.session["contact_info"] = {
            "email": self.user_bakery.email,
            "contact_number": self.bakery.contact_no,
            "shipping_address": "123 Bakery St, Bakery City",
        }
        self.client.session.save()

        url = reverse("checkout")
        response = self.client.post(url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_checkout_email_not_verified(self):
        """Test checkout for bakery user when email is not verified."""
        self.bakery.email_verified = False
        self.bakery.save()

        url = reverse("checkout")
        response = self.client.post(
            url, data={"shipping_address": "123 Bakery St, Bakery City"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["message"], "Please Verify your email")


class OrderListAPIViewTestCase(APITestCase):
    fixtures = ["orders/fixtures/orders_data.json"]

    def setUp(self):
        self.user = User.objects.get(email="accountant@example.com")

        self.access_token = str(RefreshToken.for_user(self.user).access_token)

        self.url = reverse("orders")

    def test_get_order_list_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        orders = Order.objects.filter(user=self.user)

        serializer = OrderSerializer(orders, many=True)
        self.assertEqual(response.data["results"], serializer.data)

    def test_get_order_list_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ApproveOrderAPIViewTestCase(APITestCase):
    fixtures = ["orders/fixtures/orders_data.json"]

    def setUp(self):
        self.accountant_user = User.objects.get(email="accountant@example.com")
        self.accountant_user.role = "accountant"
        self.accountant_user.save()

        self.access_token = str(
            RefreshToken.for_user(self.accountant_user).access_token
        )
        self.url = reverse("update-pending-approval", kwargs={"pk": 1})

    def test_get_approve_order_list_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_patch_approve_order_status(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        data = {"status": "payment_pending"}

        response = self.client.patch(self.url, data, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Updated status successfully")

        order = Order.objects.get(pk=1)
        self.assertEqual(order.status, "payment_pending")

    def test_patch_approve_order_invalid_status(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        data = {"status": "INVALID_STATUS"}

        response = self.client.patch(self.url, data, format="json")

        # Check if the status code is 400 Bad Request
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    def test_patch_approve_order_not_found(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        invalid_url = reverse("update-pending-approval", kwargs={"pk": 999})

        data = {"status": "rejected"}
        response = self.client.patch(invalid_url, data, format="json")

        # Check if the status code is 400 Bad Request
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["message"], "Order not found")
