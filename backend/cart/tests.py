from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import CustomUser as User
from cart.models import Cart


class CartAPITestCase(APITestCase):
    fixtures = ["cart/fixtures/cart_data.json"]

    def setUp(self):
        # Create a user for the authenticated tests
        self.user = User.objects.create_user(
            email="testuser1@gmail.com", password="testpassword"
        )
        self.client.login(email="testuser1@gmail.com", password="testpassword")
        self.cart, _ = Cart.objects.get_or_create(user=self.user)

    def test_create_cart_for_unauthenticated_user(self):
        # Log out the user and test if unauthenticated users can create a cart
        self.client.logout()
        url = reverse("cart-create")
        response = self.client.get(url)
        # Ensure that unauthenticated users can create a cart via session_id
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("session_id", response.data)

    def test_get_cart_for_authenticated_user(self):
        # Test retrieving the cart for an authenticated user
        url = reverse("cart-create")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("id", response.data)
        self.assertIn("items", response.data)
        self.assertIn("total_price", response.data)

    def test_get_cart_for_unauthenticated_user(self):
        # Test retrieving the cart for an unauthenticated user
        self.client.logout()
        url = reverse("cart-create")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("id", response.data)
        self.assertIn("items", response.data)
        self.assertIn("total_price", response.data)

    def test_cart_creation_for_authenticated_user(self):
        # Test if the authenticated user can create a cart
        url = reverse("cart-create")
        response = self.client.post(url, data={})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertIn("user", response.data)


# class CartItemAPITestCase(APITestCase):
#     fixtures = ["cart/fixtures/cart_data.json"]

#     def setUp(self):
#         self.user = User.objects.create_user(
#             email="testuser1@gmail.com", password="testpassword"
#         )
#         self.client.login(email="testuser1@gmail.com", password="testpassword")
#         self.product_variant = ProductVariant.objects.get(id=1)
#         self.cart, _ = Cart.objects.get_or_create(user=self.user)
#         self.cart_item = CartItem.objects.create(
#             cart=self.cart, product_variant=self.product_variant, quantity=1
#         )

#     def test_add_cart_item(self):
#         url = reverse("cart-item-create")
#         response = self.client.post(
#             url, {"product_variant": self.product_variant.id, "quantity": 2}
#         )
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data["quantity"], 3)  # Existing quantity + new

#     def test_update_cart_item(self):
#         url = reverse("cart-item", args=[self.cart_item.id])
#         response = self.client.put(url, {"quantity": 5})
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data["quantity"], 5)

#     def test_delete_cart_item(self):
#         url = reverse("cart-item", args=[self.cart_item.id])
#         response = self.client.delete(url)
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#         self.assertEqual(CartItem.objects.filter(cart=self.cart).count(), 0)

#     def test_get_cart_items(self):
#         url = reverse("cart-item-create")
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(len(response.data), 1)
