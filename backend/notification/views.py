from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils.timezone import now
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from account.models import CustomUser
from account.permissions import IsAdmin
from notification.models import AdminNotification, EmailNotification, Notification
from notification.serializers import (
    AdminNotificationStatusSerializer,
    CreateNotificationserializer,
    EmailNotificationSerializer,
    NotificationSerializer,
    UpdateStatusSerializer,
)


class NotificationListAPIView(APIView):
    """
    API view for listing user notifications.

    Methods:
    - GET: List all notifications for the authenticated user
        - Ordered by creation date (newest first)
        - Paginated results

    Authentication:
    - Requires JWT authentication
    """

    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user_notification = Notification.objects.filter(recipient=request.user)
        search = self.request.GET.get("search")
        if search is not None:
            is_read_value = search.lower() in ["true", "1", "yes"]
            user_notification = user_notification.filter(is_read=is_read_value)

        user_notification = user_notification.order_by("-created_at")

        paginator = self.pagination_class()
        paginated_list = paginator.paginate_queryset(user_notification, request)
        serializer = NotificationSerializer(paginated_list, many=True)
        return paginator.get_paginated_response(serializer.data)


class NotificationCountAPIView(APIView):
    """
    API view for getting count of unread notifications.

    Methods:
    - GET: Return count of unread notifications for the authenticated user

    Returns:
    - JSON with notification_count field

    Authentication:
    - Requires JWT authentication
    """

    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        notification_count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()

        return Response(
            {"notification_count": notification_count}, status=status.HTTP_200_OK
        )


class CreateNotificationAPIView(APIView):
    """
    API view for creating admin notifications.

    Methods:
    - POST: Create a new notification
        Required fields:
        - notification_type
        - title
        - message

    Authentication:
    - Requires JWT authentication
    - Admin access required
    """

    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(request_body=CreateNotificationserializer)
    def post(self, request):
        user = CustomUser.objects.get(is_superuser=True)
        notification_data = {
            "recipient": user.id,
            "sender": request.user.id,
            "notification_type": request.data.get("notification_type"),
            "title": request.data.get("title"),
            "message": request.data.get("message"),
        }
        serializer = NotificationSerializer(data=notification_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdatestatusAPIView(APIView):
    """
    API view for managing notification status.

    Methods:
    - PATCH: Update notification read status
        - Marks notification as read
    - DELETE: Delete a notification

    Returns:
    - 200: Status updated successfully
    - 404: Notification not found

    Authentication:
    - Requires JWT authentication
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(request_body=UpdateStatusSerializer)
    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"message": "No record found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if notification.is_read:
            return Response(
                {"message": "Updated status successfully"}, status=status.HTTP_200_OK
            )
        serializer = UpdateStatusSerializer(
            notification, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Updated status successfully"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

    @swagger_auto_schema(request_body=UpdateStatusSerializer)
    def delete(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"message": "No record found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        notification.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationTestAPI(APIView):
    """
    API view for testing notification creation.

    Methods:
    - POST: Create a test notification for the authenticated user
        - Automatically sets sender and recipient as current user

    Authentication:
    - Requires JWT authentication
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):

        sender = request.user
        request.data["sender"] = sender.id
        request.data["recipient"] = sender.id
        serializer = NotificationSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminNotificationTestAPI(APIView):
    """
    API view for testing admin notifications.

    Methods:
    - POST: Create a test admin notification

    Authentication:
    - Requires JWT authentication
    - Admin access required
    """

    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = AdminNotificationStatusSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminNotificationListCreateAPIView(APIView):
    """
    API view for managing admin notifications.

    Methods:
    - GET: Retrieve admin notification settings
        - Returns last created notification settings
    - POST: Create or update admin notification settings
        - Updates existing settings if found
        - Creates new settings if not found

    Authentication:
    - Requires JWT authentication
    - Admin access required
    """

    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        data = request.data.copy()
        data["user"] = request.user.id
        try:
            notifications = AdminNotification.objects.get(user=request.user.id)
        except AdminNotification.DoesNotExist:
            notifications = AdminNotification.objects.create(user=request.user)
        notifications = AdminNotification.objects.all().last()
        serializer = AdminNotificationStatusSerializer(notifications)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        data["user"] = request.user.id

        try:
            notification = AdminNotification.objects.get(user=request.user)
            serializer = AdminNotificationStatusSerializer(notification, data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except AdminNotification.DoesNotExist:
            serializer = AdminNotificationStatusSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailNotificationAPIView(APIView):
    """
    API view for managing email notifications.

    Methods:
    - GET: List all email notifications or get specific one by ID
    - POST: Create a new email notification
    - PUT: Update an existing email notification
    - DELETE: Delete an email notification

    Parameters:
    - id (optional): Email notification ID for specific operations

    Returns:
    - 200: Success
    - 404: Notification not found
    - 400: Invalid request
    """

    def get(self, request, *args, **kwargs):
        email_id = kwargs.get("id", None)
        if email_id:
            try:
                notification = EmailNotification.objects.get(id=email_id)
                serializer = EmailNotificationSerializer(notification)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except EmailNotification.DoesNotExist:
                return Response(
                    {"detail": "EmailNotification not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        notifications = EmailNotification.objects.all()
        serializer = EmailNotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = EmailNotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        email_id = kwargs.get("id", None)
        if not email_id:
            return Response(
                {"detail": "ID is required for updating"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            notification = EmailNotification.objects.get(id=email_id)
        except EmailNotification.DoesNotExist:
            return Response(
                {"detail": "EmailNotification not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = EmailNotificationSerializer(notification, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        email_id = kwargs.get("id", None)
        if not email_id:
            return Response(
                {"detail": "ID is required for deletion"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            notification = EmailNotification.objects.get(id=email_id)
            notification.delete()
            return Response(
                {"detail": "EmailNotification deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except EmailNotification.DoesNotExist:
            return Response(
                {"detail": "EmailNotification not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class SendNotificationAPIView(APIView):
    """
    API view for sending real-time notifications.

    Methods:
    - POST: Send a notification to a specific user
        Required fields:
        - user_id: Target user ID
        - title: Notification title
        - message: Notification content

    Features:
    - Creates notification in database
    - Sends real-time WebSocket notification
    - Handles async-to-sync conversion for WebSocket

    Returns:
    - 201: Notification sent successfully
    - 400: Missing required fields
    """

    def post(self, request, *args, **kwargs):
        user_id = request.data.get("user_id")
        title = request.data.get("title")
        message = request.data.get("message")

        if not user_id or not title or not message:
            return Response(
                {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Save notification in DB (Sync Mode)
        notification = Notification.objects.create(
            recipient_id=user_id, title=title, message=message, created_at=now()
        )

        # Send real-time WebSocket notification (Ensure it's sync-safe)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"notifications_{user_id}",
            {
                "type": "send_new_notification",
                "notification": {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "is_read": notification.is_read,
                    "timestamp": notification.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                },
            },
        )

        return Response(
            {
                "message": "Notification sent successfully!",
                "data": NotificationSerializer(notification).data,
            },
            status=status.HTTP_201_CREATED,
        )
