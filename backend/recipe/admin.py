from django.contrib import admin

from recipe.models import Ingredient, Instruction, Recipe, RecipeImage, RecipeNutrition

admin.site.register(Recipe)
admin.site.register(RecipeNutrition)


@admin.register(RecipeImage)
class RecipeImageAdmin(admin.ModelAdmin):
    list_display = ("recipe", "image", "is_deleted")
    search_fields = ("recipe__recipe_title",)
    list_filter = ("is_deleted",)
    ordering = ("-id",)


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ("recipe", "name", "quantity", "unit_of_measure", "is_deleted")
    search_fields = ("recipe__recipe_title", "name")
    list_filter = ("is_deleted",)
    ordering = ("-id",)


@admin.register(Instruction)
class InstructionAdmin(admin.ModelAdmin):
    list_display = ("recipe", "step_count", "is_deleted")
    search_fields = ("recipe__recipe_title", "instructions")
    ordering = ("-id",)
