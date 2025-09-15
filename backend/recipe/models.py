import sys
from io import BytesIO

from ckeditor.fields import RichTextField
from django.contrib.postgres.fields import ArrayField
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import models
from PIL import Image, ImageDraw, ImageFont

from account.models import BaseModel
from account.models import CustomUser as User
from product.fields import CaseInsensitiveCharField
from product.models import Category


class Allergen(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Recipe(BaseModel):

    DIFFICULTY_LEVEL_CHOICES = [
        ("E", "Easy"),
        ("M", "Medium"),
        ("H", "Hard"),
    ]
    RECIPE_STATUS_CHOICES = [
        ("publish", "Publish"),
        ("draft", "Draft"),
        ("trash", "Trash"),
    ]

    recipe_title = CaseInsensitiveCharField(max_length=200, unique=True)
    description = RichTextField()
    status = models.CharField(
        max_length=10, choices=RECIPE_STATUS_CHOICES, null=True, blank=True
    )
    category = models.ManyToManyField(Category, related_name="recipes")
    cook_time = models.PositiveIntegerField()
    preparation_time = models.PositiveIntegerField()
    serving_size = models.PositiveIntegerField()
    difficulty_level = models.CharField(max_length=1, choices=DIFFICULTY_LEVEL_CHOICES)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    dietary_plan = ArrayField(
        base_field=models.CharField(max_length=200), blank=True, default=list
    )
    allergen_information = models.ManyToManyField(Allergen, blank=True)

    is_active = models.BooleanField(default=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="updated_recipe",
    )

    def __str__(self):
        return self.recipe_title


class RecipeImage(BaseModel):
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="recipe_images"
    )
    image = models.ImageField(upload_to="recipes/", null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.recipe.recipe_title}"


class Ingredient(BaseModel):
    measure_field = (
        ("kg", "Kilogram"),
        ("g", "Gram"),
        ("litre", "Litre"),
        ("mg", "Milligram"),
        ("lb", "Pound"),
        ("oz", "Ounce"),
        ("litre", "Litre"),
        ("ml", "Millilitre"),
        ("cup", "Cup"),
        ("tbsp", "Tablespoon"),
        ("tsp", "Teaspoon"),
        ("piece", "Piece"),
        ("slice", "Slice"),
    )

    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="ingredients"
    )
    name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_of_measure = models.CharField(
        max_length=50, choices=measure_field, default="kg"
    )
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name}"

    def scaled_quantity(self, new_serving_size):
        if self.recipe.serving_size > 0 and new_serving_size > 0:
            return (self.quantity / self.recipe.serving_size) * new_serving_size
        return self.quantity


class Instruction(BaseModel):
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="instructions"
    )
    step_count = models.PositiveIntegerField()
    instructions = models.TextField()
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.recipe.recipe_title}"


class RecipeNutrition(BaseModel):
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="nutritions"
    )
    calories = models.FloatField(default=0.0)
    protein = models.FloatField(default=0.0)
    fat = models.FloatField(default=0.0)
    carbohydrates = models.FloatField(default=0.0)
    energy = models.FloatField(default=0.0)
    fiber = models.FloatField(default=0.0)
    salt = models.FloatField(default=0.0)
    nutrition_image = models.ImageField(upload_to="nutrition/", null=True, blank=True)
    sugar = models.FloatField(default=0.0)

    def save(self, *args, **kwargs):
        # Ensure the image is created only if it doesn't already exist
        if not self.nutrition_image:
            self.create_nutrition_image()  # Create the image before saving
        super().save(*args, **kwargs)  # Save the model instance

    def create_nutrition_image(self):
        """Generates a compact and printable nutrition facts image."""

        # Image dimensions
        width, height = 400, 300
        img = Image.new("RGB", (width, height), "white")
        draw = ImageDraw.Draw(img)

        # Load font (adjust the path if necessary)
        try:
            font = ImageFont.truetype("arial.ttf", 18)  # Use Arial for clarity
            bold_font = ImageFont.truetype("arialbd.ttf", 20)  # Bold for the title
        except IOError:
            font = ImageFont.load_default()
            bold_font = font

        # Table Data (Only Essential Nutrients)
        nutrition_data = [
            ("Calories", f"{self.calories} kcal"),
            ("Protein", f"{self.protein} g"),
            ("Fat", f"{self.fat} g"),
            ("Carbs", f"{self.carbohydrates} g"),
            ("Fiber", f"{self.fiber} g"),
            ("Sugar", f"{self.sugar} g"),
            ("Salt", f"{self.salt} g"),
        ]

        # Table formatting
        padding = 20
        row_height = 30
        col_x = width - 100  # Align values to the right

        # Draw title
        draw.text((padding, 10), "Nutrition Facts", font=bold_font, fill="black")

        # Table start position
        y = 50

        # Draw rows with borders
        for key, value in nutrition_data:
            draw.line(
                [(padding, y), (width - padding, y)], fill="black", width=1
            )  # Row line
            draw.text((padding, y + 5), key, font=font, fill="black")  # Key
            draw.text(
                (col_x, y + 5), value, font=font, fill="black", anchor="ra"
            )  # Right-align values
            y += row_height

        # Draw bottom border
        draw.line([(padding, y), (width - padding, y)], fill="black", width=2)

        # Save the image to a BytesIO object
        img_io = BytesIO()
        img.save(img_io, "PNG")
        img_io.seek(0)

        # Convert to Django file
        image_file = InMemoryUploadedFile(
            img_io,
            None,
            "nutrition_image.png",
            "image/png",
            sys.getsizeof(img_io),
            None,
        )

        # Save to model
        self.nutrition_image.save("nutrition_image.png", image_file, save=False)
