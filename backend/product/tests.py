from io import BytesIO
import json
from decimal import Decimal
import tempfile
# from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from account.models import CustomUser as User
from product.models import (
    Category,
    SubCategory,
    Product,
    ProductImage,
    Inventory,
    ProductMaterial,
    ProductSeo,
    ProductVariant,
)
from product.serializers import (
    CategorySerializer,
    ProductMaterialSerializer,
    ProductSeoSerializer,
    ProductSerializer,
)


class CategoryViewSetTestCase(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager"
        )
        self.user.is_staff = True
        self.user.save()
        # Obtain JWT token for authentication
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_list_categories(self):
        url = reverse("categories")
        response = self.client.get(url)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)

    def test_create_category(self):
        url = reverse("categories")
        data = {"name": "New Category"}
        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), len(self.fixtures) + 1)
        

    def test_retrieve_category(self):
        category_id = Category.objects.first().id  # Get the ID from the fixture data
        url = reverse("categories", args=[category_id])
        response = self.client.get(url)
        category = Category.objects.get(id=category_id)
        serializer = CategorySerializer(category)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_update_category(self):
        category = Category.objects.first()
        url = reverse("categories", args=[category.id])
        data = {"name": "updated category"}
        response = self.client.patch(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        category.refresh_from_db()
        self.assertEqual(category.name, "updated category")

    def test_delete_category(self):
        category = Category.objects.first()
        url = reverse("categories", args=[category.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(id=category.id).exists())


class ProductViewSetTestCase(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager"
        )

        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")
        self.category = Category.objects.get(pk=1)
        self.sub_category_1 = SubCategory.objects.get(pk=1)
        self.sub_category_2 = SubCategory.objects.get(pk=2)
        # image_io = BytesIO(b'fake image content')  # Create fake image content
        # image_file = SimpleUploadedFile(
        #     name="test_image.jpg", content=image_io.read(), content_type="image/jpeg"
        # )

        self.product_data = {
        
            "name": "Burger",
            "product_tag": ["tag1", "tag2", "tag3"],
            "category": [1],
            "description": "Freshness overload, enjoy each slice with fabuluous taste.",
            "status": "available",
            "is_active": True,
            "product_detail": {
                "inventory": {
                    "sku": "BURGER-090",
                    "regular_price": 599.99,
                    "sale_price": 499.99,
                    "sale_price_dates_from": "2024-01-01",
                    "sale_price_dates_to": "2024-11-30",
                    "weight": 0.5,
                    "unit": "kg",
                    "bulking_price_rules": [
                        {
                            "quantity_from": "1",
                            "quantity_to": "10",
                            "price": 550.00
                        }
                    ]
                },
                "variants": [
                    {
                        "enabled": True,
                        "managed_stock": True,
                        "sku": "VAR-BURGER-090",
                        "regular_price": 599.99,
                        "sale_price": 499.99,
                        "sale_price_dates_from": "2024-01-01",
                        "sale_price_dates_to": "2024-11-30",
                        "quantity": 10,
                        "allow_backorders": "Do Not Allow",
                        "weight": 0.5,
                        "unit": "kg",
                        "description": "Variant description."
                    }
                ],
                "advanced": {
                    "purchase_note": "Handle with care.",
                    "min_order_quantity": "1"
                }
            },
            "product_seo": {
                "focused_keyword": ["Fresh and fully healthier one"],
                "seo_title": "Trust the taste not on the words",
                "slug": "Feel the super taste",
                "preview_as": "mobile",
                "meta_description": "Fresh and fully healthier one."
            },
            # "feature_image": image_file,  
        }

    def test_create_product(self):
        url = reverse("products")
        response = self.client.post(url, data= self.product_data, format="json")
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)# Expect only 1 product
        product = Product.objects.get(id=response.data["product_id"])
        self.assertEqual(product.name, "burger")

        # Check ProductVariant count
        self.assertEqual(ProductVariant.objects.filter(product=product).count(), 2)
        product_variant = ProductVariant.objects.filter(product=product).first()
        self.assertTrue(product_variant.enabled)

        inventory = Inventory.objects.get(product_variant=product_variant)
        self.assertEqual(inventory.sku, "burger-090")
        self.assertEqual(inventory.regular_price, Decimal('599.99'))
        self.assertEqual(inventory.sale_price,  Decimal('499.99'))
        self.assertEqual(inventory.total_quantity, 10)

        product_seo = ProductSeo.objects.get(product=product)
        self.assertEqual(product_seo.focused_keyword, ["Fresh and fully healthier one"])
        self.assertEqual(product_seo.seo_title, "Trust the taste not on the words")

     
    def test_retrieve_product(self):
        product_id = Product.objects.first().id
        url = reverse("product-detail", args=[product_id])
        response = self.client.get(url)
        product = Product.objects.get(id=product_id)
        serializer = ProductSerializer(product)

        response_data = response.data
        for item in response_data.get("images", []):
            item["image"] = item["image"].replace(
                "http://testserver/media/media/", "/media/"
            )
            item["image"] = item["image"].replace("http://testserver/media/", "/media/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_data, serializer.data)

    def test_update_product(self):
        product = Product.objects.first()
        url = reverse("product-detail", args=[product.id])

        self.product_data = {
        
            "name": "Updated Product",
            "product_tag": ["tag1", "tag2", "tag3"],
            "category": [1],
            "description": "Updated description",
            "status": "available",
            "is_active": True,
            "product_detail": {
                "inventory": {
                    "sku": "BURGER-090",
                    "regular_price": 599.99,
                    "sale_price": 499.99,
                    "sale_price_dates_from": "2024-01-01",
                    "sale_price_dates_to": "2024-11-30",
                    "weight": 0.5,
                    "unit": "kg",
                    "bulking_price_rules": [
                        {
                            "quantity_from": "1",
                            "quantity_to": "10",
                            "price": 550.00
                        }
                    ]
                },
                "variants": [
                    {
                        "enabled": True,
                        "managed_stock": True,
                        "sku": "VAR-BURGER-090",
                        "regular_price": 599.99,
                        "sale_price": 499.99,
                        "sale_price_dates_from": "2024-01-01",
                        "sale_price_dates_to": "2024-11-30",
                        "quantity": 10,
                        "allow_backorders": "Do Not Allow",
                        "weight": 0.5,
                        "unit": "kg",
                        "description": "Variant description."
                    }
                ],
                "advanced": {
                    "purchase_note": "Handle with care.",
                    "min_order_quantity": "1"
                }
            },
            "product_seo": {
                "focused_keyword": ["Fresh and fully healthier one"],
                "seo_title": "Trust the taste not on the words",
                "slug": "Feel the super taste",
                "preview_as": "mobile",
                "meta_description": "Fresh and fully healthier one."
            },
            # "feature_image": image_file,  
        }
        response = self.client.patch(url,  self.product_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.name, "updated product")
        self.assertEqual(product.description, "Updated description")

    def test_delete_product(self):
        # Get the first product from the fixture data
        product = Product.objects.first()
        url = reverse("product-detail", args=[product.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=product.id).exists())


class ProductVariantTests(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager"
        )

        # Obtain JWT token for authentication
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_product_variant_list(self):
        url = reverse("productvariant-list")
        response = self.client.get(url)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)

    def test_product_variant_create(self):
        url = reverse("productvariant-list")
        data = {
            "product": 1,
            "enabled": True,
            "managed_stock": True,
            "allow_backorders": "Allow",
            "description": "Variant description."
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


    def test_product_variant_update(self):
        url = reverse("productvariant-detail", args=[1])
        data = {
            "product": 1,
            "enabled": True,
            "managed_stock": True,
            "allow_backorders": "Allow",
            "description": "Variant description."
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
       

    def test_product_variant_delete(self):
        url = reverse("productvariant-detail", args=[1])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProductImageViewSetTestCase(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        # Create user for authentication
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager"
        )

        # Obtain JWT token for authentication
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_list_product_images(self):
        url = reverse("productimage-list")
        response = self.client.get(url)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)

    def test_create_product_image(self):
        # Ensure product with ID 1 exists
        product = Product.objects.first()
        self.assertIsNotNone(
            product, "Product with ID 1 does not exist in the fixture."
        )

        url = reverse("productimage-list")

        # Create a valid image in-memory
        image = Image.new("RGB", (100, 100))
        image_io = BytesIO()
        image.save(image_io, format="JPEG")
        image_io.seek(0)

        image_file = SimpleUploadedFile(
            name="test_image.jpg", content=image_io.read(), content_type="image/jpeg"
        )

        data = {"image": image_file, "product": product.id}

        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_product_image(self):
        url = reverse("productimage-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("image", response.data)
        self.assertEqual(response.data["id"], 1)

    def test_update_product_image(self):
        url = reverse("productimage-detail", kwargs={"pk": 1})
        image = Image.new("RGB", (100, 100))
        image_io = BytesIO()
        image.save(image_io, format="JPEG")
        image_io.seek(0)

        image_file = SimpleUploadedFile(
            name="image.jpg", content=image_io.read(), content_type="image/jpeg"
        )

        data = {"image": image_file, "product": 1}
        response = self.client.put(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_product_image(self):
        url = reverse("productimage-detail", kwargs={"pk": 1})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class SubCategoryTests(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager"
        )

        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_subcategory_list(self):
        """Test retrieving the list of subcategories."""
        url = reverse("subcategory-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)

    def test_create_subcategory(self):
        """Test creating a new subcategory."""
        url = reverse("subcategory-list")
        data = {
            "name": "New SubCategory",
            "category": 1,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], data["name"])

    def test_retrieve_subcategory(self):
        """Test retrieving a specific subcategory."""
        url = reverse("subcategory-detail", kwargs={"pk": 1})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "subcategory 1")

    def test_update_subcategory(self):
        """Test updating an existing subcategory."""
        url = reverse("subcategory-detail", kwargs={"pk": 1})
        data = {"name": "Updated SubCategory", "category": 1}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], data["name"])

    def test_delete_subcategory(self):
        """Test deleting a subcategory."""
        url = reverse("subcategory-detail", kwargs={"pk": 1})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# # +++++++++++++++++++++Product Seo TestCase ++++++++++++++++++++++++++


class ProductSeoTests(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="admin"
        )
        self.user.is_superuser=True
        self.user.save()
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_create_product_seo(self):
        url = reverse("productseo-list")
        data = {
            "product": 2,
            "focused_keyword": "Focused_keyword value",
            "seo_title": "Title field for Product",
            "slug": "This is my product ready to go for use",
            "preview_as": "mobile",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_product_seo(self):
        seo_obj = ProductSeo.objects.first().id
        url = reverse("productseo-detail", kwargs={"pk": seo_obj})
        response = self.client.get(url)
        Prod_obj = ProductSeo.objects.get(id=seo_obj)
        serializer = ProductSeoSerializer(Prod_obj)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_product_seo_update(self):
        seo_obj = ProductSeo.objects.first()
        url = reverse("productseo-detail", kwargs={"pk": seo_obj.id})
        data = {
            "product": 1,
            "focused_keyword": "Updated_keyword value",
            "seo_title": "Updated field for Product",
            "slug": "This is updated slug value",
            "preview_as": "mobile",
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        seo_obj.refresh_from_db()
        self.assertEqual(seo_obj.focused_keyword, "Updated_keyword value")
        self.assertEqual(seo_obj.seo_title, "Updated field for Product")

    def test_product_seo_delete(self):
        seo_obj = ProductSeo.objects.first()
        url = reverse("productseo-detail", kwargs={"pk": seo_obj.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ProductSeo.objects.filter(id=seo_obj.id).exists())


# # =========================Product Material TestCase ==========================


class ProductMaterialTests(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="admin"
        )
        self.user.is_superuser=True
        self.user.save()
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_create_product_material(self):
        url = reverse("productmaterial-list")
        data = {
            "name": "product title",
            "quantity": 1,
            "expiry_date": "2025-09-27T00:00:00Z",
            "unit_of_measure": "kg",
            "cost": "987.45",
            "reorder": 2,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_material(self):
        prod_obj = ProductMaterial.objects.first().id
        url = reverse("productmaterial-detail", kwargs={"pk": prod_obj})
        response = self.client.get(url)
        material = ProductMaterial.objects.get(id=prod_obj)
        serializer = ProductMaterialSerializer(material)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_product_material_update(self):
        prod_obj = ProductMaterial.objects.first()
        url = reverse("productmaterial-detail", kwargs={"pk": prod_obj.id})
        data = {
            "name": "Updated title",
            "quantity": 1,
            "expiry_date": "2025-11-27T00:00:00Z",
            "unit_of_measure": "kg",
            "cost": "987.45",
            "reorder": 2,
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prod_obj.refresh_from_db()
        self.assertEqual(prod_obj.name, "updated title")

    def test_product_material_delete(self):
        prod_obj = ProductMaterial.objects.first()
        url = reverse("productmaterial-detail", kwargs={"pk": prod_obj.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class ProductAndMaterialListViewTests(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        self.user = User.objects.create_user(
            email="admin@example.com", password="adminpassword", role="admin"
        )
        self.user.is_superuser=True
        self.user.save()
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_product_and_material_list(self):
        """Test retrieving the list of product variants and materials."""
        url = reverse("inventory-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)


class UpdateQuantityAPIViewTests(APITestCase):
    fixtures = ["product/fixtures/product.json"]

    def setUp(self):
        self.user = User.objects.create_user(
            email="admin@example.com", password="adminpassword", role="admin"
        )
        self.user.is_superuser=True
        self.user.save()
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_update_quantity_success(self):
        url = reverse("update-stock")
        data = {
            "sku": "PROD-1-VAR-10",
            "status": "AVAILABLE",
            "quantity": 70,
            "start_from": 1,
            "end_from": 20,
        }
        response = self.client.put(url, data, format="json")
        # Check the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 80)
        
    def test_update_quantity_variant_not_found(self):
        url = reverse("update-stock")
        data = {"sku":"PROD-1-VAR-13", "quantity": 10}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Product variant not found.", response.data["error"])

    def test_update_quantity_invalid_quantity(self):
        url = reverse("update-stock")
        invalid_data = {"items": "PROD-1-VAR-10",
                         "sku":"PROD-1-VAR-10", "quantity": -5}
        response = self.client.put(url, invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Quantity must be a positive number.", response.data["error"])
