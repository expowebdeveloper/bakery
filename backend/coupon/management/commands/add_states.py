from django.core.management.base import BaseCommand

from coupon.models import State


class Command(BaseCommand):
    help = "Adds Sweden states to the State table"

    STATES = [
        {"name": "Stockholm", "abbreviation": "Stockholm"},
        {"name": "Västernorrland", "abbreviation": "Västernorrland"},
        {"name": "Västra Götaland", "abbreviation": "Västra Götaland"},
        {"name": "Östergötland", "abbreviation": "Östergötland"},
        {"name": "Gävleborg", "abbreviation": "Gävleborg"},
        {"name": "Halland", "abbreviation": "Halland"},
        {"name": "Jämtland", "abbreviation": "Jämtland"},
        {"name": "Jönköping", "abbreviation": "Jönköping"},
        {"name": "Kalmar", "abbreviation": "Kalmar"},
        {"name": "Kristianstad", "abbreviation": "Kristianstad"},
        {"name": "Kopparberg", "abbreviation": "Kopparberg"},
        {"name": "Skåne", "abbreviation": "Skåne"},
        {"name": "Södermanland", "abbreviation": "Södermanland"},
        {"name": "Uppsala", "abbreviation": "Uppsala"},
        {"name": "Värmland", "abbreviation": "Värmland"},
        {"name": "Västerbotten", "abbreviation": "Västerbotten"},
        {"name": "Blekinge", "abbreviation": "Blekinge"},
        {"name": "Nordmaling", "abbreviation": "Nordmaling"},
        {"name": "Örebro", "abbreviation": "Örebro"},
    ]

    def handle(self, *args, **kwargs):
        for state in self.STATES:
            state_obj, created = State.objects.get_or_create(
                name=state["name"], defaults={"abbreviation": state["abbreviation"]}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully added state: {state["name"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'State already exists: {state["name"]}')
                )
