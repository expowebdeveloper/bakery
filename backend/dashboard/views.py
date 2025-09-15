import logging
from datetime import datetime, timedelta

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db.models import Count, Q, Sum, Value
from django.db.models.functions import Concat, TruncWeek
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags
from django.utils.timezone import now
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from account.models import CustomUser
from account.permissions import AllowGetOnlyIsAdminStockManager, IsAdmin
from bakery.models import Bakery
from bakery.serializers import BakeryAdminSerializer
from dashboard.models import (
    AdminConfiguration,
    AdminInvoiceConfiguration,
    CustomerQuery,
    ZipCodeConfig,
)
from dashboard.serializers import (
    AdminConfigurationSerializer,
    AdminInvoiceConfigurationSerializer,
    CustomerQuerySerializer,
    ZipCodeConfigSerializer,
)
from orders.models import Order, OrderItem
from product.models import Category, Inventory, Product, ProductVariant

logger = logging.getLogger(__name__)


class ZipCodeConfiguration(APIView):
    """
    API view for managing zip code delivery configurations.

    Methods:
    - GET: List all zip code configurations or get specific one
        Query Parameters:
        - search: Filter by zip code, city, state
        - sort_by: Sort by various fields (asc/desc/min_order/delivery/etc.)
        - status: Filter by status
    - POST: Create new zip code configuration
    - PATCH: Update existing zip code configuration
    - DELETE: Soft delete zip code configuration

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager access only (GET allowed for all)
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classess = [JWTAuthentication]

    def get_queryset(self):
        queryset = ZipCodeConfig.objects.filter(is_deleted=False)

        search = self.request.query_params.get("search")
        sort_by = self.request.query_params.get("sort_by", "asc")

        if search:
            queryset = queryset.filter(
                Q(zip_code__iregex=search)
                | Q(city__iregex=search)
                | Q(state__iregex=search)
                | Q(delivery_availability__iexact=search)
                | Q(min_order_quantity__iexact=search)
                | Q(min_order_amount__iexact=search)
                | Q(delivery_threshold__iexact=search)
            )
        if sort_by == "asc":
            queryset = queryset.order_by("-zip_code")
        elif sort_by == "desc":
            queryset = queryset.order_by("zip_code")
        elif sort_by == "min_order":
            queryset = queryset.order_by("min_order_amount")
        elif sort_by == "-min_order":
            queryset = queryset.order_by("-min_order_amount")
        elif sort_by == "-delivery":
            queryset = queryset.order_by("-delivery_threshold")
        elif sort_by == "delivery":
            queryset = queryset.order_by("-delivery_threshold")
        elif sort_by == "-delivery_availability":
            queryset = queryset.order_by("-delivery_availability")
        elif sort_by == "delivery_availability":
            queryset = queryset.order_by("delivery_availability")

        return queryset

    def get(self, request, id=None):
        """
        Retrieve zip code configurations with optional filtering.

        Args:
            request: HTTP request object
            id (optional): Specific configuration ID

        Returns:
            Response: Paginated list of configurations or single configuration
        """
        if id:
            delivery = get_object_or_404(ZipCodeConfig, id=id, is_deleted=False)
            serializer = ZipCodeConfigSerializer(delivery)
            return Response(serializer.data, status=status.HTTP_200_OK)

        paginator = PageNumberPagination()
        deliveries = self.get_queryset()
        paginated_deliveries = paginator.paginate_queryset(deliveries, request)
        serializer = ZipCodeConfigSerializer(paginated_deliveries, many=True)
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(request_body=ZipCodeConfigSerializer)
    def post(self, request):
        serializer = ZipCodeConfigSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(request_body=ZipCodeConfigSerializer)
    def patch(self, request, id):
        delivery = get_object_or_404(ZipCodeConfig, id=id)

        serializer = ZipCodeConfigSerializer(delivery, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        delivery = get_object_or_404(ZipCodeConfig, id=id, is_deleted=False)
        delivery.is_deleted = True
        delivery.save()
        return Response({"message": "Item deleted"}, status=status.HTTP_204_NO_CONTENT)


class ProductStatsView(APIView):
    """
    API view for retrieving comprehensive product statistics.

    Methods:
    - GET: Get detailed statistics about products, orders, and customers
        Query Parameters:
        - days: Time period for stats (7/15/30 days)

    Returns statistics including:
    - Total orders and revenue
    - Customer growth rates
    - Product counts and variants
    - Weekly sales data
    - Customer acquisition data

    Authentication:
    - Requires JWT authentication
    - Admin access only
    """

    permission_classes = [IsAdmin]
    authentication_classess = [JWTAuthentication]

    def get(self, request):
        """
        Get comprehensive product and sales statistics.

        Args:
            request: HTTP request object with optional days parameter

        Returns:
            Response: Dictionary containing various statistics and metrics
        """
        today = timezone.now().date()
        days = request.query_params.get("days", None)

        if days in ["7", "15", "30"]:
            start_date = today - timedelta(days=int(days))
        else:
            current_year = today.year
            start_date = today.replace(month=1, day=1)

        orders_in_range = Order.objects.filter(
            created_at__date__range=(start_date, today)
        )

        total_orders_today = orders_in_range.count()
        total_workers = CustomUser.objects.filter(
            role__in=["worker", "accountant", "stock_manager"]
        ).count()
        total_bakery_customers = CustomUser.objects.filter(role="bakery").count()
        total_running_orders = Order.objects.filter(
            status__in=["in_transit", "in_progress"]
        ).count()
        total_today_order_price = (
            orders_in_range.aggregate(Sum("total_amount"))["total_amount__sum"] or 0.0
        )
        configurations = AdminConfiguration.objects.all().last()
        low_stock_threshold = (
            configurations.out_of_stock
            if configurations
            else settings.LOW_STOCK_THRESHOLD
        )
        low_stock_products = Inventory.objects.filter(
            total_quantity__lt=low_stock_threshold
        ).count()

        total_products_period = Product.objects.filter(
            created_at__date__range=(today - timedelta(days=365), today)
        ).count()
        published_products_in_period = Product.objects.filter(
            created_at__date__range=(today - timedelta(days=365), today),
            is_active=True,
            is_deleted=False,
        ).count()

        total_product_added_today = Product.objects.filter(
            created_at__date=today, is_active=True
        ).count()

        total_product_variants = ProductVariant.objects.filter(
            product__is_active=True
        ).count()

        current_year_start = today.replace(month=1, day=1)
        last_year_start = current_year_start.replace(year=current_year_start.year - 1)
        last_year_end = current_year_start - timedelta(days=1)

        # Calculate orders this year and last year
        orders_this_year = Order.objects.filter(
            created_at__date__gte=current_year_start
        ).count()
        orders_last_year = Order.objects.filter(
            created_at__date__range=(last_year_start, last_year_end)
        ).count()

        # Safely calculate orders growth rate
        if orders_last_year > 0:
            orders_growth_rate = (
                (orders_this_year - orders_last_year) / orders_last_year
            ) * 100
        else:
            orders_growth_rate = (
                0 if orders_this_year == 0 else None
            )  # None indicates new growth

        new_customers_this_year = Bakery.objects.filter(
            created_at__date__gte=current_year_start
        ).count()
        new_customers_last_year = Bakery.objects.filter(
            created_at__date__range=(last_year_start, last_year_end)
        ).count()

        # Safely calculate customers growth rate
        if new_customers_last_year > 0:
            customers_growth_rate = (
                (new_customers_this_year - new_customers_last_year)
                / new_customers_last_year
            ) * 100
        else:
            # If no customers last year, treat all current year customers as "new"
            customers_growth_rate = 0 if new_customers_this_year == 0 else None

        total_categories = Category.objects.count()
        total_in_progress_orders = Order.objects.filter(status="in_progress").count()
        thirty_days_ago = today - timedelta(days=30)

        last_thirty_day_customer = Bakery.objects.filter(
            user__role="bakery", created_at__range=(thirty_days_ago, today)
        ).count()
        current_year = now().year
        total_revenue = (
            Order.objects.filter(created_at__year=current_year).aggregate(
                Sum("total_amount")
            )["total_amount__sum"]
            or 0.0
        )

        def get_weekly_summary(start_date, end_date, role="bakery"):
            week_data = {}
            current_date = start_date
            while current_date <= end_date:
                week_num = current_date.isocalendar()[1]
                week_data[week_num] = 0
                current_date += timedelta(days=7)

            customers_by_week = (
                Bakery.objects.filter(
                    user__role=role, created_at__range=(start_date, end_date)
                )
                .annotate(week=TruncWeek("created_at"))
                .values("week")
                .annotate(total_customers=Count("id"))
            )

            for entry in customers_by_week:
                week_num = entry["week"].isocalendar()[1]
                week_data[week_num] = entry["total_customers"]

            return [
                {"week": week, "total_customers": count}
                for week, count in sorted(week_data.items())
            ]

        def get_weekly_sales_summary(start_date, end_date):
            weekly_sales_data = {}
            current_date = start_date
            while current_date <= end_date:
                week_num = current_date.isocalendar()[1]
                weekly_sales_data[week_num] = 0.0
                current_date += timedelta(days=7)

            weekly_sales_summary = (
                Order.objects.filter(created_at__date__range=(start_date, end_date))
                .annotate(week=TruncWeek("created_at"))
                .values("week")
                .annotate(total_sales=Sum("total_amount"))
                .order_by("week")
            )

            for entry in weekly_sales_summary:
                week_num = entry["week"].isocalendar()[1]
                weekly_sales_data[week_num] = float(entry["total_sales"] or 0.0)

            return [
                {"week": week, "total_sales": sales}
                for week, sales in sorted(weekly_sales_data.items())
            ]

        weekly_sales_data = get_weekly_sales_summary(start_date, today)

        first_day_current_month = today.replace(day=1)
        first_day_last_month = (first_day_current_month - timedelta(days=1)).replace(
            day=1
        )
        last_day_last_month = first_day_current_month - timedelta(days=1)

        last_month_data = get_weekly_summary(first_day_last_month, last_day_last_month)
        current_month_data = get_weekly_summary(first_day_current_month, today)

        start_of_week = today - timedelta(days=today.weekday())

        # Start of last week (Previous Monday)
        start_of_last_week = start_of_week - timedelta(days=7)
        end_of_last_week = start_of_week - timedelta(seconds=1)
        current_week_sales_count = (
            OrderItem.objects.filter(
                order__status="delivered", order__created_at__gte=start_of_week
            ).aggregate(total_sales=Sum("quantity"))["total_sales"]
            or 0
        )

        last_week_sales_count = (
            OrderItem.objects.filter(
                order__status="delivered",
                order__created_at__range=(start_of_last_week, end_of_last_week),
            ).aggregate(total_sales=Sum("quantity"))["total_sales"]
            or 0
        )
        if current_week_sales_count > 0:
            print(current_week_sales_count, last_week_sales_count)
            percentage_difference = (
                (current_week_sales_count - last_week_sales_count)
                / current_week_sales_count
            ) * 100
        else:
            percentage_difference = 0

        statistics_data = {
            "total_orders_in_period": total_orders_today,
            "total_workers": total_workers,
            "total_bakery_customers": total_bakery_customers,
            "total_running_orders": total_running_orders,
            "total_order_price_in_period": total_today_order_price,
            "low_stock_products": low_stock_products,
            "total_categories": total_categories,
            "total_products_in_period": total_products_period,
            "published_products_in_period": published_products_in_period,
            "total_product_added_today": total_product_added_today,
            "total_product_variants": total_product_variants,
            "total_in_progress_orders": total_in_progress_orders,
            "total_revenue": total_revenue,
            "weekly_sales_data": weekly_sales_data,
            "last_thirty_day_customer": last_thirty_day_customer,
            "user_summary_data": {
                "last_month_summary": last_month_data,
                "current_month_summary": current_month_data,
            },
            "current_week_sales": current_week_sales_count,
            "current_week_sale_rate": percentage_difference,
            "customer_added_percentage": customers_growth_rate,
            "order_added_percentage": orders_growth_rate,
        }

        return Response(statistics_data)


class ListCustomerBakeryAPIView(APIView):
    """
    API view for managing bakery customer accounts.

    Methods:
    - GET: List all bakery customers
        Query Parameters:
        - search: Filter by name, email, customer ID
        - sort_by: Sort by various fields
        - status: Filter by account status (including trash)
    - DELETE: Soft delete bakery account

    Authentication:
    - Requires JWT authentication
    - Admin access only
    """

    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(auto_schema=None)
    def get(self, request, *args, **kwargs):
        """
        List bakery customers with filtering and sorting.

        Args:
            request: HTTP request object with optional filters

        Returns:
            Response: Paginated list of bakery customers
        """
        bakeries = Bakery.objects.prefetch_related("addresses").annotate(
            order_count=Count("user__order")
        )

        paginator = PageNumberPagination()
        sort_by = request.query_params.get("sort_by", "asc")
        search = request.query_params.get("search")
        status = request.query_params.get("status")

        if status == "trash":
            bakeries = bakeries.filter(user__is_active=False)
        else:
            bakeries = bakeries.filter(user__is_active=True)

        if search:
            bakeries = bakeries.annotate(
                full_name=Concat("user__first_name", Value(" "), "user__last_name")
            ).filter(
                Q(name__iregex=search)
                | Q(user__first_name__iregex=search)
                | Q(user__email__iregex=search)
                | Q(full_name__regex=search)
                | Q(customer_id__regex=search)
            )

        valid_sort_fields = [
            "created_at",
            "created_at",
            "-created_at",
            "-created_at",
            "title",
            "name",
            "-title",
            "-name",
            "name",
            "user__first_name",
            "-name",
            "-user__first_name",
            "order_count",
            "-order_count",
            "customer_id",
            "-customer_id",
        ]
        if sort_by in valid_sort_fields:
            bakeries = bakeries.order_by(sort_by)
        else:
            bakeries = bakeries.order_by("-created_at")

        paginated_bakeries = paginator.paginate_queryset(bakeries, request)
        serializer = BakeryAdminSerializer(paginated_bakeries, many=True)
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        operation_description="Update the is_active flag of a bakery's user"
    )
    def patch(self, request, pk, *args, **kwargs):
        """
        Update the is_active flag of a bakery's user.

        Args:
            request: HTTP request object
            pk: Primary key of bakery

        Returns:
            Response: Success or error message
        """
        try:
            bakery = Bakery.objects.filter(pk=pk).first()
            if not bakery:
                return Response(
                    {"error": "Bakery with the given ID does not exist"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            user = bakery.user
            is_active = request.data.get("is_active")

            if is_active is None:
                return Response(
                    {"error": "is_active field is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.is_active = bool(is_active)
            user.save()

            return Response(
                {"message": f"Bakery user is_active updated to {user.is_active}"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @swagger_auto_schema(
        operation_description="Delete a bakery and associated user by pk"
    )
    def delete(self, request, pk, *args, **kwargs):
        """
        Deletes a bakery and associated user.

        Args:
            request: HTTP request object
            pk: Primary key of bakery

        Returns:
            Response: Success or error message
        """
        try:
            bakery = Bakery.objects.filter(pk=pk).first()
            if not bakery:
                return Response(
                    {"error": "Bakery with the given ID does not exist"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            user = bakery.user

            # Delete bakery
            bakery.delete()

            # Delete user if exists
            if user:
                user.delete()

            return Response(
                {"message": "Bakery and associated user deleted successfully"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AdminConfigurationAPIView(APIView):
    """
    API view for managing admin configurations.

    Methods:
    - GET: Retrieve current admin configuration
    - POST: Create or update admin configuration
    - DELETE: Delete admin configuration

    Manages system-wide settings including:
    - Stock thresholds
    - Notification settings
    - Default configurations

    Authentication:
    - Requires JWT authentication
    - Admin access only
    """

    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        """
        Retrieve the current admin configuration.

        Args:
            request: HTTP request object

        Returns:
            Response: Current admin configuration or 404 if not found
        """
        try:
            configuration = AdminConfiguration.objects.get()
            serializer = AdminConfigurationSerializer(configuration)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except AdminConfiguration.DoesNotExist:
            return Response(
                {"message": "AdminConfiguration not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def post(self, request):
        """
        Create or update the single AdminConfiguration record.
        If it already exists, update the record.
        """
        try:
            configuration = AdminConfiguration.objects.get()
            serializer = AdminConfigurationSerializer(
                configuration, data=request.data, partial=True
            )
        except AdminConfiguration.DoesNotExist:
            serializer = AdminConfigurationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        Delete the single AdminConfiguration record.
        """
        try:
            configuration = AdminConfiguration.objects.get()
            configuration.delete()
            return Response(
                {"message": "AdminConfiguration deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except AdminConfiguration.DoesNotExist:
            return Response(
                {"message": "AdminConfiguration not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class AdminInvoiceConfigurationView(APIView):
    """
    API view for managing invoice configurations.

    Methods:
    - GET: Retrieve current invoice configuration
    - POST: Create or update invoice configuration

    Handles:
    - Invoice template settings
    - Company details for invoices
    - Logo and branding elements

    Authentication:
    - Requires JWT authentication
    - Admin access only

    Parser Classes:
    - Supports multipart form data for file uploads
    """

    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]  # Add parser for file uploads

    def get(self, request, *args, **kwargs):
        """
        Retrieve the current invoice configuration.

        Args:
            request: HTTP request object

        Returns:
            Response: Current invoice configuration or 404 if not found
        """
        instance = AdminInvoiceConfiguration.objects.first()
        if instance:
            serializer = AdminInvoiceConfigurationSerializer(
                instance, context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"error": "Configuration not found."}, status=status.HTTP_404_NOT_FOUND
        )

    def post(self, request, *args, **kwargs):
        """
        Create or update invoice configuration.

        Args:
            request: HTTP request object with configuration data
                and optional file uploads

        Returns:
            Response: Updated configuration data or error message
        """
        instance = AdminInvoiceConfiguration.objects.first()

        if instance:
            serializer = AdminInvoiceConfigurationSerializer(
                instance, data=request.data, partial=True
            )
        else:
            serializer = AdminInvoiceConfigurationSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Configuration saved successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerQueryPermission(permissions.BasePermission):
    """
    Custom permission:
    - Anyone can create (`POST`)
    - Only admin users can retrieve (`GET`), update (`PATCH`), or delete (`DELETE`)
    """

    def has_permission(self, request, view):
        # Allow everyone to create a query (POST request)
        if request.method == "POST":
            return True
        # Allow only admin users for GET, PATCH, DELETE
        return request.user.is_authenticated and request.user.is_staff


class CustomerQueryListCreateAPIView(generics.ListCreateAPIView):
    """
    API to list all customer queries and create a new one.
    Sends an email to the admin when a new query is created.
    """

    queryset = CustomerQuery.objects.all()
    serializer_class = CustomerQuerySerializer
    permission_classes = [CustomerQueryPermission]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        # Save the customer query
        customer_query = serializer.save()

        # Email details
        subject = "New Customer Query Received"
        admin_email = settings.ADMIN_EMAIL  # Define ADMIN_EMAIL in settings.py

        # Render HTML template with context
        context = {
            "name": customer_query.name,
            "email": customer_query.email,
            "contact_no": customer_query.contact_no,
            "message": customer_query.message,
            "year": datetime.now().year,
        }
        html_content = render_to_string("emails/customer_query_email.html", context)
        plain_message = strip_tags(html_content)

        # Send email
        email = EmailMultiAlternatives(
            subject, plain_message, settings.EMAIL_HOST_USER, [admin_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()


class CustomerContactAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]
    """
    API to retrieve, update, or delete a specific customer query.
    """
    queryset = CustomerQuery.objects.all()
    serializer_class = CustomerQuerySerializer
