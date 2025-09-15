import django_filters

from product.models import Category
from recipe.models import Recipe


class RecipeFilter(django_filters.FilterSet):
    recipe_title = django_filters.CharFilter(lookup_expr="icontains")
    category = django_filters.CharFilter(
        field_name="category__name", lookup_expr="icontains"
    )
    status = django_filters.BooleanFilter()
    queryset = Category.objects.all()

    class Meta:
        model = Recipe
        fields = ["recipe_title", "category", "status"]
