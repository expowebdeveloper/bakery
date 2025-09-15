from rest_framework import serializers

from notification.models import AdminNotification, EmailNotification, Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class CreateNotificationserializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["notification_type", "title", "message", "is_read"]


class UpdateStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["is_read"]


class AdminNotificationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = "__all__"


class EmailNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = "__all__"
