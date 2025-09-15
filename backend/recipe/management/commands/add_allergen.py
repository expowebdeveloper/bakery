from django.core.management.base import BaseCommand

from recipe.models import Allergen  # Import your Allergen model


class Command(BaseCommand):
    help = "Add allergens to the database"

    def add_arguments(self, parser):
        # You can add optional or positional arguments here if needed
        pass

    def handle(self, *args, **kwargs):
        # Updated list of allergens with "Contains" prefix
        allergens = [
            "Contains Gluten",
            "Contains Dairy",
            "Contains Eggs",
            "Contains Nuts",
            "Contains Soy",
            "Contains Fish",
            "Contains Shellfish",
            "Contains Wheat",
            "Contains Peanuts",
            "Contains Sesame",
        ]

        # Add allergens to the database if they do not already exist
        for allergen_name in allergens:
            allergen, created = Allergen.objects.get_or_create(name=allergen_name)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Allergen '{allergen_name}' created successfully."
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f"Allergen '{allergen_name}' already exists.")
                )
