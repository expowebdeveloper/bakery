from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import get_template

from notification.models import Notification


def send_notification_email(
    subject,
    message,
    recipients=None,
    email_body_html=None,
):
    """
    Send an email notification to specified recipients.

    Args:
        subject (str): The subject line of the email
        message (str): The plain text content of the email
        recipients (str|list, optional): Single email address or
        list of email addresses.
            Defaults to ADMIN_EMAIL from settings.
        email_body_html (str, optional): HTML template for the email body.
            If not provided, uses default admin notification template.

    Returns:
        str: Success message with recipient and subject information

    Raises:
        SMTPException: If email sending fails
        IOError: If HTML template file cannot be read
    """
    if email_body_html is None:
        with open("emails/admin_notification.html", "r") as template_file:
            email_body_html = template_file.read()

    if recipients is None:
        recipients = [settings.ADMIN_EMAIL]
    elif isinstance(recipients, str):
        recipients = [recipients]

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        recipients,
        fail_silently=False,
        html_message=email_body_html,
    )

    return f"Email sent to {recipients} with subject '{subject}'"


def send_push_notification(
    user, title, message, notification_type="alert", context=None
):
    """
    Send a real-time push notification to a specific user.

    Creates a notification record in the database and sends it through WebSocket.

    Args:
        user (User): The recipient user object
        title (str): Title of the notification
        message (str): Content of the notification
        notification_type (str, optional): Type of notification. Defaults to "alert".
            Valid types: "alert", "success", "warning", "error"
        context (dict, optional): Additional metadata for the notification.
            Can include any JSON-serializable data.

    Returns:
        Notification: The created notification object

    Raises:
        ChannelLayerError: If WebSocket channel layer is not configured
        DatabaseError: If notification creation fails
    """
    # Create notification in database
    Notification.objects.create(
        recipient=user,
        title=title,
        message=message,
        notification_type=notification_type,
        meta_data=context,
    )

    # Send WebSocket notification
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{user.id}",
        {
            "type": "send_notification",
            "title": title,
            "message": message,
            "notification_type": notification_type,
        },
    )


def format_notification_message(template_name, context):
    """
    Format a notification message using a template and context data.

    Args:
        template_name (str): Name of the template file in notifications/templates
        context (dict): Data to be inserted into the template

    Returns:
        str: Formatted notification message

    Raises:
        TemplateDoesNotExist: If template file is not found
        TemplateSyntaxError: If template contains syntax errors
    """
    template = get_template(f"notifications/{template_name}")
    return template.render(context)


def bulk_send_notifications(users, title, message, notification_type="alert"):
    """
    Send the same notification to multiple users.

    Args:
        users (QuerySet|list): Collection of User objects
        title (str): Title of the notification
        message (str): Content of the notification
        notification_type (str, optional): Type of notification. Defaults to "alert"

    Returns:
        int: Number of notifications sent successfully

    Raises:
        DatabaseError: If bulk creation fails
    """
    notifications = [
        Notification(
            recipient=user,
            title=title,
            message=message,
            notification_type=notification_type,
        )
        for user in users
    ]

    created_notifications = Notification.objects.bulk_create(notifications)

    # Send WebSocket notifications
    channel_layer = get_channel_layer()
    for user in users:
        async_to_sync(channel_layer.group_send)(
            f"notifications_{user.id}",
            {
                "type": "send_notification",
                "title": title,
                "message": message,
                "notification_type": notification_type,
            },
        )

    return len(created_notifications)
