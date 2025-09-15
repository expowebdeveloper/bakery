from django.urls import path

from cart.views import CartAPIView, CartItemAPIView, ReOrderCartItemAPIView

urlpatterns = [
    path("", CartAPIView.as_view(), name="cart-create"),
    path("item/", CartItemAPIView.as_view(), name="cart-item-create"),
    path("item/<int:pk>/", CartItemAPIView.as_view(), name="cart-item"),
    path("re-order/", ReOrderCartItemAPIView.as_view(), name="re-order"),
]
