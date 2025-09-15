import logging
import re
from datetime import time
from io import BytesIO

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db.models import Q, Value
from django.db.models.functions import Concat
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from xhtml2pdf import pisa

from account.permissions import (
    AllowGetOnlyIsAdminStockManager,
    AllowGetOnlyIsAdminStockWorker,
    IsBakery,
)
from bakery.models import Bakery, BakeryAddress
from cart.models import Cart, CartItem
from orders.models import Invoice, Order, OrderItem, OrderStatus
from orders.serializers import (
    AdminOrderSerializer,
    InvoiceIDSerializer,
    InvoiceSerializer,
    InvoiceStatusUpdateSerializer,
    OrderApprovalStatusSerializer,
    OrderCustomerAddress,
    OrderSerializer,
)
from orders.utils import generate_invoice_pdf

logger = logging.getLogger(__name__)


class CheckoutAPIView(APIView):
    """
    API view for handling order checkout process.

    Methods:
    - POST: Create a new order from cart items
        - Validates user authentication and role
        - Checks shipping address
        - Processes cart items into order items
        - Handles coupon applications
        - Generates invoice if applicable

    Returns:
    - 200: Successful checkout with order details
    - 400: Invalid request (empty cart, invalid address)
    - Redirects to registration if user is not authenticated

    Authentication:
    - Requires user authentication
    - Must be a bakery user
    """

    @swagger_auto_schema(request_body=OrderCustomerAddress)
    def post(self, request):

        if not request.user.is_authenticated:
            return Response(
                {"message": "Please contact with Admin for place this order"},
                status=status.HTTP_200_OK,
            )

        if hasattr(request.user, "role") and request.user.role == "bakery":
            try:
                bakery = Bakery.objects.get(user=request.user)
                bakery_address = BakeryAddress.objects.filter(
                    bakery=bakery, primary=True
                ).last()
                if not bakery_address:
                    return Response(
                        {"message": "Primary address for the bakery not found"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                contact_info = {
                    "email": request.user.email,
                    "contact_number": bakery.contact_no,
                    "shipping_address": bakery_address,
                }
            except Bakery.DoesNotExist:
                return Response(
                    {"message": "Bakery profile not found"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"message": "Please contact with Admin for place this order"},
                status=status.HTTP_200_OK,
            )

        shipping_address = request.data.get("shipping_address_id")
        if shipping_address:
            try:
                shipping_address = BakeryAddress.objects.get(
                    id=shipping_address, bakery=bakery
                )
                shipping_address_str = (
                    f"{shipping_address.address}, "
                    f"{shipping_address.city}, "
                    f"{shipping_address.state}, "
                    f"{shipping_address.country}, "
                    f"{shipping_address.zipcode}, "
                )

            except BakeryAddress.DoesNotExist:
                shipping_address_str = ""
                return Response(
                    {"message": "Invalid shipping address"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            shipping_address_str = contact_info.get("shipping_address")

        if not shipping_address_str:
            return Response(
                {"message": "Shipping address is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {"message": "Your cart is empty"}, status=status.HTTP_400_BAD_REQUEST
            )
        cart_items = CartItem.objects.filter(cart=cart, cart__user=request.user)
        if not cart_items.exists():
            return Response(
                {"message": "Your cart is empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        current_time = timezone.now().time()

        start_time = time(6, 0)
        end_time = time(14, 0)

        # Check if current time is within range
        order_status = (
            OrderStatus.IN_TRANSIT.value
            if start_time <= current_time <= end_time
            else OrderStatus.PAYMENT_PENDING.value
        )

        try:
            coupon_name = None
            if cart.applied_coupon:
                coupon_name = cart.applied_coupon
            order = Order.objects.create(
                user=request.user,
                email=contact_info.get("email"),
                contact_number=contact_info.get("contact_number"),
                total_amount=cart.total_price,
                discount_amount=cart.discounted_price,
                final_amount=cart.total_with_vat,
                status=order_status,
                total_with_vat=cart.total_with_vat,
                vat_amount=cart.vat_amount,
                shipping_fee=cart.shipping_cost,
                address=shipping_address_str,
                coupon_name=coupon_name.code if coupon_name else None,
            )

        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        for item in cart_items:
            try:
                variant_inventory_regular_price = (
                    item.product_variant.inventory_items.regular_price
                )
                OrderItem.objects.create(
                    order=order,
                    product=item.product_variant,
                    quantity=item.quantity,
                    price=variant_inventory_regular_price,
                )
            except ValidationError as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        cart_items.delete()
        cart.applied_coupon = None
        cart.save()

        if order_status == OrderStatus.PAYMENT_PENDING.value:
            # flake8: noqa: E501
            return Response(
                {
                    "message": "Currently We are not accepting orders. Please contact support for more information",
                    "order_id": order.id,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        else:
            try:
                invoice = Invoice.objects.get(order=order.id)
                pdf_file = generate_invoice_pdf(invoice)
                invoice.pdf_file.save(f"{invoice.invoice_number}.pdf", pdf_file)
                return Response(
                    {
                        "message": "Order created successfully",
                        "order_id": order.id,
                        "invoice_file": invoice.pdf_file.url,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Invoice.DoesNotExist:
                pass

        return Response(
            {"message": "Order created successfully", "order_id": order.id},
            status=status.HTTP_201_CREATED,
        )


class OrderListAPIVIew(APIView):
    """
    API view for listing user orders with comprehensive filtering.

    Methods:
    - GET: List all orders for the authenticated user with filters:
        - search: Search by email, contact number, order ID, status
        - status: Filter by order status
        - min_total/max_total: Filter by total amount range
        - created_after/created_before: Filter by date range
        - sort_by: order_id/user__first_name/status/created_at/total_amount
        - sort: asc/desc

    Authentication:
    - Requires JWT authentication
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-created_at")

        search_term = request.query_params.get("search", None)
        sort_by = request.query_params.get("sort", "created_at")

        if search_term:
            search_filter = (
                Q(email__regex=re.escape(search_term))
                | Q(contact_number__regex=re.escape(search_term))
                | Q(order_id__icontains=re.escape(search_term))
                | Q(status__regex=re.escape(search_term))
                | Q(contact_number__icontains=search_term)
                | Q(email__icontains=search_term)
                | Q(user__first_name__icontains=search_term)
            )
            orders = orders.filter(search_filter)

        status = request.query_params.get("status", None)
        if status:
            orders = orders.filter(status=status)

        # Filter by total amount range (min_total, max_total)
        min_total = request.query_params.get("min_total", None)
        max_total = request.query_params.get("max_total", None)
        if min_total:
            orders = orders.filter(total_amount__gte=min_total)
        if max_total:
            orders = orders.filter(total_amount__lte=max_total)

        created_after = request.query_params.get("created_after", None)
        created_before = request.query_params.get("created_before", None)

        if created_after:
            orders = orders.filter(created_at__gte=created_after)
        if created_before:
            orders = orders.filter(created_at__lte=created_before)

        valid_sort_fields = [
            "order_id",
            "user__first_name",
            "status",
            "created_at",
            "total_amount",
            "total_with_vat",
        ]

        # Ensure sort_field is valid
        if sort_by not in valid_sort_fields:
            sort_by = "created_at"

        sort_order = request.query_params.get("sort", "asc")

        if sort_order == "asc":
            sort_by = sort_by
        else:
            sort_by = f"-{sort_by}"
        # Sort the orders based on the sort parameter
        orders = orders.order_by(sort_by)

        # Apply pagination
        paginator = self.pagination_class()
        paginated_orders = paginator.paginate_queryset(orders, request)

        # Serialize the paginated orders
        serializer = OrderSerializer(paginated_orders, many=True)

        # Return the paginated response
        return paginator.get_paginated_response(serializer.data)


class ApproveOrderAPIView(APIView):
    """
    API view for managing and approving orders by admin/stock manager.

    Methods:
    - GET: List all orders with filters:
        - status: Filter by order status
        - user: Filter by user ID
        - search: Search across multiple fields
        - min_total/max_total: Filter by total amount
        - created_after/created_before: Filter by date range
        - sort: Various sorting options
    - PATCH: Update order status
        Required fields:
        - status: New status for the order

    Authentication:
    - Requires JWT authentication
    - Admin or stock manager access required
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        status_param = request.query_params.get("status", None)
        user_search = request.query_params.get("user", None)

        sort_by = request.query_params.get("sort", "created_at")
        search_query = request.query_params.get(
            "search", None
        )  # Get the 'q' parameter for search

        valid_sort_fields = [
            "order_id",
            "-order_id",
            "user__first_name",
            "-user__first_name",
            "status",
            "-status",
            "created_at",
            "-created_at",
        ]

        # Ensure sort_field is valid
        if sort_by not in valid_sort_fields:
            sort_by = "created_at"

        orders = Order.objects.all()

        # Filter by status if provided
        if status_param:
            orders = orders.filter(status=status_param)

        if search_query:
            search_filter = Q()

            search_filter |= Q(order_id__icontains=search_query)
            search_filter |= Q(contact_number__icontains=search_query)
            search_filter |= Q(email__icontains=search_query)
            search_filter |= Q(user__first_name__icontains=search_query)
            search_filter |= Q(address__icontains=search_query)
            search_filter |= Q(coupon_name__icontains=search_query)

            orders = orders.filter(search_filter)

        sort_order = request.query_params.get("sort", "asc")

        if sort_order == "desc":
            sort_by = sort_by
        else:
            sort_by = f"-{sort_by}"

        orders = orders.order_by(sort_by)
        if user_search:
            orders = orders.filter(user__id=user_search)
        min_total = request.query_params.get("min_total", None)
        max_total = request.query_params.get("max_total", None)
        if min_total:
            orders = orders.filter(total_amount__gte=min_total)
        if max_total:
            orders = orders.filter(total_amount__lte=max_total)

        created_after = request.query_params.get("created_after", None)
        created_before = request.query_params.get("created_before", None)
        if created_after:
            orders = orders.filter(created_at__gte=created_after)
        if created_before:
            orders = orders.filter(created_at__lte=created_before)

        # Apply pagination
        paginator = self.pagination_class()
        paginated_orders = paginator.paginate_queryset(orders, request)

        # Serialize the data
        serializer = AdminOrderSerializer(paginated_orders, many=True)

        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(request_body=OrderApprovalStatusSerializer)
    def patch(self, request, pk):
        serializer = OrderApprovalStatusSerializer(data=request.data)
        if serializer.is_valid():
            order_status = serializer.validated_data.pop("status")
            try:
                order = Order.objects.get(id=pk)
            except Order.DoesNotExist:
                return Response(
                    {"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND
                )
            else:
                order.status = order_status
                order.save()
        else:
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            {"message": "Updated status successfully"}, status=status.HTTP_200_OK
        )


class DownloadInvoiceAPIView(APIView):
    """
    API view for downloading order invoices.

    Methods:
    - GET: Download invoice PDF file by invoice number

    Returns:
    - PDF file response
    - 404 if invoice not found

    Authentication:
    - Requires JWT authentication
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, invoice_number):
        invoice = get_object_or_404(Invoice, invoice_number=invoice_number)
        return FileResponse(
            invoice.pdf_file, as_attachment=True, filename=f"{invoice_number}.pdf"
        )


class ListInvoicesAPIView(APIView):
    """
    API view for listing and filtering invoices.

    Methods:
    - GET: List all invoices with filters:
        - search: Search across invoice number, user details, status
        - status: Filter by invoice status
        - sort_by: Various sorting options (created_at, order_id, total_amount, etc.)
        - start_date/end_date: Filter by date range

    Authentication:
    - Requires JWT authentication
    - Admin or stock worker access required
    """

    permission_classes = [AllowGetOnlyIsAdminStockWorker]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        invoices = Invoice.objects.all()

        # Search parameters
        search_term = request.query_params.get("search")
        status = request.query_params.get("status")
        sort_by = request.query_params.get("sort_by", "-created_at")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        # Regex search for invoice number if provided

        if start_date and end_date:
            invoices = invoices.filter(date__range=[start_date, end_date])
        if search_term:
            # Use regex for case-sensitive search
            invoices = invoices.annotate(
                full_name=Concat("user__first_name", Value(" "), "user__last_name")
            ).filter(
                Q(invoice_number__regex=search_term)
                | Q(user__first_name__regex=search_term)
                | Q(user__last_name__regex=search_term)
                | Q(user__email__regex=search_term)
                | Q(full_name__regex=search_term)
                | Q(status__regex=search_term)
                | Q(order__order_id__regex=search_term)
            )
        if status:
            invoices = invoices.filter(status=status)

        # Ordering logic
        if sort_by:
            if sort_by == "desc":
                invoices = invoices.order_by("created_at")
            elif sort_by == "asc":
                invoices = invoices.order_by("-created_at")
            if sort_by == "order_id":
                invoices = invoices.order_by("order_id")
            elif sort_by == "-order_id":
                invoices = invoices.order_by("-order_id")
            elif sort_by == "-total_amount":
                invoices = invoices.order_by("-total_amount")
            elif sort_by == "total_amount":
                invoices = invoices.order_by("total_amount")
            elif sort_by == "a_to_z":
                invoices = invoices.order_by("user__first_name")
            elif sort_by == "z_to_a":
                invoices = invoices.order_by("-user__first_name")
            elif sort_by == "invoice_number":
                invoices = invoices.order_by("invoice_number")
            elif sort_by == "-invoice_number":
                invoices = invoices.order_by("-invoice_number")
            elif sort_by == "status":
                invoices = invoices.order_by("status")
            elif sort_by == "-status":
                invoices = invoices.order_by("-status")

        paginator = self.pagination_class()
        paginated_invoices = paginator.paginate_queryset(invoices, request)
        serializer = InvoiceSerializer(paginated_invoices, many=True)

        return paginator.get_paginated_response(serializer.data)


class GetInvoiceAPIView(APIView):
    """
    API view for managing individual invoices.

    Methods:
    - GET: Retrieve a specific invoice by ID
    - PATCH: Update invoice status
        - Automatically regenerates PDF after status update

    Authentication:
    - Requires JWT authentication
    - Admin or stock worker access required
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowGetOnlyIsAdminStockWorker]

    def get(self, request, pk):
        try:
            invoice = Invoice.objects.get(pk=pk)
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Invoice.DoesNotExist:
            return Response(
                {"detail": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, pk):
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response(
                {"detail": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = InvoiceStatusUpdateSerializer(
            instance=invoice, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            pdf_file = generate_invoice_pdf(invoice)
            invoice.pdf_file.save(f"{invoice.invoice_number}.pdf", pdf_file)
            return Response(
                {"message": "Invoice Status Updated successfully"},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUserInvoiceAPIView(APIView):
    """
    API view for managing user-specific invoices.

    Methods:
    - GET: List/retrieve user invoices
        - With ID: Get specific invoice
        - Without ID: List all user invoices with filters:
            - status: Filter by invoice status
            - search: Search across invoice fields
            - start_date/end_date: Filter by date range
            - sort_by: Various sorting options

    Authentication:
    - Requires JWT authentication
    - Must be a bakery user
    """

    permission_classes = [IsBakery]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request, pk=None):

        if pk is not None:
            try:
                invoice = Invoice.objects.get(pk=pk, user=request.user)
            except Invoice.DoesNotExist:
                return Response(
                    {"detail": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND
                )
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            invoices = Invoice.objects.filter(user=request.user)
            invoice_status = request.query_params.get("status")
            search_term = request.query_params.get("search")
            start_date = request.query_params.get("start_date")
            end_date = request.query_params.get("end_date")
            # Regex search for invoice number if provided

            if start_date and end_date:
                invoices = invoices.filter(date__range=[start_date, end_date])
            if invoice_status:
                invoices = invoices.filter(status=invoice_status)

            if search_term:
                invoices = invoices.annotate(
                    full_name=Concat("user__first_name", Value(" "), "user__last_name")
                ).filter(
                    Q(invoice_number__regex=search_term)
                    | Q(user__first_name__regex=search_term)
                    | Q(user__last_name__regex=search_term)
                    | Q(user__email__regex=search_term)
                    | Q(full_name__regex=search_term)
                    | Q(status__regex=search_term)
                    | Q(order__order_id__regex=search_term)
                )
            sort_by = request.query_params.get("sort_by", "asc")

            if sort_by:
                if sort_by == "desc":
                    invoices = invoices.order_by("created_at")
                elif sort_by == "asc":
                    invoices = invoices.order_by("-created_at")
                if sort_by == "order_id":
                    invoices = invoices.order_by("order_id")
                elif sort_by == "-order_id":
                    invoices = invoices.order_by("-order_id")
                elif sort_by == "-total_amount":
                    invoices = invoices.order_by("-total_amount")
                elif sort_by == "total_amount":
                    invoices = invoices.order_by("total_amount")
                elif sort_by == "a_to_z":
                    invoices = invoices.order_by("user__first_name")
                elif sort_by == "z_to_a":
                    invoices = invoices.order_by("-user__first_name")
                elif sort_by == "invoice_number":
                    invoices = invoices.order_by("invoice_number")
                elif sort_by == "-invoice_number":
                    invoices = invoices.order_by("-invoice_number")
                elif sort_by == "status":
                    invoices = invoices.order_by("status")
                elif sort_by == "-status":
                    invoices = invoices.order_by("-status")

            paginator = self.pagination_class()
            paginated_invoices = paginator.paginate_queryset(invoices, request)

            serializer = InvoiceSerializer(paginated_invoices, many=True)

        return paginator.get_paginated_response(serializer.data)


class NotifyInvoiceStatusUpdateView(APIView):
    """
    API view for sending invoice status update notifications.

    Methods:
    - POST: Send email notification about invoice status update
        Required fields:
        - invoice_id: ID of the updated invoice

    Features:
    - Sends HTML email with status update details
    - Includes invoice details in the notification

    Authentication:
    - Requires user authentication
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InvoiceIDSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        invoice_id = serializer.validated_data["invoice_id"]

        try:
            # Fetch the invoice
            invoice = Invoice.objects.get(id=invoice_id)

            # Get user email
            user_email = (
                invoice.user.email
            )  # Assuming 'user' is a ForeignKey in Invoice

            # Compose the email
            subject = f"Invoice #{invoice.invoice_number} Status Update"
            message = (
                f"Dear {invoice.user.first_name},\n\n"
                f"Your invoice with ID #{invoice.invoice_number} has been updated. "
                f"The current status is: {invoice.status}.\n\n"
                f"Thank you,\nYour Company Name"
            )
            context = {
                "user_first_name": invoice.user.first_name,
                "order_id": invoice.order.order_id,
                "new_status": invoice.status,
                "old_status": "",
                "invoice": invoice,
            }
            html_message = render_to_string(
                "emails/invoice_status_update.html", context
            )

            # Send the email
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user_email],
                fail_silently=False,
                html_message=html_message,
            )

            return Response(
                {"success": f"Email sent to {user_email} for status update."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to send email: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadOrderAPIView(APIView):
    """
    API view for downloading order details as PDF.

    Methods:
    - GET: Generate and download order PDF by order ID
        - Includes order details, items, and pricing

    Returns:
    - PDF file response
    - 404 if order not found

    Authentication:
    - Requires JWT authentication
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, order_id, *args, **kwargs):
        try:
            # Fetch the order from the database using the order_id
            order = Order.objects.get(order_id=order_id)
        except Order.DoesNotExist:
            raise NotFound("Order not found")

        # Prepare order data for rendering
        order_data = {
            "order_id": order.order_id,
            "customer_name": f"{order.user.first_name} {order.user.last_name}",
            "order_date": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "items": [
                {
                    "name": item.product.variant_name,
                    "quantity": item.quantity,
                    "price": item.price,
                }
                for item in order.items.all()
            ],
            "total_amount": order.total_amount,
        }

        html_content = render_to_string("orders.html", order_data)
        buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html_content.encode("utf-8"), dest=buffer)

        if pisa_status.err:
            logger.error("Error: %s" % pisa_status.err)
        pdf = buffer.getvalue()
        buffer.close()
        return HttpResponse(pdf, content_type="application/pdf")


class GetOrderByIdAPIView(APIView):
    """
    API view for retrieving specific order details.

    Methods:
    - GET: Retrieve detailed information for a specific order
        - Includes order items, status, and pricing details

    Returns:
    - 200: Order details
    - 404: Order not found

    Authentication:
    - Requires JWT authentication
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, order_id):
        # Fetch the order using the provided order_id
        order = get_object_or_404(Order, order_id=order_id)

        # Serialize the order
        serializer = OrderSerializer(order)

        # Return the serialized data
        return Response(serializer.data, status=status.HTTP_200_OK)
