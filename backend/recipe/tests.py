import json
from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from account.models import CustomUser as User
from recipe.models import Category, Ingredient, Instruction, Recipe


class RecipeViewSetTestCase(APITestCase):
    fixtures = ["recipe/fixtures/recipe.json"]

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="Test Category 1", description="Test Category Description"
        )

    def setUp(self):

        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager"
        )

        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

    def test_list_recipe(self):
        url = reverse("recipe-list-create")
        response = self.client.get(url)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)

    def test_recipe_creation(self):
        url = reverse("recipe-list-create")
        self.user.is_staff = True
        self.user.save()
        # image = SimpleUploadedFile(
        #     "image.jpg", b"file_content", content_type="image/jpeg"
        #      )
        data = {
            "recipe_title": "New Recipe",
            "description": "Recipe Description",
            "category": json.dumps([self.category.id]),
            "cook_time": 55,
            "preparation_time": 23,
            "serving_size": 23,
            "difficulty_level": "M",
            "status": "publish",
            "notes": "My notes",
            "dietary_plan": "DF",
            "allergen_information": "CN",
            # "recipe_images": [image],
            "ingredients": json.dumps(
                [
                    {
                        "name": "ingredient_name",
                        "quantity": 390.9,
                        "unit_of_measure": "g",
                    },
                    {
                        "name": "ingredient_name",
                        "quantity": 450.00,
                        "unit_of_measure": "g",
                    },
                ]
            ),
            "instructions": json.dumps(
                [
                    {
                        "step_count": 123,
                        "instructions": "instructions",
                        "notes": "notes",
                    },
                    {
                        "step_count": 234,
                        "instructions": "instructions",
                        "notes": "notes",
                    },
                ]
            ),
        }
        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recipe.objects.count(), 2)
        recipe = Recipe.objects.get(id=response.data["id"])
        self.assertEqual(response.data["message"], "Object Created successfully")
        self.assertEqual(Ingredient.objects.filter(recipe=recipe).count(), 2)
        self.assertEqual(Instruction.objects.filter(recipe=recipe).count(), 2)

    def test_mandatory_fields(self):
        url = reverse("recipe-list-create")
        self.user.is_staff = True
        self.user.save()
        data = {
            "recipe_title": "New Recipe",
            "description": "Recipe Description",
            "category": self.category.id,
            "cook_time": 55,
            "preparation_time": 23,
            "serving_size": 23,
            "difficulty_level": "M",
            "dietary_plan": "DF",
            "allergen_information": "CN",
        }
        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Mandatory fields cannot be empty")

    def test_retrieve_product(self):
        recipe_id = Recipe.objects.first().id
        url = reverse("recipe-detail", args=[recipe_id])
        response = self.client.get(url)
        Recipe.objects.get(id=recipe_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_product(self):
        self.user.is_staff = True
        self.user.save()
        recipe_id = Recipe.objects.first().id
        recipe = Recipe.objects.get(id=recipe_id)
        url = reverse("recipe-detail", args=[recipe_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        recipe.refresh_from_db()


class IngredientViewSetTestCase(APITestCase):
    fixtures = ["recipe/fixtures/recipe.json"]

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(
            name="Test Category 1", description="Test Category Description"
        )

    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager"
        )

        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")

        # Create a sample Recipe instance to link to Ingredient
        self.recipe = Recipe.objects.create(
            recipe_title="New Recipe",
            description="Recipe Description",
            cook_time=55,
            preparation_time=23,
            serving_size=23,
            difficulty_level="M",
            dietary_plan="DF",
            allergen_information="CN",
        )

    def test_ingredients_creation(self):
        url = reverse("ingredient-list-create")
        self.user.is_staff = True
        self.user.save()

        # Serialize the Recipe instance into a dictionary before sending
        data = {
            "recipe": self.recipe.id,
            "name": "ingredient_name",
            "quantity": 390.9,
            "unit_of_measure": "g",
        }

        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_ingredients(self):
        ingredient_id = Ingredient.objects.first().id
        url = reverse("ingredient-detail", args=[ingredient_id])
        response = self.client.get(url)
        Ingredient.objects.get(id=ingredient_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_ingredient(self):
        # Retrieve the first ingredient
        ingredient = Ingredient.objects.first()
        self.assertIsNotNone(ingredient, "No ingredient found to update.")

        # Set up the user
        self.user.is_staff = True
        self.user.save()

        # Generate the URL
        url = reverse("ingredient-detail", args=[ingredient.id])

        # Data for update
        data = {
            "name": "Updated Ingredient Name",
            "quantity": 390.9,  # Float value for test
            "unit_of_measure": "g",
        }

        # Make the PATCH request
        response = self.client.patch(url, data, format="json")

        # Print debugging information
        print("Response Status Code:", response.status_code)
        print("Response Data:", response.data)

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ingredient.refresh_from_db()
        self.assertEqual(ingredient.name, data["name"])
        self.assertEqual(
            ingredient.quantity, Decimal(str(data["quantity"]))
        )  # Convert float to Decimal
        self.assertEqual(ingredient.unit_of_measure, data["unit_of_measure"])

    def test_delete_ingredient(self):
        self.user.is_staff = True
        self.user.save()
        ingredient_id = Ingredient.objects.first().id
        url = reverse("ingredient-detail", args=[ingredient_id])
        ingredient = Ingredient.objects.get(id=ingredient_id)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        ingredient.refresh_from_db()


class InstructionsViewSetTestCase(APITestCase):
    fixtures = ["recipe/fixtures/recipe.json"]

    def setUp(self):

        self.user = User.objects.create_user(
            email="testuser@example.com", password="testpassword", role="stock_manager"
        )

        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.access_token}")
        self.recipe = Recipe.objects.create(
            recipe_title="New Recipe",
            description="Recipe Description",
            cook_time=55,
            preparation_time=23,
            serving_size=23,
            difficulty_level="M",
            dietary_plan="DF",
            allergen_information="CN",
        )

    def test_instruction_creation(self):
        url = reverse("instruction-list-create")
        self.user.is_staff = True
        self.user.save()
        data = {
            "recipe": self.recipe.id,
            "step_count": 123,
            "instructions": "Recipe instructions",
            "notes": "A cheese cake.",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_instruction(self):
        instruction_id = Instruction.objects.first().id
        url = reverse("instruction-detail", args=[instruction_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_instruction(self):
        instruction_id = Instruction.objects.first().id
        url = reverse("instruction-detail", args=[instruction_id])
        data = {
            "recipe": self.recipe.id,
            "step_count": 99,
            "instructions": "inst2",
            "notes": "adc",
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_instructions(self):
        instruction_id = Instruction.objects.first().id
        url = reverse("instruction-detail", args=[instruction_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
