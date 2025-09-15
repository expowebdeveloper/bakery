from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from notification.models import Notification
from notification.utils import send_push_notification
from product.models import Product

User = get_user_model()


@receiver(post_save, sender=Product)
def notify_on_new_object(sender, instance, created, **kwargs):
    if created:
        message = f"A new {sender.__name__} has been created: {instance}"
        title = "New Product Added"
        context = {"product_id": instance.id}
        for user in User.objects.filter(is_superuser=True):
            send_push_notification(user, title, message, context=context)


@receiver(post_save, sender=Notification)
def notify_new_notification(sender, instance, created, **kwargs):
    if created:
        # Get the channel layer and send the notification to the group
        channel_layer = get_channel_layer()
        room_group_name = f"notifications_{instance.recipient.id}"
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                "type": "send_new_notification",
                "notification": {
                    "title": instance.title,
                    "message": instance.message,
                    "timestamp": instance.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                },
            },
        )
