# bakery_management/asgi.py

import os

import django
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

# Ensure the Django settings module is set before any other code
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bakery_management.settings")

# Set up Django
django.setup()


from notification.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
