import datetime
import json
import random
import re
from decimal import Decimal

from asgiref.sync import sync_to_async
from django.conf import settings
from django.db import transaction
from django.db.models import Count, DecimalField, Min, OuterRef, Q, Subquery
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from account.permissions import AllowGetOnlyIsAdminStockManager, IsBakery
from dashboard.models import AdminConfiguration
from product.models import (
    Category,
    FavouriteItem,
    Inventory,
    Product,
    ProductImage,
    ProductMaterial,
    ProductSeo,
    ProductStatus,
    ProductVariant,
    SubCategory,
)
from product.serializers import (
    BulkCategorySerializer,
    BulkDuplicateSerializer,
    BulkProductMaterialSerializer,
    CategorySerializer,
    FavouriteItemSerializer,
    GetBarcodeSerializer,
    InventoryListSerializer,
    ProductImageSerializer,
    ProductMaterialSerializer,
    ProductSeoSerializer,
    ProductSerializer,
    SubCategorySerializer,
    UpdateQuantitySerializer,
    VariantInventorySerializer,
)
from product.utils import CustomPagination, update_feature_image


# Convert sync ORM query to async-compatible
async def get_admin_configuration():
    return await sync_to_async(AdminConfiguration.objects.all().last)()


class CategoryAPIView(APIView):
    """
    API view for managing product categories.

    Methods:
    - GET: List all categories or retrieve a specific category
        Filters:
        - status: publish/draft/trash/all
        - search: Search by name, slug, or description
        - sort: asc/desc
        - sort_by: created_at/name/status
    - POST: Create a new category or subcategory
    - PATCH: Update a specific category
    - DELETE: Delete a specific category

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    queryset = Category.objects.all().exclude(is_deleted=True)
    pagination_class = PageNumberPagination
    serializer_class = CategorySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowGetOnlyIsAdminStockManager]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_summary="Retrieve all categories and subcategories",
        responses={200: CategorySerializer(many=True)},
    )
    def get(self, request, pk=None, *args, **kwargs):
        search_query = request.query_params.get("search", None)
        status_filter = request.query_params.get("status", None)
        sort = request.query_params.get("sort", None)
        sort_by = request.query_params.get("sort_by", None)

        if pk is None:
            categories = Category.objects.all().order_by("-created_at")

            if search_query:
                sanitized_query = re.escape(search_query)
                categories = categories.filter(
                    Q(name__iregex=sanitized_query)
                    | Q(slug__iregex=sanitized_query)
                    | Q(description__iregex=sanitized_query)
                )

            valid_sort_fields = ["created_at", "name"]
            if sort_by in valid_sort_fields:
                sort_prefix = "-" if sort == "desc" else ""
                categories = categories.order_by(f"{sort_prefix}{sort_by}")
            if sort_by == "status":
                sort_prefix = "-" if sort == "desc" else ""
                categories = categories.order_by(f"{sort_prefix}is_active")

            if status_filter:
                if status_filter == "publish":
                    categories = categories.filter(is_active=True, is_deleted=False)
                elif status_filter == "draft":
                    categories = categories.filter(is_active=False, is_deleted=False)
                elif status_filter == "trash":
                    categories = categories.filter(is_deleted=True)
                elif status_filter == "all":
                    categories = categories.filter(is_deleted=False)
            else:
                categories = categories.filter(is_deleted=False)

            paginator = self.pagination_class()
            paginated_list = paginator.paginate_queryset(categories, request)
            serializer = CategorySerializer(paginated_list, many=True)
            return paginator.get_paginated_response(serializer.data)
        else:
            category = get_object_or_404(Category, pk=pk)
            serializer = CategorySerializer(category)
            return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=CategorySerializer)
    def post(self, request, *args, **kwargs):
        data = request.data
        parent_category = data.get("parent", None)

        if parent_category:
            try:
                parent_category_instance = Category.objects.get(id=parent_category)
            except Category.DoesNotExist:
                return Response(
                    {"detail": "Parent category does not exist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if SubCategory.objects.filter(
                name=data.get("name"), parent=parent_category_instance
            ).exists():
                return Response(
                    {
                        "detail": f"A subcategory with the name\
                            '{data.get('name')}' already exists under this category."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            subcategory_serializer = CategorySerializer(data=data)

            if subcategory_serializer.is_valid():
                subcategory_serializer.validated_data.pop("parent", None)
                subcategory = SubCategory.objects.create(
                    parent=parent_category_instance,
                    **subcategory_serializer.validated_data,
                )

                serializer = SubCategorySerializer(subcategory)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(
                subcategory_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        category_serializer = CategorySerializer(data=data)
        if category_serializer.is_valid():
            category_serializer.save()
            return Response(category_serializer.data, status=status.HTTP_201_CREATED)
        return Response(category_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Partially update a category or subcategory by ID",
        request_body=CategorySerializer,
        responses={200: CategorySerializer},
    )
    def patch(self, request, pk=None, *args, **kwargs):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Delete a category or subcategory by ID",
        responses={204: "No Content"},
    )
    def delete(self, request, pk=None, *args, **kwargs):
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductViewSet(APIView):
    """
    API view for managing products with comprehensive filtering and sorting.

    Methods:
    - GET: List all products with filters:
        - status: publish/draft/trash/all
        - search: Search by name, category, SKU, price
        - price_min/price_max: Filter by price range
        - order_quantity_min/max: Filter by order quantity
        - sort_by: price_asc/price_desc/total_quantity/created_at
        /min_order_quantity/status/popularity
    - POST: Create a new product with variants, images, and SEO details

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    authentication_classes = [JWTAuthentication]
    serializer_class = ProductSerializer
    permission_classes = [AllowGetOnlyIsAdminStockManager]
    pagination_class = CustomPagination
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @swagger_auto_schema(auto_schema=None)
    def get(self, request, *args, **kwargs):
        queryset = Product.objects.all().order_by("-created_at")
        product_status = request.query_params.get("status", None)
        product_availablity = request.query_params.get("availability", None)
        if product_status:
            if product_status == "draft":
                queryset = queryset.filter(is_active=False, is_deleted=False)
            elif product_status == "trash":
                queryset = queryset.filter(is_deleted=True)
            elif product_status == "publish":
                queryset = queryset.filter(is_deleted=False, is_active=True)
            elif product_status == "all":
                queryset = queryset.filter(is_deleted=False)
        else:
            queryset = queryset.filter(is_deleted=False)

        search_term = request.query_params.get("search", None)
        if search_term:
            queryset = queryset.filter(
                Q(name__icontains=search_term)
                | Q(category__name__contains=search_term)
                | Q(variants__inventory_items__sku__icontains=search_term)
                | Q(variants__inventory_items__regular_price__iregex=search_term)
                | Q(min_order_quantity__iregex=search_term)
                | Q(status__icontains=search_term)
            )

        price_min = request.query_params.get("price_min", None)
        price_max = request.query_params.get("price_max", None)

        if price_min and price_max:
            queryset = queryset.filter(
                variants__inventory_items__regular_price__gte=price_min,
                variants__inventory_items__regular_price__lte=price_max,
            )

        # Range filter for min_order_quantity
        min_order_quantity_min = request.query_params.get("order_quantity_min", None)
        min_order_quantity_max = request.query_params.get("order_quantity_max", None)
        if min_order_quantity_min and min_order_quantity_max:
            queryset = queryset.filter(
                min_order_quantity__gte=min_order_quantity_min,
                min_order_quantity__lte=min_order_quantity_max,
            )
        sort_by = request.query_params.get("sort_by", "created_at")
        sort_order = request.query_params.get("sort", "desc")
        if product_availablity:
            if product_availablity == "in_stock":
                queryset = queryset.filter(status=ProductStatus.AVAILABLE.value)
            else:
                queryset = queryset.filter(status=ProductStatus.OUT_OF_STOCK.value)

        if sort_by == "price_asc":
            lowest_price_subquery = (
                ProductVariant.objects.filter(
                    product=OuterRef("id"),
                    inventory_items__regular_price__isnull=False,
                )
                .annotate(min_price=Min("inventory_items__regular_price"))
                .values("min_price")[:1]
            )

            queryset = queryset.annotate(
                first_variant_price=Subquery(
                    lowest_price_subquery, output_field=DecimalField()
                )
            ).order_by("first_variant_price")

        elif sort_by == "price_desc":
            lowest_price_subquery = (
                ProductVariant.objects.filter(
                    product=OuterRef("id"), inventory_items__regular_price__isnull=False
                )
                .annotate(min_price=Min("inventory_items__regular_price"))
                .values("min_price")[:1]
            )

            queryset = queryset.annotate(
                first_variant_price=Subquery(
                    lowest_price_subquery, output_field=DecimalField()
                )
            ).order_by("-first_variant_price")

        elif sort_by == "total_quantity":
            queryset = queryset.annotate(
                first_variant_quantity=Min("variants__inventory_items__total_quantity")
            )
            if sort_order == "asc":
                queryset = queryset.order_by("first_variant_quantity")
            else:
                queryset = queryset.order_by("-first_variant_quantity")

        elif sort_by == "created_at":
            queryset = queryset.annotate(
                first_variant_created=Min("variants__inventory_items__created_at")
            )
            if sort_order == "asc":
                queryset = queryset.order_by("first_variant_created")
            else:
                queryset = queryset.order_by("-first_variant_created")

        elif sort_by == "min_order_quantity":
            if sort_order == "asc":
                queryset = queryset.order_by("min_order_quantity")
            else:
                queryset = queryset.order_by("-min_order_quantity")

        elif sort_by == "status":
            if sort_order == "asc":
                queryset = queryset.order_by("status")
            else:
                queryset = queryset.order_by("-status")

        if sort_by == "popularity":
            queryset = queryset.annotate(
                order_count=Count("variants__order_items")
            ).order_by("-order_count")

        paginator = self.pagination_class()
        paginated_list = paginator.paginate_queryset(queryset.distinct(), request)

        if paginated_list is not None:
            serializer = self.serializer_class(paginated_list, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(auto_schema=None)
    def post(self, request):
        data = request.data.copy()
        with transaction.atomic():
            product_data = data
            category_data = product_data.get("category", [])
            sub_category_data = product_data.get("sub_category", [])
            categories = []
            images_data = product_data.pop("images", [])
            feature_image = product_data.pop("feature_image", [])

            if isinstance(category_data, str):
                try:
                    category_data = json.loads(category_data)
                except json.JSONDecodeError:
                    raise ValidationError("Invalid format for 'category'.")
            if category_data:
                for category_id in category_data:
                    try:
                        if category_id:
                            category = Category.objects.get(id=int(category_id))
                            categories.append(category)
                    except (ValueError, Category.DoesNotExist) as e:
                        raise ValidationError(f"Invalid category ID: {e}")

            sub_categories = []
            if isinstance(sub_category_data, str):
                try:
                    sub_category_data = json.loads(sub_category_data)
                except json.JSONDecodeError:
                    raise ValidationError("Invalid format for 'sub_category'.")
            if sub_category_data:
                for sub_category_id in sub_category_data:
                    try:
                        sub_category = SubCategory.objects.get(id=int(sub_category_id))
                        sub_categories.append(sub_category)
                    except (ValueError, SubCategory.DoesNotExist) as e:
                        raise ValidationError(f"Invalid sub-category ID: {e}")
            product_name = product_data.get("name")
            if product_name is None:
                raise ValidationError({"name": "Name cannot be empty"})
            if Product.objects.filter(name=product_name).first():
                raise ValidationError(
                    {"name": "Product with this name already existed.!"}
                )
            product = Product.objects.create(
                name=product_name,
                description=product_data.get("description", ""),
            )
            product.category.set(categories)
            product.sub_category.set(sub_categories)

            product_tag = product_data.get("product_tag", [])
            if isinstance(product_tag, str):
                try:
                    product_tag = json.loads(product_tag)
                except json.JSONDecodeError:
                    raise ValidationError(
                        "Invalid format for 'product_tag'. Must be a list."
                    )
            product.product_tag = product_tag
            product.save()

            product_detail = product_data.get("product_detail", {})
            if isinstance(product_detail, str):
                try:
                    product_detail = json.loads(product_detail)
                except json.JSONDecodeError:
                    raise ValidationError("Invalid format for 'product_detail'.")
            inventory_data = product_detail.get("inventory", {})
            product_sku = inventory_data.get("sku")

            variant = ProductVariant.objects.create(
                product=product,
                description=product_data.get("description", ""),
            )
            variant.save()
            advanced_detail = product_detail.get("advanced", {})
            product.purchase_note = advanced_detail.get("purchase_note")
            product.min_order_quantity = advanced_detail.get("min_order_quantity")
            product.save()
            if product_sku:
                if Inventory.objects.filter(sku=product_sku).first():
                    raise ValidationError({"sku": "Product SKU already existed"})

            def parse_date(date_str):
                if date_str:  # Check if date is not empty
                    try:
                        return datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
                    except ValueError:
                        return None  # Return None if parsing fails
                return None

            inventory = Inventory.objects.create(
                product_variant=variant,
                sku=product_sku,
                regular_price=inventory_data["regular_price"],
                sale_price=inventory_data.get("sale_price", None),
                sale_price_dates_from=parse_date(
                    inventory_data.get("sale_price_dates_from", "")
                ),
                sale_price_dates_to=parse_date(
                    inventory_data.get("sale_price_dates_to", "")
                ),
                weight=inventory_data["weight"],
                unit=inventory_data["unit"],
                bulking_price_rules=inventory_data.get("bulking_price_rules", []),
            )
            print(f"Generated barcode: {inventory.barcode}")
            variants = product_detail.get("variants", [])
            for variant_data in variants:
                # Extract necessary fields
                sku = variant_data.get("sku", "").strip()
                regular_price = variant_data.get("regular_price", "").strip()
                sale_price = variant_data.get("sale_price", "").strip()
                sale_price_dates_from = variant_data.get(
                    "sale_price_dates_from", ""
                ).strip()
                sale_price_dates_to = variant_data.get(
                    "sale_price_dates_to", ""
                ).strip()
                quantity = variant_data.get("quantity", 0)
                weight = variant_data.get("weight", "").strip()
                enabled = variant_data.get("enabled", False)
                managed_stock = variant_data.get("managed_stock", False)
                description = variant_data.get("description", "").strip()

                # ✅ Skip if all values are empty, zero, or False
                if not (
                    sku
                    or regular_price
                    or sale_price
                    or sale_price_dates_from
                    or sale_price_dates_to
                    or quantity > 0
                    or weight
                    or enabled
                    or managed_stock
                    or description
                ):
                    continue
                # ✅ Create variant only if valid
                variant = ProductVariant.objects.create(
                    product=product,
                    enabled=enabled,
                    managed_stock=managed_stock,
                    allow_backorders=variant_data.get("allow_backorders", "Allow"),
                    description=description,
                )

                # ✅ Check if SKU exists in Inventory
                if sku and Inventory.objects.filter(sku=sku).exists():
                    raise ValidationError({"sku": "Product Variant SKU already exists"})

                # ✅ Create Inventory only if variant is valid
                Inventory.objects.create(
                    product_variant=variant,
                    sku=sku if sku else None,  # Handle empty SKU
                    regular_price=Decimal(regular_price) if regular_price else None,
                    sale_price=Decimal(sale_price) if sale_price else None,
                    sale_price_dates_from=(
                        sale_price_dates_from if sale_price_dates_from else None
                    ),
                    sale_price_dates_to=(
                        sale_price_dates_to if sale_price_dates_to else None
                    ),
                    weight=Decimal(weight) if weight else None,
                    unit=variant_data.get("unit"),
                    total_quantity=quantity,
                    bulking_price_rules=inventory_data.get("bulking_price_rules", [{}]),
                )

            product_seo_data = product_data.get("product_seo", {})
            if isinstance(product_seo_data, str):
                try:
                    product_seo_data = json.loads(product_seo_data)
                except json.JSONDecodeError:
                    raise ValidationError("Invalid format for 'product_seo'.")

            if ProductSeo.objects.filter(
                seo_title=product_seo_data.get("seo_title")
            ).exists():
                raise ValidationError(
                    "The Seo Title  already exists. Please provide a unique value."
                )
            try:
                ProductSeo.objects.create(
                    product=product,
                    focused_keyword=product_seo_data.get("focused_keyword"),
                    seo_title=product_seo_data.get("seo_title"),
                    slug=product_seo_data.get("slug"),
                    preview_as=product_seo_data.get("preview_as"),
                    meta_description=product_seo_data.get("meta_description"),
                )
            except Exception:
                raise ValidationError(
                    "Seo Meta description should be of 250 characters"
                )
            if images_data:
                for image_data in images_data:
                    ProductImage.objects.create(
                        product=product, image=image_data, is_featured=False
                    )

            if feature_image:
                if isinstance(feature_image, list):
                    feature_image = feature_image[0]
                if hasattr(feature_image, "name"):
                    ProductImage.objects.create(
                        product=product, image=feature_image, is_featured=True
                    )
                else:
                    raise ValidationError(
                        {
                            "feature_image": "Invalid feature_image.\
                                Expected a file-like object."
                        }
                    )

            variants = list(
                ProductVariant.objects.filter(product=product)
                .order_by("created_at")
                .values_list("id", flat=True)
            )
            return Response(
                {
                    "message": "Product created successfully!",
                    "product_id": product.id,
                    "variants": variants,
                },
                status=status.HTTP_201_CREATED,
            )


class ProductAPIView(APIView):
    """
    API view for managing individual products.

    Methods:
    - GET: Retrieve a specific product's details
    - PATCH: Update a specific product's details including variants and images
    - DELETE: Delete/trash a specific product

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    authentication_classes = [JWTAuthentication]
    serializer_class = ProductSerializer
    permission_classes = [AllowGetOnlyIsAdminStockManager]
    pagination_class = PageNumberPagination
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk=None):
        data = request.data.copy()
        try:
            with transaction.atomic():
                product = Product.objects.get(pk=pk)
                product_data = data
                category_data = product_data.get("category", [])
                sub_category_data = product_data.get("sub_category", [])
                categories = []
                images_data = product_data.pop("images", [])
                feature_image = product_data.pop("feature_image", [])

                def to_bool(value):
                    if isinstance(value, bool):
                        return value
                    if isinstance(value, str):
                        return value.lower() in [
                            "true",
                            "1",
                            "yes",
                        ]
                    return False

                is_active = to_bool(product_data.get("is_active", product.is_active))
                is_deleted = to_bool(product_data.get("is_deleted", product.is_deleted))
                hot_deal = to_bool(product_data.get("hot_deal", product.hot_deal))

                product.is_active = is_active
                product.is_deleted = is_deleted
                product.hot_deal = hot_deal
                if isinstance(category_data, str):
                    try:
                        category_data = json.loads(category_data)
                    except json.JSONDecodeError:
                        raise ValidationError("Invalid format for 'category'.")
                if category_data:
                    for category_id in category_data:
                        try:
                            category = Category.objects.get(id=int(category_id))
                            categories.append(category)
                        except (ValueError, Category.DoesNotExist) as e:
                            raise ValidationError(f"Invalid category ID: {e}")

                sub_categories = []
                if isinstance(sub_category_data, str):
                    try:
                        sub_category_data = json.loads(sub_category_data)
                    except json.JSONDecodeError:
                        raise ValidationError("Invalid format for 'sub_category'.")

                if sub_category_data:
                    for sub_category_id in sub_category_data:
                        try:
                            sub_category = SubCategory.objects.get(
                                id=int(sub_category_id)
                            )
                            sub_categories.append(sub_category)
                        except (ValueError, SubCategory.DoesNotExist) as e:
                            raise ValidationError(f"Invalid sub-category ID: {e}")

                new_name = product_data.get("name", product.name)
                if (
                    Product.objects.filter(name=new_name)
                    .exclude(id=product.id)
                    .exists()
                ):
                    return Response(
                        {"error": f"Product with name '{new_name}' already exists."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                product.description = product_data.get(
                    "description", product.description
                )

                product.category.set(categories)
                product.sub_category.set(sub_categories)
                product_tag = product_data.get("product_tag", product.product_tag)
                if isinstance(product_tag, str):
                    try:
                        product_tag = json.loads(product_tag)
                    except json.JSONDecodeError:
                        return Response(
                            {"error": "Invalid format for 'product_tag'."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                if not isinstance(product_tag, list):
                    return Response(
                        {"error": "'product_tag' must be a list."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                product.product_tag = product_tag
                product_detail = product_data.get(
                    "product_detail", product.product_detail
                )
                if product_detail:
                    if isinstance(product_detail, str):
                        try:
                            product_detail = json.loads(product_detail)
                        except json.JSONDecodeError:
                            return Response(
                                {"error": "Invalid format for 'product_detail'."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                inventory_data = product_detail.get(
                    "inventory", product.get_inventory_data()
                )

                variant = product.variants.first()

                variant.description = product_data.get(
                    "description", product.get_variants_data()
                )
                variant.save()

                advanced_detail = product_detail.get("advanced", [])
                if advanced_detail:
                    product.purchase_note = advanced_detail.get(
                        "purchase_note", product.purchase_note
                    )
                    product.min_order_quantity = advanced_detail.get(
                        "min_order_quantity", product.min_order_quantity
                    )
                product.save()

                def parse_date(date_str):
                    if date_str:  # Check if date is not empty
                        try:
                            return datetime.datetime.strptime(
                                date_str, "%Y-%m-%d"
                            ).date()
                        except ValueError:
                            return None  # Return None if parsing fails
                    return None

                Inventory.objects.update_or_create(
                    product_variant=variant,
                    defaults={
                        "regular_price": inventory_data["regular_price"],
                        "sale_price": inventory_data.get("sale_price", None),
                        "sale_price_dates_from": parse_date(
                            inventory_data.get("sale_price_dates_from", "")
                        ),
                        "sale_price_dates_to": parse_date(
                            inventory_data.get("sale_price_dates_to", "")
                        ),
                        "weight": inventory_data["weight"],
                        "unit": inventory_data["unit"],
                        "bulking_price_rules": inventory_data.get(
                            "bulking_price_rules", []
                        ),
                    },
                )

                product_seo_data = product_data.get("product_seo", {})

                if product_seo_data:
                    if isinstance(product_seo_data, str):
                        try:
                            product_seo_data = json.loads(product_seo_data)
                        except json.JSONDecodeError:
                            return Response(
                                {"error": "Invalid format for 'product_seo_data'."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                    ProductSeo.objects.update_or_create(
                        product=product,
                        defaults={
                            "focused_keyword": product_seo_data.get("focused_keyword"),
                            "slug": product_seo_data.get("slug"),
                            "preview_as": product_seo_data.get("preview_as"),
                            "meta_description": product_seo_data.get(
                                "meta_description"
                            ),
                        },
                    )

                if images_data:
                    for image_data in images_data:
                        ProductImage.objects.create(
                            product=product, image=image_data, is_featured=False
                        )

                if feature_image:
                    if isinstance(feature_image, list):
                        feature_image = feature_image[0]

                    if hasattr(feature_image, "name"):
                        update_feature_image(product.id, feature_image)
                    else:
                        Response(
                            {"feature_image": "Invalid feature_image"},
                            status=status.HTTP_200_OK,
                        )
                return Response(
                    {
                        "message": "Product updated successfully!",
                        "product_id": product.id,
                    },
                    status=status.HTTP_200_OK,
                )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk)
            product.delete()
            return Response(
                {"message": "Product deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )

        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ProductImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product images.

    Methods:
    - GET: List all product images
    - POST: Upload new product image
    - PATCH: Update existing image
    - DELETE: Remove image

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    queryset = ProductImage.objects.all().exclude(product__is_deleted=True)
    serializer_class = ProductImageSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowGetOnlyIsAdminStockManager]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        operation_summary="Create a new product image",
        request_body=ProductImageSerializer,
        responses={201: ProductImageSerializer},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class ProductVariantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product variants.

    Methods:
    - GET: List all variants with filters:
        - search: Search by product name
        - sort_by: asc/desc for created_at
    - POST: Create new variant
    - PATCH: Update variant
    - DELETE: Remove variant

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    queryset = ProductVariant.objects.all().exclude(product__is_deleted=True)
    serializer_class = VariantInventorySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowGetOnlyIsAdminStockManager]

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.order_by("-created_at")
        search = self.request.query_params.get("search", None)
        sort_by = self.request.query_params.get("sort_by", "asc")
        if search:
            queryset = queryset.filter(product__name__icontains=search)
        if sort_by:
            if sort_by == "asc":
                queryset = queryset.order_by("-created_at")
            else:
                queryset = queryset.order_by("created_at")
        return queryset


class SubCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product subcategories.

    Methods:
    - GET: List all subcategories with filters:
        - status: publish/draft/trash/all
        - search: Search by name, slug, description
        - sort_by: asc/desc
    - POST: Create a new subcategory
    - PATCH: Update a subcategory
    - DELETE: Delete/trash a subcategory

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    queryset = SubCategory.objects.all().exclude(is_deleted=True)
    serializer_class = SubCategorySerializer
    permission_classes = [AllowGetOnlyIsAdminStockManager]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        """
        Filter the queryset based on the status query parameter.
        """
        queryset = super().get_queryset()

        # Status filter
        status_filter = self.request.query_params.get("status")
        search_query = self.request.query_params.get("search")
        sort_by = self.request.query_params.get("sort_by", "asc")

        if search_query:
            queryset = queryset.filter(
                Q(name__iregex=search_query)
                | Q(slug__iregex=search_query)
                | Q(description__iregex=search_query)
            )

        if status_filter:
            if status_filter == "publish":
                queryset = queryset.filter(is_active=True, is_deleted=False)
            elif status_filter == "draft":
                queryset = queryset.filter(is_active=False, is_deleted=False)
            elif status_filter == "trash":
                queryset = queryset.filter(is_deleted=True)
            elif status_filter == "all":
                queryset = queryset.filter(is_deleted=False)
        else:
            queryset = queryset.filter(is_deleted=False)

        if sort_by:
            if sort_by == "asc":
                queryset = queryset.order_by("-created_at")
            else:
                queryset = queryset.order_by("created_at")

        return queryset

    def perform_create(self, serializer):
        parent = serializer.validated_data.get("parent", None)

        if parent:
            try:
                Category.objects.get(id=parent.id)
            except Category.DoesNotExist:
                raise ValidationError(
                    {"error": "The provided parent category does not exist."}
                )
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


class ProductSeoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing product SEO information.

    Methods:
    - GET: List all product SEO entries
    - POST: Create new SEO entry
    - PATCH: Update SEO information
    - DELETE: Remove SEO entry

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    queryset = ProductSeo.objects.all()
    serializer_class = ProductSeoSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowGetOnlyIsAdminStockManager]


class ProductMaterialViewset(viewsets.ModelViewSet):
    """
    ViewSet for managing product materials.

    Methods:
    - GET: List all materials with filters:
        - status: publish/draft/trash/all
        - search: Search by name, cost, description, expiry date
        - sort_by: created_at/name/expiry_date/cost/description/quantity
        - sort: asc/desc
    - POST: Create a new material
    - PATCH: Update a material
    - DELETE: Delete/trash a material

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    queryset = ProductMaterial.objects.all()
    serializer_class = ProductMaterialSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowGetOnlyIsAdminStockManager]
    pagination_class = PageNumberPagination

    def get_object(self):
        """
        Fetch object directly from the database to include deleted records.
        """
        return ProductMaterial.objects.get(
            pk=self.kwargs["pk"]
        )  # ✅ Fetch from all records, ignoring `get_queryset()`

    def get_queryset(self):
        """
        Optionally filters the queryset by status and search.
        """
        queryset = super().get_queryset()
        queryset = queryset.order_by("-created_at")
        # Status filter
        search_term = self.request.query_params.get("search", None)
        sort_by = self.request.query_params.get("sort_by", "created_at")
        sort_order = self.request.query_params.get("sort", "desc")
        if search_term:
            queryset = queryset.filter(
                Q(name__iregex=search_term)
                | Q(cost__iregex=search_term)
                | Q(description__iregex=search_term)
                | Q(expiry_date__iregex=search_term)
            )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            if status_filter == "publish":
                queryset = queryset.filter(is_active=True, is_deleted=False)
            elif status_filter == "draft":
                queryset = queryset.filter(is_active=False, is_deleted=False)
            elif status_filter == "trash":
                queryset = queryset.filter(is_deleted=True)
            elif status_filter == "all":
                queryset = queryset.filter(is_deleted=False)
        else:
            queryset = queryset.filter(is_deleted=False)

        valid_sort_fields = [
            "created_at",
            "name",
            "expiry_date",
            "cost",
            "description",
            "quantity",
        ]
        if sort_by not in valid_sort_fields:
            sort_by = "created_at"

        if sort_order == "asc":
            queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by(f"-{sort_by}")

        return queryset

    def perform_create(self, serializer):
        """
        Set updated_by to the logged-in user when creating a ProductMaterial.
        """
        serializer.save(updated_by=self.request.user)

    def perform_update(self, serializer):
        """
        Set updated_by to the logged-in user when updating a ProductMaterial.
        """
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Hard delete the ProductMaterial instance by ID.
        """
        instance = self.get_object()
        instance.delete()  # 🚀 Permanently deletes the record
        return Response(
            {"message": "Product material permanently deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )


class ProductAndMaterialListView(APIView):
    """
    API view for listing products and materials inventory.

    Methods:
    - GET: List all inventory items with filters:
        - search: Search by product name, SKU, price, unit, weight, quantity
        - status: available/out_of_stock
        - sort_by: sku/regular_price/sale_price/weight/unit/total_quantity/barcode

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request, *args, **kwargs):
        inventory_items = Inventory.objects.select_related("product_variant")
        configuration = AdminConfiguration.objects.all().last()
        # Apply filters based on query parameters
        search_query = request.query_params.get("search", None)
        status = request.query_params.get("status", None)
        sort_by = request.query_params.get("sort_by", "asc")

        # Filter by variant name
        if search_query:
            inventory_items = inventory_items.filter(
                Q(product_variant__product__name__icontains=search_query)
                | Q(sku__icontains=search_query)
                | Q(regular_price__icontains=search_query)
                | Q(unit__icontains=search_query)
                | Q(weight__icontains=search_query)
                | Q(total_quantity__icontains=search_query)
            )

        # Filter by status (enabled/disabled)
        if status:
            if status == "available":

                inventory_items = inventory_items.filter(
                    total_quantity__gte=(
                        configuration.out_of_stock
                        if configuration
                        else settings.LOW_STOCK_THRESHOLD
                    )
                )
            elif status == "out_of_stock":
                inventory_items = inventory_items.filter(
                    total_quantity__lte=(
                        configuration.out_of_stock
                        if configuration
                        else settings.LOW_STOCK_THRESHOLD
                    )
                )

        # Order results by creation date
        if sort_by:
            if sort_by == "sku":
                inventory_items = inventory_items.order_by("sku")
            elif sort_by == "-sku":
                inventory_items = inventory_items.order_by("-sku")
            elif sort_by == "regular_price":
                inventory_items = inventory_items.order_by("regular_price")
            elif sort_by == "-regular_price":
                inventory_items = inventory_items.order_by("-regular_price")
            elif sort_by == "sale_price":
                inventory_items = inventory_items.order_by("sale_price")
            elif sort_by == "-sale_price":
                inventory_items = inventory_items.order_by("-sale_price")
            elif sort_by == "sale_price_dates_from":
                inventory_items = inventory_items.order_by("sale_price_dates_from")
            elif sort_by == "-sale_price_dates_from":
                inventory_items = inventory_items.order_by("-sale_price_dates_from")
            elif sort_by == "sale_price_dates_to":
                inventory_items = inventory_items.order_by("sale_price_dates_to")
            elif sort_by == "-sale_price_dates_to":
                inventory_items = inventory_items.order_by("-sale_price_dates_to")
            elif sort_by == "weight":
                inventory_items = inventory_items.order_by("weight")
            elif sort_by == "-weight":
                inventory_items = inventory_items.order_by("-weight")
            elif sort_by == "unit":
                inventory_items = inventory_items.order_by("unit")
            elif sort_by == "-unit":
                inventory_items = inventory_items.order_by("-unit")
            elif sort_by == "total_quantity":
                inventory_items = inventory_items.order_by("total_quantity")
            elif sort_by == "-total_quantity":
                inventory_items = inventory_items.order_by("-total_quantity")
            elif sort_by == "barcode":
                inventory_items = inventory_items.order_by("unique_code")
            elif sort_by == "-barcode":
                inventory_items = inventory_items.order_by("-unique_code")
            elif sort_by == "asc":
                inventory_items = inventory_items.order_by("-created_at")
            elif sort_by == "desc":
                inventory_items = inventory_items.order_by("created_at")

        paginator = self.pagination_class()
        paginated_list = paginator.paginate_queryset(inventory_items, request)
        serializer = InventoryListSerializer(paginated_list, many=True)
        return paginator.get_paginated_response(serializer.data)


class UpdateQuantityAPIView(APIView):
    """
    API view for updating product quantities.

    Methods:
    - PUT: Update product quantity
        Required fields:
        - sku: Product SKU
        - quantity: Amount to add
        Optional fields:
        - start_from: Starting series number
        - end_from: Ending series number

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def put(self, request):
        serializer = UpdateQuantitySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": "Invalid data.", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        items = serializer.validated_data.get("sku")
        quantity_to_add = serializer.validated_data.get("quantity", 0)

        start_from = serializer.validated_data.get("start_from", None)
        end_from = serializer.validated_data.get("end_from", None)

        if quantity_to_add < 0:
            return Response(
                {"error": "Quantity must be a positive number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            cleaned_items = items.strip()
            variant = Inventory.objects.filter(sku__icontains=cleaned_items).first()

            variant.add_stock(quantity_to_add)

            if start_from is None:
                variant.start_series = 1
            else:
                variant.start_series += variant.end_series

            if end_from is None:
                variant.end_series = variant.total_quantity - 1
            else:
                variant.end_series += quantity_to_add

            variant.save()

            return Response(
                {
                    "id": variant.id,
                    "name": variant.product_variant.variant_name,
                    "sku": variant.sku,
                    "quantity": variant.total_quantity,
                    "start_series": variant.start_series,
                    "end_series": variant.end_series,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            print(str(e))
            return Response(
                {"error": "Product variant not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class BulkProductUpdateDeleteAPIView(APIView):
    """
    API view for bulk operations on products.

    Methods:
    - POST: Bulk duplicate products
        - Creates copies with unique names and SKUs
        - Duplicates all associated data (variants, images, SEO)
    - PATCH: Bulk update product statuses
        - Can set multiple products to draft/publish
    - DELETE: Bulk delete/trash products
        - Can move multiple products to trash or restore

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(
        request_body=BulkDuplicateSerializer,
        responses={201: BulkDuplicateSerializer},
    )
    def post(self, request, *args, **kwargs):
        serializer = BulkDuplicateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_ids = serializer.validated_data.get("products", [])

        if not product_ids:
            return Response(
                {"error": "Product IDs are required to duplicate the products."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if isinstance(product_ids, str):
            try:
                product_ids = json.loads(product_ids)
            except json.JSONDecodeError:
                return Response(
                    {
                        "error": "Invalid format for 'product_ids'.\
                        Must be a list of integers."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not isinstance(product_ids, list) or not all(
            isinstance(pid, int) for pid in product_ids
        ):
            return Response(
                {
                    "error": "Invalid format for 'product_ids'.\
                        Must be a list of integers."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            duplicates = []  # ✅ Collect all duplicated products here

            for product_id in product_ids:
                try:
                    original_product = Product.objects.get(id=product_id)

                    # Start the counter from 1
                    duplicated_product_count = (
                        Product.objects.filter(
                            name__startswith=f"{original_product.name} (Copy)"
                        ).count()
                        + 1
                    )

                    duplicated_product_name = (
                        f"{original_product.name} (Copy {duplicated_product_count})"
                    )

                    # Ensure unique name
                    while Product.objects.filter(name=duplicated_product_name).exists():
                        duplicated_product_count += 1
                        duplicated_product_name = (
                            f"{original_product.name} (Copy {duplicated_product_count})"
                        )

                    duplicated_product = Product.objects.create(
                        name=duplicated_product_name,
                        description=original_product.description,
                        purchase_note=original_product.purchase_note,
                        min_order_quantity=original_product.min_order_quantity,
                    )

                    duplicated_product.category.set(original_product.category.all())
                    duplicated_product.sub_category.set(
                        original_product.sub_category.all()
                    )
                    duplicated_product.product_tag = original_product.product_tag
                    duplicated_product.save()

                    # ✅ Duplicate SEO Information
                    if hasattr(original_product, "product_seo"):
                        original_seo = original_product.product_seo

                        # Generate base SEO title
                        base_seo_title = original_seo.seo_title
                        seo_title = base_seo_title
                        counter = 1

                        # Ensure the new SEO title is unique
                        while ProductSeo.objects.filter(seo_title=seo_title).exists():
                            seo_title = f"{base_seo_title}-{counter}"
                            counter += 1

                        ProductSeo.objects.create(
                            product=duplicated_product,
                            focused_keyword=original_seo.focused_keyword,
                            seo_title=seo_title,  # ✅ Unique SEO title
                            slug=f"{duplicated_product.name.replace(' ', '-')}-seo",
                            preview_as=original_seo.preview_as,
                            meta_description=original_seo.meta_description,
                        )

                    # ✅ Duplicate Product Images
                    for image in original_product.images.all():
                        ProductImage.objects.create(
                            product=duplicated_product,
                            image=image.image,
                            is_featured=image.is_featured,
                        )

                    # ✅ Duplicate Variants and Inventory
                    for original_variant in original_product.variants.all():
                        duplicated_variant = ProductVariant.objects.create(
                            product=duplicated_product,
                            description=original_variant.description,
                            enabled=original_variant.enabled,
                            managed_stock=original_variant.managed_stock,
                            allow_backorders=original_variant.allow_backorders,
                        )

                        original_inventory = original_variant.inventory_items
                        if original_inventory:
                            Inventory.objects.create(
                                product_variant=duplicated_variant,
                                sku=(
                                    f"{duplicated_product_count}-\
                                        sku-{original_inventory.sku}"
                                ),
                                regular_price=original_inventory.regular_price,
                                sale_price=original_inventory.sale_price,
                                sale_price_dates_from=(
                                    original_inventory.sale_price_dates_from
                                ),
                                sale_price_dates_to=(
                                    original_inventory.sale_price_dates_to
                                ),
                                weight=original_inventory.weight,
                                unit=original_inventory.unit,
                                total_quantity=original_inventory.total_quantity,
                                bulking_price_rules=(
                                    original_inventory.bulking_price_rules
                                ),
                            )

                    # ✅ Store duplicated product info
                    duplicates.append(
                        {
                            "id": duplicated_product.id,
                            "name": duplicated_product.name,
                        }
                    )

                except Product.DoesNotExist:
                    return Response(
                        {"error": f"Product with ID {product_id} does not exist."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        # ✅ Response should be outside the loop
        return Response(
            {
                "message": "Products duplicated successfully!",
                "duplicated_products": duplicates,
            },
            status=status.HTTP_201_CREATED,
        )

    @swagger_auto_schema(
        request_body=BulkDuplicateSerializer,
        responses={201: BulkDuplicateSerializer},
    )
    def patch(self, request):
        serializer = BulkDuplicateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_status = serializer.validated_data.get("status", None)
        product_ids = serializer.validated_data.get("products", [])

        updated_ids = []
        if product_ids:
            products = Product.objects.filter(id__in=product_ids)
            if not products:
                return Response(
                    {"error": "Product id not found"}, status=status.HTTP_404_NOT_FOUND
                )
            for product in products:
                if product_status == "draft":
                    product.is_active = False
                    product.is_deleted = False
                    updated_ids.append(product)

                elif product_status == "publish":
                    product.is_active = True
                    product.is_deleted = False

                    updated_ids.append(product)

            if updated_ids:
                Product.objects.bulk_update(updated_ids, ["is_deleted", "is_active"])
                return Response(
                    {"message": "Product Updated Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"message": "Product does not existed."},
                    status=status.HTTP_200_OK,
                )
        else:
            return Response(
                {"error": "Product does not existed."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @swagger_auto_schema(
        request_body=BulkDuplicateSerializer,
        responses={201: BulkDuplicateSerializer},
    )
    def delete(self, request):

        serializer = BulkDuplicateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_ids = serializer.validated_data.get("products", [])
        product_status = serializer.validated_data.get("status", None)
        deleted_ids = []
        if product_ids:
            products = Product.objects.filter(id__in=product_ids)
            if not products:
                return Response(
                    {"error": "Product id not found"}, status=status.HTTP_404_NOT_FOUND
                )
            for product in products:
                if product_status == "delete":
                    product.is_deleted = True
                    product.is_active = False

                    deleted_ids.append(product)
                elif product_status == "publish":
                    product.is_deleted = False
                    product.is_active = True
                    deleted_ids.append(product)

            if deleted_ids:
                Product.objects.bulk_update(deleted_ids, ["is_deleted", "is_active"])
                return Response(
                    {"message": "Product Deleted Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Product I'D does not existed."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"error": "Product does not existed"},
                status=status.HTTP_404_NOT_FOUND,
            )


class FavouriteItemAPIView(APIView):

    permission_classes = [IsBakery]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    @swagger_auto_schema(request_body=FavouriteItemSerializer)
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication is required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = request.user
        product_id = request.data.get("product")
        if not product_id:
            return Response(
                {"error": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = FavouriteItemSerializer(
            data={"product": product.id, "user": user.id}
        )
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication is required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if pk:
            favourite_item = FavouriteItem.objects.get(id=pk, user=request.user)
            if favourite_item is None:
                return Response(
                    {"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND
                )
            serializer = FavouriteItemSerializer(favourite_item)

        else:
            favourite_item = FavouriteItem.objects.filter(user=request.user)
            paginator = self.pagination_class()
            paginated_list = paginator.paginate_queryset(favourite_item, request)
            serializer = FavouriteItemSerializer(paginated_list, many=True)
            return paginator.get_paginated_response(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication is required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        product_id = request.data.get("product")
        if not product_id:
            return Response(
                {"error": "Product ID is required in the payload."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item_id = FavouriteItem.objects.get(
                product__id=product_id, user=request.user
            )
        except FavouriteItem.DoesNotExist:
            return Response(
                {"error": "Favourite item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        item_id.delete()
        return Response(
            {"message": "Item deleted successfully."}, status=status.HTTP_204_NO_CONTENT
        )


class BulkCategoryUpdateDeleteAPIView(APIView):

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(
        request_body=BulkCategorySerializer,
        responses={201: BulkCategorySerializer},
    )
    def post(self, request):
        serializer = BulkCategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category_ids = serializer.validated_data.get("categories", [])
        sub_category_ids = serializer.validated_data.get("sub_categories", [])

        if not isinstance(category_ids, list) or not isinstance(sub_category_ids, list):
            return Response(
                {"error": "Invalid input format. Expected lists of IDs."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_categories = []
        new_subcategories = []

        try:
            with transaction.atomic():
                # Duplicate Categories and their Subcategories
                for category_id in category_ids:
                    try:
                        existing_category = Category.objects.get(id=category_id)
                    except Category.DoesNotExist:
                        return Response(
                            {
                                "error": f"Category with ID {category_id} \
                                    does not exist."
                            },
                            status=status.HTTP_404_NOT_FOUND,
                        )

                    # Duplicate the category
                    new_category = existing_category.copy()
                    new_category.save()  # Save the new category

                    # Duplicate associated subcategories
                    subcategories = SubCategory.objects.filter(parent=existing_category)
                    for subcategory in subcategories:
                        new_subcategory = subcategory.copy()
                        new_subcategory.parent = (
                            new_category  # Assign saved category as parent
                        )
                        new_subcategory.save()  # Save the new subcategory
                        new_subcategories.append(new_subcategory)

                    new_categories.append(new_category)

                # Duplicate Individual Subcategories
                for sub_category_id in sub_category_ids:
                    try:
                        existing_subcategory = SubCategory.objects.get(
                            id=sub_category_id
                        )
                    except SubCategory.DoesNotExist:
                        return Response(
                            {
                                "error": f"SubCategory with ID {sub_category_id} \
                                    does not exist."
                            },
                            status=status.HTTP_404_NOT_FOUND,
                        )

                    # Skip duplication if parent category is being duplicated
                    if (
                        existing_subcategory.parent
                        and existing_subcategory.parent.id in category_ids
                    ):
                        continue

                    # Duplicate the subcategory
                    new_subcategory = existing_subcategory.copy()
                    new_subcategory.save()  # Save the new subcategory
                    new_subcategories.append(new_subcategory)

            # Serialize the new categories and subcategories
            category_serializer = CategorySerializer(new_categories, many=True)
            subcategory_serializer = SubCategorySerializer(new_subcategories, many=True)

            return Response(
                {
                    "categories": category_serializer.data,
                    "sub_categories": subcategory_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": f"An error occurred during duplication: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @swagger_auto_schema(
        request_body=BulkCategorySerializer,
        responses={200: BulkCategorySerializer},
    )
    def patch(self, request):
        serializer = BulkCategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_status = serializer.validated_data.get("status", None)
        category_ids = serializer.validated_data.get("categories", [])
        sub_category_ids = serializer.validated_data.get("sub_categories", [])

        updated_ids = []
        sub_updated_ids = []

        if category_ids:
            categories = Category.objects.filter(id__in=category_ids)
            if not categories:
                return Response(
                    {"error": "Product id not found"}, status=status.HTTP_404_NOT_FOUND
                )
            for category in categories:
                if product_status == "draft":
                    category.is_active = False
                    updated_ids.append(category)

                elif product_status == "publish":
                    category.is_active = True
                    category.is_deleted = False
                    updated_ids.append(category)

            if updated_ids:
                Category.objects.bulk_update(updated_ids, ["is_deleted", "is_active"])
                return Response(
                    {"message": "Category Updated Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                error_message = "Category does not existed."

        if sub_category_ids:
            categories = SubCategory.objects.filter(id__in=sub_category_ids)
            if not categories:
                return Response(
                    {"error": "SubCategory id not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            for category in categories:
                if product_status == "draft":
                    category.is_active = False
                    sub_updated_ids.append(category)

                elif product_status == "publish":
                    category.is_active = True
                    category.is_deleted = False
                    sub_updated_ids.append(category)

            if sub_updated_ids:
                SubCategory.objects.bulk_update(sub_updated_ids, ["is_active"])
                return Response(
                    {"message": "Category Updated Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                error_message = "Category does not existed."

        return Response(
            {"error": error_message},
            status=status.HTTP_404_NOT_FOUND,
        )

    @swagger_auto_schema(request_body=BulkCategorySerializer)
    def delete(self, request):

        serializer = BulkCategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        category_ids = serializer.validated_data.get("categories", [])
        sub_category_ids = serializer.validated_data.get("sub_categories", [])

        product_status = serializer.validated_data.get("status", None)
        deleted_ids = []
        if category_ids:
            categories = Category.objects.filter(id__in=category_ids)
            if not categories:
                return Response(
                    {"error": "Product id not found"}, status=status.HTTP_404_NOT_FOUND
                )
            for category in categories:
                if product_status == "delete":
                    category.is_deleted = True
                    category.is_active = False
                    deleted_ids.append(category)
                elif product_status == "publish":
                    category.is_deleted = False
                    category.is_active = True
                    deleted_ids.append(category)

            if deleted_ids:
                Category.objects.bulk_update(deleted_ids, ["is_deleted", "is_active"])
                return Response(
                    {"message": "Category Deleted Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Category does not existed."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        sub_deleted_ids = []
        if sub_category_ids:
            categories = SubCategory.objects.filter(id__in=sub_category_ids)
            if not categories:
                return Response(
                    {"error": "Sub Category id not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            for category in categories:
                if product_status == "delete":
                    category.is_deleted = True
                    category.is_active = False
                    sub_deleted_ids.append(category)
                elif product_status == "publish":
                    category.is_deleted = False
                    category.is_active = True
                    sub_deleted_ids.append(category)

            if sub_deleted_ids:
                SubCategory.objects.bulk_update(
                    sub_deleted_ids, ["is_deleted", "is_active"]
                )
                return Response(
                    {"message": "Sub Category Deleted Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Sub Category does not existed."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        return Response(
            {"error": "Category does not existed"},
            status=status.HTTP_404_NOT_FOUND,
        )


class BulkMaterialUpdateDeleteAPIView(APIView):

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(request_body=BulkProductMaterialSerializer)
    def post(self, request):
        serializer = BulkProductMaterialSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_material_ids = serializer.validated_data.get("product_materials", [])

        if not isinstance(product_material_ids, list):
            return Response(
                {
                    "error": "Invalid input format.\
                        Expected a list of product material IDs."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_product_materials = []
        for product_material_id in product_material_ids:
            try:
                existing_product_material = ProductMaterial.objects.get(
                    id=product_material_id
                )
                new_product_material = existing_product_material.copy()
                new_product_materials.append(new_product_material)
            except ProductMaterial.DoesNotExist:
                return Response(
                    {
                        "error": f"ProductMaterial with \
                            ID {product_material_id} does not exist."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        ProductMaterial.objects.bulk_create(new_product_materials)

        serializer = ProductMaterialSerializer(new_product_materials, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(request_body=BulkProductMaterialSerializer)
    def patch(self, request):
        serializer = BulkProductMaterialSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_status = serializer.validated_data.get("status", None)
        product_material_ids = serializer.validated_data.get("product_materials", [])

        updated_ids = []
        if product_material_ids:
            product_materials = ProductMaterial.objects.filter(
                id__in=product_material_ids
            )
            if not product_materials:
                return Response(
                    {"error": "Product Material id not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            for material in product_materials:
                if product_status == "draft":
                    material.is_active = False
                    updated_ids.append(material)

                elif product_status == "publish":
                    material.is_active = True
                    material.is_deleted = False
                    updated_ids.append(material)

            if updated_ids:
                ProductMaterial.objects.bulk_update(
                    updated_ids, ["is_deleted", "is_active"]
                )
                return Response(
                    {"message": "Product Material Updated Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"message": "Product Material does not existed."},
                    status=status.HTTP_200_OK,
                )
        else:
            return Response(
                {"error": "Product Material does not existed."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @swagger_auto_schema(request_body=BulkProductMaterialSerializer)
    def delete(self, request):

        serializer = BulkProductMaterialSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_material_ids = serializer.validated_data.get("product_materials", [])
        product_status = serializer.validated_data.get("status", None)
        deleted_ids = []
        if product_material_ids:
            product_materials = ProductMaterial.objects.filter(
                id__in=product_material_ids
            )
            if not product_materials:
                return Response(
                    {"error": "ProductMaterial id not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            for material in product_materials:
                if product_status == "delete":
                    material.is_deleted = True
                    material.is_active = False
                    deleted_ids.append(material)
                elif product_status == "publish":
                    material.is_deleted = False
                    material.is_active = True
                    deleted_ids.append(material)

            if deleted_ids:
                ProductMaterial.objects.bulk_update(
                    deleted_ids, ["is_deleted", "is_active"]
                )
                return Response(
                    {"message": "Product Material Deleted Successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Product Material does not existed."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"error": "Product Material does not existed"},
                status=status.HTTP_404_NOT_FOUND,
            )


class RelatedProductAPIView(APIView):
    """
    API view for retrieving related products.

    Methods:
    - GET: List up to 10 related products
        Filters:
        - category: Filter by category name
    """

    serializer_class = ProductSerializer
    pagination_class = PageNumberPagination
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, *args, **kwargs):
        queryset = Product.objects.filter(is_active=True, is_deleted=False)[:10]
        category = request.query_params.get("category", None)
        if category:
            queryset = Product.objects.filter(category__name__icontains=category)[:10]

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HotDealProductsView(APIView):
    """
    API view for retrieving hot deal products.

    Methods:
    - GET: List all active hot deal products

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access all methods
    - Others can only access GET method
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        hot_deals = Product.objects.filter(
            hot_deal=True, is_active=True, is_deleted=False
        )
        serializer = ProductSerializer(hot_deals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AddToHotDealView(APIView):
    """
    API view for adding products to hot deals.

    Methods:
    - POST: Add a product to hot deals
        Parameters:
        - pk: Product ID to add to hot deals

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def post(self, request, pk):

        # current_hot_deals = Product.objects.filter(
        #     hot_deal=True, is_active=True, is_deleted=False
        # )
        # if current_hot_deals.count() >= 3:
        #     return Response(
        #         {"error": "No more than 3 products can be in the hot deal list."},
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )

        try:
            product = Product.objects.get(id=pk, is_active=True, is_deleted=False)
            product.hot_deal = True
            product.save()
            return Response(
                {"message": "Product added to hot deals successfully."},
                status=status.HTTP_200_OK,
            )
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found or is inactive."},
                status=status.HTTP_404_NOT_FOUND,
            )


class GetBarcodeView(APIView):
    """
    API view for retrieving product barcodes.

    Methods:
    - GET: Get barcode URL for a product
        Parameters:
        - sku: Product SKU

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        serializer = GetBarcodeSerializer(data=request.query_params)
        if serializer.is_valid():
            sku = serializer.validated_data["sku"]
            inventory_item = Inventory.objects.get(sku=sku)
            print(inventory_item)
            barcode_url = inventory_item.barcode.url if inventory_item.barcode else None
            return Response({"barcode_url": barcode_url}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductOrMaterialDetailView(APIView):
    """
    API view for retrieving product or material details by unique code.

    Methods:
    - GET: Get details using unique code
        Returns:
        - SKU
        - Code
        - Product/Material name
        - Quantity

    Authentication:
    - Requires JWT authentication
    - Admin and stock manager can access
    """

    permission_classes = [AllowGetOnlyIsAdminStockManager]
    authentication_classes = [JWTAuthentication]

    def get(self, request, unique_code):
        product = Inventory.objects.filter(unique_code=unique_code).first()
        material = ProductMaterial.objects.filter(unique_code=unique_code).first()

        response_data = {}

        if product:
            response_data["sku"] = product.sku
            response_data["code"] = product.unique_code
            response_data["product_name"] = product.product_variant.variant_name
            response_data["quantity"] = product.total_quantity
        if material:
            response_data["sku"] = ""
            response_data["code"] = material.unique_code
            response_data["product_name"] = material.name
            response_data["quantity"] = material.quantity

        if not response_data:
            return Response(
                {"error": "No product or material found with this unique code"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(response_data, status=status.HTTP_200_OK)


class GenerateSKUAPIView(APIView):
    """
    API view for generating unique SKUs.

    Methods:
    - POST: Generate unique SKU
        Required fields:
        - product_name: Name to base SKU on

    Returns:
        - sku: Generated unique SKU combining product name and random number
    """

    def generate_unique_sku(self, product_name):
        """
        Generates a unique SKU by combining the product name
        (uppercase)and a 3-digit number.
        Ensures the SKU does not already exist in the database.
        """
        base_sku = slugify(product_name).upper()[:10]

        while True:
            random_part = f"{random.randint(1, 999):03}"
            new_sku = f"{base_sku}-{random_part}"

            if not Inventory.objects.filter(sku=new_sku).exists():
                return new_sku

    def post(self, request):
        product_name = request.data.get("product_name")

        if not product_name:
            return Response(
                {"error": "Product name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        unique_sku = self.generate_unique_sku(product_name)
        return Response({"sku": unique_sku}, status=status.HTTP_200_OK)
