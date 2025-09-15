from django.contrib import admin

from notification.models import AdminNotification, Notification

# Register your models here.
admin.site.register(Notification)
admin.site.register(AdminNotification)
