import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from notification.models import Notification


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handles WebSocket connection and retrieves user notifications."""
        self.user_id = self.scope["url_route"]["kwargs"].get("user_id")

        if self.user_id:
            self.room_group_name = f"notifications_{self.user_id}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

            # Fetch all notifications (both read and unread)
            all_notifications = await self.get_all_notifications(self.user_id)
            await self.send_notifications(all_notifications)
        else:
            await self.close()

    async def disconnect(self, close_code):
        """Handles WebSocket disconnection."""
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    @sync_to_async
    def get_all_notifications(self, user_id):
        """
        Fetch all notifications (read & unread) for the user from the database.
        """
        notifications = Notification.objects.filter(recipient_id=user_id).order_by(
            "-created_at"
        )
        return list(notifications)

    async def send_notifications(self, notifications):
        """
        Send all notifications asynchronously to the WebSocket client.
        """

        notifications_data = []
        for notification in notifications:
            meta_data_value = notification.meta_data

            if isinstance(meta_data_value, str):
                try:
                    meta_data_value = json.loads(
                        meta_data_value
                    )  # Convert JSON string to dict
                except json.JSONDecodeError:
                    meta_data_value = {}

            notifications_data.append(
                {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "is_read": notification.is_read,
                    "timestamp": notification.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "meta_data": meta_data_value,
                }
            )
        await self.send(text_data=json.dumps({"notifications": notifications_data}))

    async def receive(self, text_data):
        """
        Handle incoming WebSocket messages (e.g., marking notifications as read).
        """
        data = json.loads(text_data)
        notification_id = data.get("notification_id")

        if notification_id:
            await self.mark_notification_as_read(notification_id)
            # Send updated notifications after marking as read
            updated_notifications = await self.get_all_notifications(self.user_id)
            await self.send_notifications(updated_notifications)

    @sync_to_async
    def mark_notification_as_read(self, notification_id):
        """
        Mark a notification as read in the database.
        """
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.is_read = True
            notification.save()
        except Notification.DoesNotExist:
            pass

    async def send_new_notification(self, event):
        """
        Receive a new notification from the channel layer and send it to the WebSocket.
        """
        notification = event["notification"]
        await self.send(
            text_data=json.dumps(
                {
                    "id": notification["id"],
                    "title": notification["title"],
                    "message": notification["message"],
                    "is_read": notification["is_read"],
                    "meta_data": notification["meta_data"],
                    "timestamp": notification["timestamp"],
                }
            )
        )
