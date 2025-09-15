import json

from rest_framework import serializers
from rest_framework.serializers import ValidationError

from recipe.models import (
    Allergen,
    Category,
    Ingredient,
    Instruction,
    Recipe,
    RecipeImage,
    RecipeNutrition,
)


class AllergenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergen
        fields = ["id", "name"]


def clean_dietary_plan(value):
    if isinstance(value, str):
        try:
            return json.loads(value)  # Convert JSON string to Python list
        except json.JSONDecodeError:
            return []
    return value


class RecipeImageSerializer(serializers.ModelSerializer):
    recipe = serializers.PrimaryKeyRelatedField(
        required=False, queryset=Recipe.objects.all()
    )

    class Meta:
        model = RecipeImage
        fields = ["id", "image", "recipe"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class IngredientSerializer(serializers.ModelSerializer):
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all())

    class Meta:
        model = Ingredient
        fields = ["id", "recipe", "name", "quantity", "unit_of_measure"]

    def create(self, validated_data):
        return Ingredient.objects.create(**validated_data)


class InstructionSerializer(serializers.ModelSerializer):
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all())

    class Meta:
        model = Instruction
        fields = [
            "recipe",
            "step_count",
            "instructions",
            "notes",
        ]

    def validate(self, data):
        if data["step_count"] < 0:
            message = "Step Count must be a positive value."
            raise ValidationError(message)
        if data["step_count"] > 1000:
            message = "Step Count should not exceed 1000."
            raise ValidationError(message)

        return data


class RecipeNutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeNutrition
        fields = [
            "calories",
            "protein",
            "fat",
            "carbohydrates",
            "energy",
            "fiber",
            "salt",
            "sugar",
            "nutrition_image",
        ]


class RecipeSerializer(serializers.ModelSerializer):
    recipe_images = RecipeImageSerializer(many=True)
    category = CategorySerializer(many=True)
    ingredients = IngredientSerializer(many=True, required=False, default=[])
    instructions = InstructionSerializer(many=True, required=False, default=[])
    allergen_information = AllergenSerializer(many=True, required=False, default=[])
    nutrition = serializers.SerializerMethodField()
    dietary_plan = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True,
        required=False,
    )
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            "id",
            "recipe_title",
            "description",
            "status",
            "category",
            "cook_time",
            "preparation_time",
            "serving_size",
            "difficulty_level",
            "notes",
            "recipe_images",
            "ingredients",
            "instructions",
            "dietary_plan",
            "allergen_information",
            "is_deleted",
            "is_active",
            "created_at",
            "nutrition",
            "updated_by",
        ]

    def validate_dietary_plan(self, value):
        """
        Ensure dietary_plan is always stored and returned as a list of strings.
        """
        if isinstance(value, list):
            return value  # ✅ Already a list, no changes needed

        if isinstance(value, str):
            try:
                parsed_value = json.loads(value)  # ✅ Convert JSON string to a list
                if isinstance(parsed_value, list):
                    return parsed_value
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    "Invalid JSON format for dietary_plan"
                )

        return value

    def get_images(self, obj):
        images = RecipeImage.objects.filter(recipe=obj)
        return [{"image": str(image.image)} for image in images]

    def validate_recipe_title(self, value):
        """Ensure recipe title is unique, except for the current recipe in PATCH."""
        request = self.context.get("request")
        instance = self.instance

        if request and request.method == "PATCH" and instance:
            if (
                Recipe.objects.exclude(id=instance.id)
                .filter(recipe_title=value)
                .exists()
            ):
                raise serializers.ValidationError(
                    "A recipe with this title already exists."
                )
        else:
            if Recipe.objects.filter(recipe_title=value).exists():
                raise serializers.ValidationError(
                    "A recipe with this title already exists."
                )

        return value

    def get_updated_by(self, obj):
        """
        Return the username and email of the user who updated the product material.
        """
        if obj.updated_by:
            name = f"{obj.updated_by.first_name} {obj.updated_by.last_name}"
            return {"name": name, "email": obj.updated_by.email}
        return None

    def get_nutrition(self, obj):
        # Fetch related RecipeNutrition objects for the given Recipe
        nutrition = RecipeNutrition.objects.filter(recipe=obj).last()

        # If there's a related RecipeNutrition record, serialize it
        if nutrition:
            return RecipeNutritionSerializer(nutrition).data
        else:
            return None

    def validate(self, data):
        max_cook_time = 600
        max_prep_time = 300
        max_serving_size = 99999

        cook_time = data.get("cook_time", 0)
        if cook_time < 0:
            raise ValidationError("Cook time must be a positive value.")
        if cook_time > max_cook_time:
            raise ValidationError(
                f"Cook time should not exceed {max_cook_time} minutes."
            )

        prep_time = data.get("preparation_time", 0)
        if prep_time < 0:
            raise ValidationError("Preparation time must be a positive value.")
        if prep_time > max_prep_time:
            raise ValidationError(
                f"Preparation time should not exceed {max_prep_time} minutes."
            )

        serving_size = data.get("serving_size", 0)

        if serving_size:
            if serving_size <= 0:
                raise ValidationError("Serving size must be a positive integer.")
            if serving_size > max_serving_size:
                raise ValidationError(
                    f"Serving size should not exceed {max_serving_size}."
                )

        return data


class BulkRecipeSerializer(serializers.Serializer):
    recipes = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="List of Recipe IDs for bulk operation.",
    )

    status = serializers.ChoiceField(
        choices=[
            ("draft", "Draft"),
            ("delete", "Delete"),
            ("publish", "Publish"),
            ("duplicate", "Duplicate"),
        ],
        help_text="Action to perform on the recipies.",
    )

    def validate_product_materials(self, value):
        if not all(isinstance(id, int) for id in value):
            raise serializers.ValidationError("All Raw Material must be integers.")
        return value


class RecipeScaleSerializer(serializers.Serializer):
    serving_size = serializers.IntegerField()


class UpdateIngredientQuantitySerializer(serializers.Serializer):
    recipe_id = serializers.IntegerField()
    new_serving_size = serializers.DecimalField(max_digits=5, decimal_places=2)
