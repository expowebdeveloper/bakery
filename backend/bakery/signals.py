from django.db.models.signals import post_save
from django.dispatch import receiver

from bakery.models import BakeryAddress


@receiver(post_save, sender=BakeryAddress)
def update_primary_address(sender, instance, **kwargs):
    if instance.primary:
        BakeryAddress.objects.filter(bakery=instance.bakery).exclude(
            id=instance.id
        ).update(primary=False)
    else:
        # If no address is marked as primary, set the latest one as primary
        if not BakeryAddress.objects.filter(
            bakery=instance.bakery, primary=True
        ).exists():
            instance.primary = True
            instance.save()
