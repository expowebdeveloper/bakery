from django.urls import path

from orders.views import (
    ApproveOrderAPIView,
    CheckoutAPIView,
    DownloadInvoiceAPIView,
    DownloadOrderAPIView,
    GetInvoiceAPIView,
    GetOrderByIdAPIView,
    GetUserInvoiceAPIView,
    ListInvoicesAPIView,
    NotifyInvoiceStatusUpdateView,
    OrderListAPIVIew,
)

urlpatterns = [
    path("checkout/", CheckoutAPIView.as_view(), name="checkout"),
    path("pending-approval/", ApproveOrderAPIView.as_view(), name="pending-approval"),
    path(
        "pending-approval/<int:pk>/",
        ApproveOrderAPIView.as_view(),
        name="update-pending-approval",
    ),
    path("orders/", OrderListAPIVIew.as_view(), name="orders"),
    path("invoices/", ListInvoicesAPIView.as_view(), name="list-invoices"),
    path("invoices/<int:pk>/", GetInvoiceAPIView.as_view(), name="single-invoice"),
    path("user-invoices/", GetUserInvoiceAPIView.as_view(), name="user-invoices"),
    path(
        "user-invoices/<int:pk>/", GetUserInvoiceAPIView.as_view(), name="user-invoices"
    ),
    path(
        "download-invoice/<str:invoice_number>/",
        DownloadInvoiceAPIView.as_view(),
        name="download-invoice",
    ),
    path(
        "notify-invoice-status/",
        NotifyInvoiceStatusUpdateView.as_view(),
        name="notify-invoice-status",
    ),
    path(
        "generate-order-pdf/<str:order_id>/",
        DownloadOrderAPIView.as_view(),
        name="generate_order_pdf_api",
    ),
    path(
        "orders/<str:order_id>/",
        GetOrderByIdAPIView.as_view(),
        name="order_detail",
    ),
]
