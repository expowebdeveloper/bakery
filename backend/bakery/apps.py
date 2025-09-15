from django.apps import AppConfig


class BakeryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bakery"

    def ready(self):
        import bakery.signals

        print(bakery.signals)
