from django.urls import path

from recipe.views import (
    AllergenDetailView,
    AllergenListCreateView,
    BulkRecipeUpdateDeleteAPIView,
    IngredientDetailView,
    IngredientView,
    InstructionDetailView,
    InstructionView,
    RecipeDetailView,
    RecipeView,
    ScaleRecipeAPIView,
    UpdateIngredientQuantityAPIView,
)

urlpatterns = [
    path("", RecipeView.as_view(), name="recipe-list-create"),
    path("<int:pk>/", RecipeDetailView.as_view(), name="recipe-detail"),
    path("ingredients/", IngredientView.as_view(), name="ingredient-list-create"),
    path(
        "ingredients/<int:pk>/",
        IngredientDetailView.as_view(),
        name="ingredient-detail",
    ),
    path("instructions/", InstructionView.as_view(), name="instruction-list-create"),
    path(
        "instructions/<int:pk>/",
        InstructionDetailView.as_view(),
        name="instruction-detail",
    ),
    path(
        "bulk-recipe-update/",
        BulkRecipeUpdateDeleteAPIView.as_view(),
        name="recipe-update",
    ),
    path(
        "download-recipe/<int:pk>/",
        ScaleRecipeAPIView.as_view(),
        name="download-recipe",
    ),
    path(
        "update-ingredient-quantity/",
        UpdateIngredientQuantityAPIView.as_view(),
        name="update-ingredient-quantity",
    ),
    path("allergens/", AllergenListCreateView.as_view(), name="allergen-list-create"),
    path("allergens/<int:pk>/", AllergenDetailView.as_view(), name="allergen-detail"),
]
