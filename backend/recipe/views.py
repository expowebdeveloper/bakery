import base64
import json
from decimal import Decimal
from io import BytesIO

from django.db import transaction
from django.db.models import Q, Value
from django.db.models.functions import Concat
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from xhtml2pdf import pisa

from account.permissions import AllowGetOnlyIsAdminStockManager, IsAdmin
from product.utils import CustomPagination
from recipe.filters import RecipeFilter
from recipe.models import (
    Allergen,
    Category,
    Ingredient,
    Instruction,
    Recipe,
    RecipeImage,
    RecipeNutrition,
)
from recipe.serializers import (
    AllergenSerializer,
    BulkRecipeSerializer,
    IngredientSerializer,
    InstructionSerializer,
    RecipeImageSerializer,
    RecipeScaleSerializer,
    RecipeSerializer,
    UpdateIngredientQuantitySerializer,
)
from recipe.utils import get_nutritions


class RecipeView(APIView):
    """
    API view for managing recipes with comprehensive filtering and sorting.

    Methods:
    - GET: List all recipes with filters:
        - status: publish/draft/trash/all
        - search: Search by title, category, preparation time, serving size, difficulty level
        - sort_by: created_at/title/category/preparation_time
        - sort: asc/desc
    - POST: Create a new recipe with ingredients and steps

    Authentication:
    - Requires JWT authentication
    - Admin access required for all operations except GET
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = CustomPagination

    def get(self, request):
        recipes = Recipe.objects.all().order_by("-created_at")

        # Filtering logic for status
        status_filter = request.query_params.get("status", None)
        if status_filter:
            if status_filter == "publish":
                recipes = recipes.filter(is_active=True, is_deleted=False)
            elif status_filter == "draft":
                recipes = recipes.filter(is_active=False, is_deleted=False)
            elif status_filter == "trash":
                recipes = recipes.filter(is_deleted=True)
            elif status_filter == "all":
                recipes = recipes.filter(is_deleted=False)
        else:
            recipes = recipes.filter(is_deleted=False)

        # Search by title
        search_query = request.query_params.get("search")
        if search_query:
            recipes = recipes.annotate(
                full_name=Concat(
                    "updated_by__first_name", Value(" "), "updated_by__last_name"
                )
            ).filter(
                Q(recipe_title__icontains=search_query)
                | Q(category__name__iregex=search_query)
                | Q(preparation_time__iregex=search_query)
                | Q(serving_size__iregex=search_query)
                | Q(difficulty_level__iregex=search_query)
                | Q(category__name__icontains=search_query)
                | Q(full_name__icontains=search_query)
                | Q(status__icontains=search_query)
            )
        # Apply filters
        filterset = RecipeFilter(request.GET, queryset=recipes)
        if not filterset.is_valid():
            return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)
        recipes = filterset.qs

        # Sorting logic
        sort_field = request.query_params.get("sort_by", "created_at")
        sort_order = request.query_params.get("sort", "asc")

        valid_sort_fields = [
            "created_at",
            "preparation_time",
            "cook_time",
            "serving_size",
            "recipe_title" "status",
        ]
        if sort_field not in valid_sort_fields:
            sort_field = "created_at"

        if sort_order == "desc":
            recipes = recipes.order_by(sort_field)
        else:
            recipes = recipes.order_by(f"-{sort_field}")

        # Pagination
        paginator = self.pagination_class()
        paginated_recipes = paginator.paginate_queryset(recipes, request)

        # Serialize data
        serializer = RecipeSerializer(paginated_recipes, many=True)
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(auto_schema=None)
    def post(self, request):
        data = request.data.copy()
        mandatory_fields = [
            "recipe_title",
            "description",
            "status",
            "category",
            "cook_time",
            "preparation_time",
            "serving_size",
            "difficulty_level",
            "dietary_plan",
        ]

        try:
            with transaction.atomic():
                # Validate mandatory fields
                if not all(data.get(field) for field in mandatory_fields):
                    return Response(
                        {"error": "Mandatory fields cannot be empty"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                dietary_plan = data.get("dietary_plan", [])
                if isinstance(dietary_plan, str):
                    import ast

                    dietary_plan = ast.literal_eval(dietary_plan)

                if Recipe.objects.filter(recipe_title=data["recipe_title"]).exists():
                    return Response(
                        {"error": "Recipe with this title already exists"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Create Recipe instance
                recipe = Recipe.objects.create(
                    recipe_title=data["recipe_title"],
                    description=data["description"],
                    status=data["status"],
                    cook_time=int(data["cook_time"]),
                    preparation_time=int(data["preparation_time"]),
                    serving_size=int(data["serving_size"]),
                    difficulty_level=data["difficulty_level"],
                    notes=data.get("notes", ""),
                    dietary_plan=dietary_plan,
                    updated_by=request.user,
                )

                # Handle category assignment
                category_ids = data.get("category", "[]")
                try:
                    category_ids = (
                        json.loads(category_ids)
                        if isinstance(category_ids, str)
                        else category_ids
                    )
                except json.JSONDecodeError:
                    return Response({"error": "Invalid category format"}, status=400)

                if not category_ids:
                    return Response({"error": "No categories provided"}, status=400)

                categories = Category.objects.filter(id__in=category_ids)
                if len(categories) != len(category_ids):
                    return Response(
                        {"error": "Some categories do not exist"}, status=400
                    )

                recipe.category.set(categories)

                # Handle allergen assignment (dynamic)
                allergen_ids = data.get("allergen_information", "[]")
                try:
                    allergen_ids = (
                        json.loads(allergen_ids)
                        if isinstance(allergen_ids, str)
                        else allergen_ids
                    )
                except json.JSONDecodeError:
                    allergen_ids = []
                    # return Response({"error": "Invalid allergen format"}, status=400)

                allergens = Allergen.objects.filter(id__in=allergen_ids)
                recipe.allergen_information.set(allergens)

                # Handle instructions
                instructions_data = data.get("instructions", "[]")
                try:
                    instructions_data = (
                        json.loads(instructions_data)
                        if isinstance(instructions_data, str)
                        else instructions_data
                    )
                except json.JSONDecodeError:
                    return Response(
                        {"error": "Invalid instructions format"}, status=400
                    )

                for instruction_data in instructions_data:
                    Instruction.objects.create(
                        recipe=recipe,
                        step_count=instruction_data["step_count"],
                        instructions=instruction_data["instructions"],
                        notes=instruction_data.get("notes", ""),
                    )

                # Handle ingredients
                ingredients_data = data.get("ingredients", "[]")
                try:
                    ingredients_data = (
                        json.loads(ingredients_data)
                        if isinstance(ingredients_data, str)
                        else ingredients_data
                    )
                except json.JSONDecodeError:
                    return Response({"error": "Invalid ingredients format"}, status=400)
                nutritions_result = json.loads(get_nutritions(ingredients_data))

                if nutritions_result:
                    RecipeNutrition.objects.create(
                        recipe=recipe,
                        calories=nutritions_result.get("calories", 0.0),
                        protein=nutritions_result.get("protein", 0.0),
                        fat=nutritions_result.get("fat", 0.0),
                        carbohydrates=nutritions_result.get("carbohydrates", 0.0),
                        energy=nutritions_result.get("energy", 0.0),
                        fiber=nutritions_result.get("fiber", 0.0),
                        salt=nutritions_result.get("salt", 0.0),
                        sugar=nutritions_result.get("sugar", 0.0),
                    )
                for ing_data in ingredients_data:
                    Ingredient.objects.create(
                        recipe=recipe,
                        name=ing_data["name"],
                        quantity=ing_data["quantity"],
                        unit_of_measure=ing_data["unit_of_measure"],
                    )

                # Handle images (multiple images allowed)
                allowed_formats = ["image/jpeg", "image/png", "image/jpg"]
                images = request.FILES.getlist("recipe_images")

                for image in images:
                    if image.content_type not in allowed_formats:
                        return Response({"error": "Invalid image format"}, status=400)
                    RecipeImage.objects.create(recipe=recipe, image=image)

                return Response(
                    {"message": "Recipe created successfully", "id": recipe.id},
                    status=201,
                )

        except ValidationError as e:
            return Response({"errors": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RecipeDetailView(APIView):
    """
    API view for managing individual recipes.

    Methods:
    - GET: Retrieve a specific recipe's details including ingredients and steps
    - PUT: Update a complete recipe including ingredients and steps
    - PATCH: Partially update a recipe
    - DELETE: Delete/trash a recipe

    Authentication:
    - Requires JWT authentication
    - Admin access required for all operations except GET
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk):
        try:
            return Recipe.objects.get(pk=pk)
        except Recipe.DoesNotExist:
            return None

    def get(self, request, pk):
        recipe = self.get_object(pk)
        if recipe is None:
            return Response(
                {"message": "Recipe not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = RecipeSerializer(recipe)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        recipe = get_object_or_404(Recipe, pk=pk)

        try:
            with transaction.atomic():
                data = request.data.copy()
                original_serving_size = recipe.serving_size

                # ✅ Update serving size
                def to_bool(value):
                    if isinstance(value, bool):
                        return value
                    if isinstance(value, str):
                        return value.lower() in [
                            "true",
                            "1",
                        ]  # ✅ Convert "true" or "1" to True
                    return False

                new_serving_size = data.get("serving_size")
                if new_serving_size:
                    new_serving_size = int(new_serving_size)
                    recipe.serving_size = new_serving_size

                # ✅ Update categories (Many-to-Many)
                category_data = data.get("category", "[]")
                try:
                    category_data = (
                        json.loads(category_data)
                        if isinstance(category_data, str)
                        else category_data
                    )
                except json.JSONDecodeError:
                    return Response({"error": "Invalid category format."}, status=400)

                categories = Category.objects.filter(id__in=category_data)
                if len(categories) != len(category_data):
                    return Response(
                        {"error": "Some categories do not exist."}, status=400
                    )
                recipe.category.set(categories)

                # ✅ Update allergens (Many-to-Many)
                allergen_data = data.get("allergen_information", "[]")
                try:
                    allergen_data = (
                        json.loads(allergen_data)
                        if isinstance(allergen_data, str)
                        else allergen_data
                    )
                except json.JSONDecodeError:
                    return Response({"error": "Invalid allergen format."}, status=400)

                allergens = Allergen.objects.filter(id__in=allergen_data)
                recipe.allergen_information.set(allergens)

                # ✅ Update ingredients (One-to-Many)
                ingredient_data = data.get("ingredients", "[]")
                try:
                    ingredient_data = (
                        json.loads(ingredient_data)
                        if isinstance(ingredient_data, str)
                        else ingredient_data
                    )
                except json.JSONDecodeError:
                    return Response(
                        {"error": "Invalid ingredients format."}, status=400
                    )

                if isinstance(ingredient_data, list):
                    recipe.ingredients.all().delete()

                    new_ingredients = []
                    for ingredient in ingredient_data:
                        ingredient.pop(
                            "recipe", None
                        )  # ✅ Remove recipe key if it exists
                        new_ingredients.append(
                            Ingredient(recipe_id=recipe.id, **ingredient)
                        )

                    Ingredient.objects.bulk_create(new_ingredients)

                    nutritions_result = json.loads(get_nutritions(ingredient_data))
                    if nutritions_result:
                        RecipeNutrition.objects.filter(recipe=recipe).delete()
                        RecipeNutrition.objects.create(
                            recipe=recipe,
                            calories=nutritions_result.get("calories", 0.0),
                            protein=nutritions_result.get("protein", 0.0),
                            fat=nutritions_result.get("fat", 0.0),
                            carbohydrates=nutritions_result.get("carbohydrates", 0.0),
                            energy=nutritions_result.get("energy", 0.0),
                            fiber=nutritions_result.get("fiber", 0.0),
                            salt=nutritions_result.get("salt", 0.0),
                            sugar=nutritions_result.get("sugar", 0.0),
                        )

                # ✅ Update instructions (One-to-Many)
                instruction_data = data.get("instructions", "[]")
                try:
                    instruction_data = (
                        json.loads(instruction_data)
                        if isinstance(instruction_data, str)
                        else instruction_data
                    )
                except json.JSONDecodeError:
                    return Response(
                        {"error": "Invalid instructions format."}, status=400
                    )

                if isinstance(instruction_data, list):
                    recipe.instructions.all().delete()

                    new_instructions = []
                    for instruction in instruction_data:
                        instruction.pop(
                            "recipe", None
                        )  # ✅ Remove recipe key if it exists
                        new_instructions.append(
                            Instruction(recipe=recipe, **instruction)
                        )

                    Instruction.objects.bulk_create(new_instructions)

                # ✅ Update images (One-to-Many)
                image_data = request.FILES.getlist("recipe_images")

                # Delete old images
                if image_data:
                    recipe.recipe_images.all().delete()

                    allowed_formats = ["image/jpeg", "image/png", "image/jpg"]
                    new_images = []

                    for image in image_data:
                        if image.content_type not in allowed_formats:
                            return Response(
                                {"error": "Invalid image format."}, status=400
                            )

                        new_images.append(RecipeImage(recipe=recipe, image=image))

                    RecipeImage.objects.bulk_create(new_images)

                # ✅ Update other fields
                recipe.is_active = to_bool(data.get("is_active", recipe.is_active))
                recipe.is_deleted = to_bool(data.get("is_deleted", recipe.is_deleted))
                recipe.updated_by_id = request.user.id  # Store updated_by user

                # ✅ Update dietary_plan (ArrayField)
                dietary_plan_value = data.get("dietary_plan")
                if dietary_plan_value:
                    if isinstance(dietary_plan_value, str):
                        try:
                            parsed_value = json.loads(dietary_plan_value)
                            if isinstance(parsed_value, list):
                                recipe.dietary_plan = parsed_value
                            else:
                                return Response(
                                    {"error": "dietary_plan should be a list"},
                                    status=400,
                                )
                        except json.JSONDecodeError:
                            return Response(
                                {"error": "Invalid JSON format for dietary_plan"},
                                status=400,
                            )
                    elif isinstance(dietary_plan_value, list):
                        recipe.dietary_plan = dietary_plan_value
                    else:
                        return Response(
                            {"error": "Invalid format for dietary_plan"}, status=400
                        )

                # ✅ Save the recipe
                recipe.save()

                # ✅ Return updated recipe data manually (No Serializer)
                response_data = {
                    "id": recipe.id,
                    "recipe_title": recipe.recipe_title,
                    "description": recipe.description,
                    "status": recipe.status,
                    "category": list(recipe.category.values("id", "name")),
                    "cook_time": recipe.cook_time,
                    "preparation_time": recipe.preparation_time,
                    "serving_size": recipe.serving_size,
                    "difficulty_level": recipe.difficulty_level,
                    "notes": recipe.notes,
                    "recipe_images": list(recipe.recipe_images.values("id", "image")),
                    "ingredients": list(
                        recipe.ingredients.values(
                            "id", "name", "quantity", "unit_of_measure"
                        )
                    ),
                    "instructions": list(
                        recipe.instructions.values(
                            "id", "step_count", "instructions", "notes"
                        )
                    ),
                    "dietary_plan": recipe.dietary_plan,
                    "allergen_information": list(
                        recipe.allergen_information.values("id", "name")
                    ),
                    "is_deleted": recipe.is_deleted,
                    "is_active": recipe.is_active,
                    "updated_by": {
                        "name": f"{recipe.updated_by.first_name} {recipe.updated_by.last_name}",
                        "email": recipe.updated_by.email,
                    },
                    "recipe_images": [
                        {
                            "id": img.id,
                            "image_url": request.build_absolute_uri(img.image.url),
                        }
                        for img in recipe.recipe_images.all()
                    ],
                    "created_at": recipe.created_at,
                    "updated_at": recipe.updated_at,
                }

                return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # def patch(self, request, pk):
    #     recipe = get_object_or_404(Recipe, pk=pk)

    #     try:
    #         with transaction.atomic():
    #             data = request.data.copy()

    #             original_serving_size = recipe.serving_size

    #             new_serving_size = data.get("serving_size")
    #             if new_serving_size:
    #                 new_serving_size = int(new_serving_size)

    #             category_data = data.get("category", "[]")
    #             try:
    #                 category_data = (
    #                     json.loads(category_data)
    #                     if isinstance(category_data, str)
    #                     else category_data
    #                 )
    #             except json.JSONDecodeError:
    #                 return Response({"error": "Invalid category format."}, status=400)

    #             categories = Category.objects.filter(id__in=category_data)
    #             if len(categories) != len(category_data):
    #                 return Response(
    #                     {"error": "Some categories do not exist."}, status=400
    #                 )

    #             recipe.category.set(categories)
    #             recipe.is_active = data.get("is_active", True)
    #             recipe.is_deleted = data.get("is_deleted", False)
    #             allergen_data = data.get("allergen_information", "[]")
    #             try:
    #                 allergen_data = (
    #                     json.loads(allergen_data)
    #                     if isinstance(allergen_data, str)
    #                     else allergen_data
    #                 )
    #             except json.JSONDecodeError:
    #                 allergen_data = []

    #             allergens = Allergen.objects.filter(id__in=allergen_data)
    #             recipe.allergen_information.set(allergens)

    #             ingredient_data = data.get("ingredients", "[]")
    #             try:
    #                 ingredient_data = (
    #                     json.loads(ingredient_data)
    #                     if isinstance(ingredient_data, str)
    #                     else ingredient_data
    #                 )
    #             except json.JSONDecodeError:
    #                 return Response(
    #                     {"error": "Invalid ingredients format."}, status=400
    #                 )

    #             if isinstance(ingredient_data, list):
    #                 if new_serving_size and new_serving_size != original_serving_size:
    #                     scaling_factor = Decimal(new_serving_size) / Decimal(
    #                         original_serving_size
    #                     )
    #                     for ingredient in ingredient_data:
    #                         if "quantity" in ingredient:
    #                             ingredient["quantity"] = round(
    #                                 Decimal(ingredient["quantity"]) * scaling_factor, 2
    #                             )

    #                 nutritions_result = json.loads(get_nutritions(ingredient_data))
    #                 if nutritions_result:
    #                     RecipeNutrition.objects.filter(recipe=recipe).delete()

    #                     RecipeNutrition.objects.create(
    #                         recipe=recipe,
    #                         calories=nutritions_result.get("calories", 0.0),
    #                         protein=nutritions_result.get("protein", 0.0),
    #                         fat=nutritions_result.get("fat", 0.0),
    #                         carbohydrates=nutritions_result.get("carbohydrates", 0.0),
    #                         energy=nutritions_result.get("energy", 0.0),
    #                         fiber=nutritions_result.get("fiber", 0.0),
    #                         salt=nutritions_result.get("salt", 0.0),
    #                         sugar=nutritions_result.get("sugar", 0.0),
    #                     )

    #                 recipe.ingredients.all().delete()
    #                 for ingredient in ingredient_data:
    #                     ingredient["recipe"] = recipe.id
    #                     ingredient_serializer = IngredientSerializer(data=ingredient)
    #                     if ingredient_serializer.is_valid():
    #                         ingredient_serializer.save()
    #                     else:
    #                         return Response(
    #                             ingredient_serializer.errors,
    #                             status=status.HTTP_400_BAD_REQUEST,
    #                         )

    #             instruction_data = data.get("instructions", "[]")
    #             try:
    #                 instruction_data = (
    #                     json.loads(instruction_data)
    #                     if isinstance(instruction_data, str)
    #                     else instruction_data
    #                 )
    #             except json.JSONDecodeError:
    #                 return Response(
    #                     {"error": "Invalid instructions format."}, status=400
    #                 )

    #             if isinstance(instruction_data, list):
    #                 recipe.instructions.all().delete()
    #                 for instruction in instruction_data:
    #                     instruction["recipe"] = recipe.id
    #                     instruction_serializer = InstructionSerializer(data=instruction)
    #                     if instruction_serializer.is_valid():
    #                         instruction_serializer.save()
    #                     else:
    #                         return Response(
    #                             instruction_serializer.errors,
    #                             status=status.HTTP_400_BAD_REQUEST,
    #                         )

    #             image_data = request.FILES.getlist("recipe_images")
    #             if image_data:
    #                 # Delete old images
    #                 recipe.recipe_images.all().delete()

    #                 # Allowed formats
    #                 allowed_formats = ["image/jpeg", "image/png", "image/jpg"]

    #                 for image in image_data:
    #                     if image.content_type not in allowed_formats:
    #                         return Response(
    #                             {"error": "Invalid image format."}, status=400
    #                         )

    #                     image_serializer = RecipeImageSerializer(
    #                         data={"image": image, "recipe": recipe.id}
    #                     )
    #                     if image_serializer.is_valid():
    #                         image_serializer.save()
    #                     else:
    #                         return Response(
    #                             image_serializer.errors,
    #                             status=status.HTTP_400_BAD_REQUEST,
    #                         )
    #             data["updated_by"] = request.user.id
    #             dietary_plan_value = request.data.get("dietary_plan")

    #             if isinstance(dietary_plan_value, str):
    #                 try:
    #                     # ✅ Convert JSON string to list if necessary
    #                     parsed_value = json.loads(dietary_plan_value)
    #                     if isinstance(parsed_value, list):
    #                         data["dietary_plan"] = parsed_value
    #                     else:
    #                         return Response({"error": "dietary_plan should be a list"}, status=400)
    #                 except json.JSONDecodeError:
    #                     return Response({"error": "Invalid JSON format for dietary_plan"}, status=400)

    #             serializer = RecipeSerializer(
    #                 instance=recipe,
    #                 data=data,
    #                 partial=True,
    #                 context={"request": request},
    #             )
    #             if serializer.is_valid():
    #                 serializer.save()
    #                 return Response(serializer.data, status=status.HTTP_200_OK)

    #             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #     except Exception as e:
    #         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(auto_schema=None)
    def delete(self, request, pk):
        recipe = self.get_object(pk)
        if recipe is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        recipe.delete()
        return Response(
            {"message": "Deleted Successfully"}, status=status.HTTP_204_NO_CONTENT
        )


class IngredientView(APIView):
    """
    API view for managing recipe ingredients.

    Methods:
    - GET: List all ingredients for a specific recipe
    - POST: Add new ingredients to a recipe
    - PUT: Update recipe ingredients
    - DELETE: Remove ingredients from a recipe

    Authentication:
    - Requires JWT authentication
    - Admin access required
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        ingredients = Ingredient.objects.filter(is_deleted=False)
        serializer = IngredientSerializer(ingredients, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=IngredientSerializer)
    def post(self, request):
        serializer = IngredientSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IngredientDetailView(APIView):
    """
    API view for managing recipe ingredients.

    Methods:
    - GET: List all ingredients for a specific recipe
    - POST: Add new ingredients to a recipe
    - PUT: Update recipe ingredients
    - DELETE: Remove ingredients from a recipe

    Authentication:
    - Requires JWT authentication
    - Admin access required
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def get_object(self, pk):
        try:
            return Ingredient.objects.get(pk=pk, is_deleted=False)
        except Ingredient.DoesNotExist:
            return None

    def get(self, request, pk):
        ingredient = self.get_object(pk)
        if ingredient is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = IngredientSerializer(ingredient)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=IngredientSerializer)
    def patch(self, request, pk):
        ingredient = self.get_object(pk)
        if ingredient is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = IngredientSerializer(
            ingredient, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        ingredient = self.get_object(pk)
        if ingredient is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        ingredient.is_deleted = True
        ingredient.save()
        return Response(
            {"message": "Deleted Successfully"}, status=status.HTTP_204_NO_CONTENT
        )


class InstructionView(APIView):
    """
    API view for managing recipe preparation steps.

    Methods:
    - GET: List all steps for a specific recipe
    - POST: Add new steps to a recipe
    - PUT: Update recipe steps
    - DELETE: Remove steps from a recipe

    Authentication:
    - Requires JWT authentication
    - Admin access required
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        instructions = Instruction.objects.filter(is_deleted=False)
        serializer = InstructionSerializer(instructions, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=InstructionSerializer)
    def post(self, request):
        serializer = InstructionSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InstructionDetailView(APIView):
    """
    API view for managing recipe preparation steps.

    Methods:
    - GET: List all steps for a specific recipe
    - POST: Add new steps to a recipe
    - PUT: Update recipe steps
    - DELETE: Remove steps from a recipe

    Authentication:
    - Requires JWT authentication
    - Admin access required
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def get_object(self, pk):
        try:
            return Instruction.objects.get(pk=pk, is_deleted=False)
        except Instruction.DoesNotExist:
            return None

    def get(self, request, pk):
        instruction = self.get_object(pk)
        if instruction is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = InstructionSerializer(instruction)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=InstructionSerializer)
    def patch(self, request, pk):
        instruction = self.get_object(pk)
        if instruction is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = InstructionSerializer(
            instruction, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        instruction = self.get_object(pk)
        if instruction is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        instruction.is_deleted = True
        instruction.save()
        return Response(
            {"message": "Deleted Successfully"}, status=status.HTTP_204_NO_CONTENT
        )


class BulkRecipeUpdateDeleteAPIView(APIView):
    """
    API view for bulk operations on recipes.

    Methods:
    - POST: Bulk duplicate recipes
        - Creates copies with unique titles
        - Duplicates all associated data (ingredients, steps)
    - PATCH: Bulk update recipe statuses
        - Can set multiple recipes to draft/publish
    - DELETE: Bulk delete/trash recipes
        - Can move multiple recipes to trash or restore

    Authentication:
    - Requires JWT authentication
    - Admin access required
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        recipe_ids = request.data.get("recipes", [])

        if not recipe_ids or not isinstance(recipe_ids, list):
            return Response(
                {"error": "A list of recipe IDs is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            recipe_ids = [int(recipe_id) for recipe_id in recipe_ids]
        except ValueError:
            return Response(
                {"error": "Recipe IDs must be integers"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # flake8: noqa: E501
            with transaction.atomic():
                duplicated_recipe_ids = []

                for recipe_id in recipe_ids:
                    try:
                        # Fetch the original recipe
                        original_recipe = Recipe.objects.get(id=recipe_id)

                        # Calculate the next available copy number
                        duplicated_recipe_count = (
                            Recipe.objects.filter(
                                recipe_title__startswith=f"Copy of {original_recipe.recipe_title}"
                            ).count()
                            + 1
                        )

                        duplicated_recipe_title = f"Copy of {original_recipe.recipe_title} ({duplicated_recipe_count})"

                        # Ensure unique recipe title
                        while Recipe.objects.filter(
                            recipe_title=duplicated_recipe_title
                        ).exists():
                            duplicated_recipe_count += 1
                            duplicated_recipe_title = f"Copy of {original_recipe.recipe_title} ({duplicated_recipe_count})"

                        # Duplicate the recipe
                        duplicated_recipe = Recipe.objects.create(
                            recipe_title=duplicated_recipe_title,
                            description=original_recipe.description,
                            status=original_recipe.status,
                            cook_time=original_recipe.cook_time,
                            preparation_time=original_recipe.preparation_time,
                            serving_size=original_recipe.serving_size,
                            difficulty_level=original_recipe.difficulty_level,
                            notes=original_recipe.notes,
                            dietary_plan=original_recipe.dietary_plan,
                        )

                        # Duplicate categories (Many-to-Many relationship)
                        duplicated_recipe.category.set(original_recipe.category.all())
                        duplicated_recipe.allergen_information.set(
                            original_recipe.allergen_information.all()
                        )
                        # Duplicate instructions (One-to-Many relationship)
                        for instruction in original_recipe.instructions.all():
                            Instruction.objects.create(
                                recipe=duplicated_recipe,
                                step_count=instruction.step_count,
                                instructions=instruction.instructions,
                                notes=instruction.notes,
                            )

                        # Duplicate ingredients (One-to-Many relationship)
                        for ingredient in original_recipe.ingredients.all():
                            Ingredient.objects.create(
                                recipe=duplicated_recipe,
                                name=ingredient.name,
                                quantity=ingredient.quantity,
                                unit_of_measure=ingredient.unit_of_measure,
                            )

                        # Duplicate images (One-to-Many relationship)
                        for image in original_recipe.recipe_images.all():
                            RecipeImage.objects.create(
                                recipe=duplicated_recipe,
                                image=image.image,
                            )

                        # Collect the ID of the duplicated recipe
                        duplicated_recipe_ids.append(duplicated_recipe.id)

                    except Recipe.DoesNotExist as e:
                        return Response(
                            {"error": f"Recipe with ID {str(e)} does not exist"},
                            status=status.HTTP_404_NOT_FOUND,
                        )
                return Response(
                    {
                        "message": "Recipes duplicated successfully",
                        "duplicated_recipe_ids": duplicated_recipe_ids,
                    },
                    status=status.HTTP_201_CREATED,
                )

        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def patch(self, request):
        serializer = BulkRecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recipe_status = serializer.validated_data.get("status", None)
        recipe_ids = serializer.validated_data.get("recipes", [])

        updated_ids = []
        if recipe_ids:
            recipies = Recipe.objects.filter(id__in=recipe_ids)
            if not recipies:
                return Response(
                    {"error": "Recipe id not found"}, status=status.HTTP_404_NOT_FOUND
                )
            for recipe in recipies:
                if recipe_status == "draft":
                    recipe.is_active = False
                    recipe.is_deleted = False
                    recipe.status = "Draft"
                    updated_ids.append(recipe)

                elif recipe_status == "publish":
                    recipe.is_active = True
                    recipe.is_deleted = False
                    recipe.status = "Publish"
                    updated_ids.append(recipe)

            if updated_ids:
                Recipe.objects.bulk_update(
                    updated_ids, ["is_deleted", "is_active", "status"]
                )
                return Response(
                    {"message": "Recipe Updated Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"message": "Recipe does not existed."},
                    status=status.HTTP_200_OK,
                )
        else:
            return Response(
                {"error": "Recipe does not existed."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def delete(self, request):

        serializer = BulkRecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipe_ids = serializer.validated_data.get("recipes", [])
        recipe_status = serializer.validated_data.get("status", None)
        deleted_ids = []
        if recipe_ids:
            recipes = Recipe.objects.filter(id__in=recipe_ids)
            if not recipes:
                return Response(
                    {"error": "Recipe id not found"}, status=status.HTTP_404_NOT_FOUND
                )
            for recipe in recipes:
                if recipe_status == "delete":
                    recipe.is_active = False
                    recipe.is_deleted = True
                    recipe.status = "Trash"
                    deleted_ids.append(recipe)
                elif recipe_status == "publish":
                    recipe.is_deleted = False
                    recipe.is_active = True
                    recipe.status = "Publish"
                    deleted_ids.append(recipe)

            if deleted_ids:
                Recipe.objects.bulk_update(
                    deleted_ids, ["is_deleted", "is_active", "status"]
                )
                return Response(
                    {"message": "Recipe Deleted Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Recipe does not existed."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"error": "Recipe does not existed"},
                status=status.HTTP_404_NOT_FOUND,
            )


def generate_pdf_response(pdf_file):
    # Open the PDF file in binary mode
    with open(pdf_file, "rb") as f:
        pdf_content = f.read()

    # Encode the PDF content to Base64
    base64_pdf = base64.b64encode(pdf_content).decode("utf-8")

    # Construct the response
    response = {"file": f"data:application/pdf;base64,{base64_pdf}"}

    return response


def generate_recipe_pdf(recipe, new_serving_size):
    """
    Generates a PDF for a scaled recipe.
    """

    scaled_ingredients = [
        {
            "name": ingredient.name,
            "quantity": (ingredient.quantity / Decimal(recipe.serving_size))
            * Decimal(new_serving_size),
            "unit_of_measure": ingredient.unit_of_measure,
        }
        for ingredient in recipe.ingredients.all()
        if not ingredient.is_deleted
    ]

    # Step 2: Round the quantity to two decimal places in a separate loop
    for ingredient in scaled_ingredients:
        # Ensure the quantity is a Decimal before rounding
        ingredient["quantity"] = Decimal(
            ingredient["quantity"]
        )  # Convert to Decimal if it's not already
        ingredient["quantity"] = round(ingredient["quantity"], 2)
    scaled_instruction = [
        {
            "instructions": instruction.instructions,
            "step_count": instruction.step_count,
            "note": instruction.notes,
        }
        for instruction in recipe.instructions.all()
        if not instruction.is_deleted
    ]

    context = {
        "recipe_title": recipe.recipe_title,
        "description": recipe.description,
        "ingredients": scaled_ingredients,
        "instructions": scaled_instruction,
        "new_serving_size": new_serving_size,
        "recipe": recipe,
        "categories": recipe.category.all(),
    }

    html_string = render_to_string("recipe.html", context)
    pdf_file = BytesIO()
    pisa_status = pisa.CreatePDF(html_string, dest=pdf_file)

    if pisa_status.err:
        raise Exception("PDF generation failed.")

    pdf_file.seek(0)
    return pdf_file


class ScaleRecipeAPIView(APIView):
    """
    API to scale a recipe to a new serving size and generate a PDF.
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def post(self, request, pk):
        serializer = RecipeScaleSerializer(data=request.data)
        if serializer.is_valid():
            new_serving_size = serializer.validated_data["serving_size"]
            if int(new_serving_size) < 0:
                return Response(
                    {"detail": "Serving size should be greater than one."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            try:
                recipe = Recipe.objects.get(pk=pk, is_deleted=False)
            except Recipe.DoesNotExist:
                return Response(
                    {"detail": "Recipe not found or deleted."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Calculate scaling factor based on current serving size
            scaling_factor_to_one = Decimal(1) / Decimal(recipe.serving_size)

            # Calculate scaling factor to new serving size
            scaling_factor_to_new = Decimal(new_serving_size)
            print(
                scaling_factor_to_new,
                scaling_factor_to_one,
                new_serving_size,
            )
            # Scale ingredient quantities to the new serving size
            scaled_ingredients = []

            # Generate the PDF using scaled ingredients
            pdf_file = generate_recipe_pdf(recipe, new_serving_size)

            response = HttpResponse(pdf_file.read(), content_type="application/pdf")
            response["Content-Disposition"] = f'inline; filename="scaled_recipe.pdf"'

            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateIngredientQuantityAPIView(APIView):
    """
    API view to update ingredient quantities based on the new serving size.
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        # Get the recipe using the provided recipe_id

        # Validate the incoming payload with NewServingSizeSerializer
        serializer = UpdateIngredientQuantitySerializer(data=request.data)
        if serializer.is_valid():
            recipe_id = serializer.validated_data["recipe_id"]
            new_serving_size = serializer.validated_data["new_serving_size"]

            # Get the recipe using the provided recipe_id
            recipe = get_object_or_404(Recipe, id=recipe_id)
            current_serving_size = Decimal(recipe.serving_size)

            # Calculate the updated ingredient quantities
            updated_ingredients = [
                {
                    "name": ingredient.name,
                    "quantity": str(
                        (ingredient.quantity / current_serving_size) * new_serving_size
                    ),
                    "unit_of_measure": ingredient.unit_of_measure,
                }
                for ingredient in recipe.ingredients.all()
                if not ingredient.is_deleted
            ]

            for ingredient in recipe.ingredients.all():
                if not ingredient.is_deleted:
                    # Update ingredient quantity in the database
                    ingredient.quantity = (
                        ingredient.quantity / current_serving_size
                    ) * new_serving_size
                    ingredient.save()
            recipe.serving_size = new_serving_size
            recipe.save()
            return Response(
                {
                    "message": "Ingredient quantities updated successfully.",
                    "updated_ingredients": updated_ingredients,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllergenListCreateView(APIView):
    """Handles listing and creating allergens"""

    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        allergens = Allergen.objects.all()
        paginator = self.pagination_class()
        paginated_recipes = paginator.paginate_queryset(allergens, request)
        serializer = AllergenSerializer(paginated_recipes, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = AllergenSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllergenDetailView(APIView):
    """Handles retrieving, updating, and deleting a specific allergen"""

    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    def get(self, request, pk):
        allergen = get_object_or_404(Allergen, pk=pk)
        serializer = AllergenSerializer(allergen)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        allergen = get_object_or_404(Allergen, pk=pk)
        serializer = AllergenSerializer(allergen, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        allergen = get_object_or_404(Allergen, pk=pk)
        allergen.delete()
        return Response(
            {"message": "Allergen deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
