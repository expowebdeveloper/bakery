from django.urls import path

from notification.views import (
    AdminNotificationListCreateAPIView,
    CreateNotificationAPIView,
    EmailNotificationAPIView,
    NotificationCountAPIView,
    NotificationListAPIView,
    NotificationTestAPI,
    SendNotificationAPIView,
    UpdatestatusAPIView,
)

urlpatterns = [
    path("notification/", NotificationListAPIView.as_view(), name="notification"),
    path("notification/count", NotificationCountAPIView.as_view(), name="notification"),
    path(
        "notification/create/",
        CreateNotificationAPIView.as_view(),
        name="create-notification",
    ),
    path(
        "notification/update/<int:pk>/",
        UpdatestatusAPIView.as_view(),
        name="update-notification-status",
    ),
    path(
        "send_test_notification/",
        NotificationTestAPI.as_view(),
        name="send_test_notification",
    ),
    path(
        "admin-notifications/",
        AdminNotificationListCreateAPIView.as_view(),
        name="admin-notification-list-create",
    ),
    path(
        "email-notifications/",
        EmailNotificationAPIView.as_view(),
        name="email-notifications-list",
    ),
    path(
        "email-notifications/<int:id>/",
        EmailNotificationAPIView.as_view(),
        name="email-notifications-detail",
    ),
    path(
        "notifications/send/",
        SendNotificationAPIView.as_view(),
        name="send-notification",
    ),
]
