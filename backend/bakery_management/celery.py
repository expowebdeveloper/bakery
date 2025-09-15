import os

from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bakery_management.settings")

app = Celery("bakery_management")

# Configurations from Django settings with CELERY_ prefix
app.config_from_object("django.conf:settings", namespace="CELERY")

# Add the beat schedule directly within the app configuration
app.conf.beat_schedule = {
    "send-low-stock-notifications-every-minute": {
        "task": "notification.tasks.send_low_stock_notifications",
        "schedule": crontab(minute="*/1"),
    },
}

# Set timezone if required
app.conf.timezone = "UTC"  # Adjust this to your timezone, e.g., 'Asia/Kolkata'

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()
