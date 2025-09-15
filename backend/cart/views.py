from decimal import Decimal

from django.conf import settings
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from bakery.models import BakeryAddress
from cart.models import Cart, CartItem
from cart.serializers import CartItemInputSerializer, CartItemSerializer, CartSerializer
from dashboard.models import AdminConfiguration, ZipCodeConfig
from product.models import ProductVariant


class CartAPIView(APIView):
    """
    API view for managing shopping carts.

    Methods:
    - POST: Get or create cart for current user/session
        - Merges session cart with user cart on login
        - Calculates shipping costs based on delivery address
        - Applies VAT based on configuration

    Features:
    - Handles both authenticated and anonymous users
    - Maintains cart across login/logout
    - Calculates total price with shipping
    - Applies free delivery threshold

    Authentication:
    - Optional JWT authentication
    - Works with both authenticated and anonymous users
    """

    def get_serializer_context(self, request):
        """
        Get serializer context with request object.

        Args:
            request: HTTP request object

        Returns:
            dict: Context dictionary containing request
        """
        return {"request": request}

    def post(self, request):
        """
        Get or create cart for current user/session.

        Args:
            request: HTTP request object with optional delivery_address

        Returns:
            Response: Cart details including:
                - Items and quantities
                - Total price
                - Shipping cost
                - VAT amount

        Raises:
            400: Bad Request if cart creation fails
        """
        # try:
        configuration = AdminConfiguration.objects.all().last()

        user = request.user if request.user.is_authenticated else None
        session_id = request.session.session_key
        if not session_id:
            request.session.save()
            session_id = request.session.session_key

        if user:
            try:
                cart = Cart.objects.filter(user=user).last()
                if not cart:
                    cart = Cart.objects.create(user=user)
            except Cart.DoesNotExist:
                cart = Cart.objects.filter(session_id=session_id).last()
                if cart:
                    cart.user = user
                    cart.save()
                else:
                    cart = Cart.objects.create(user=user)
            session_cart = Cart.objects.filter(session_id=session_id).last()
            if session_cart:
                # Merge session cart items into user cart
                for item in session_cart.items.all():
                    # Check if the product already exists in the user's cart
                    user_cart_item = CartItem.objects.filter(
                        cart=cart, product_variant=item.product_variant
                    ).first()

                    if user_cart_item:
                        # Update quantity if the item already exists
                        user_cart_item.quantity += item.quantity if item.quantity else 1
                        user_cart_item.save()
                    else:
                        # Create a new cart item if it doesn't exist
                        CartItem.objects.create(
                            cart=cart,
                            product_variant=item.product_variant,
                            quantity=item.quantity,
                        )

                session_cart.delete()
        else:
            # Anonymous user
            if session_id:
                cart_queryset = Cart.objects.filter(session_id=session_id)
                if cart_queryset.exists():
                    cart = cart_queryset.last()
                else:
                    cart = Cart.objects.create(session_id=session_id)

        # Retrieve VAT configuration
        vat_amount = (
            configuration.vat_amount if configuration else settings.VAT_PERCENTAGE
        )

        shipping_cost = Decimal("0.00")
        free_delivery_threshold = Decimal("0.00")
        shipping_address = request.data.get("delivery_address")
        if shipping_address:
            address = BakeryAddress.objects.filter(id=shipping_address).first()
            if address and address.zipcode:
                zip_config = ZipCodeConfig.objects.filter(
                    zip_code=address.zipcode
                ).first()
                if zip_config:
                    free_delivery_threshold = Decimal(zip_config.min_order_amount)
                    shipping_cost = Decimal(zip_config.delivery_cost)

        if cart.total_price >= free_delivery_threshold:
            shipping_cost = Decimal("0.00")

        cart.shipping_cost = shipping_cost
        cart.save()

        cart.calculate_vat(vat_percentage=int(vat_amount), shipping_cost=shipping_cost)

        serializer = CartSerializer(cart, context=self.get_serializer_context(request))
        return Response(serializer.data, status=status.HTTP_200_OK)

        # except Exception as e:
        #     return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CartItemAPIView(APIView):
    """
    API view for managing cart items.

    Methods:
    - GET: List all items in user's cart
    - POST: Add item to cart or update quantity
    - PUT: Update item quantity
    - DELETE: Remove item from cart

    Features:
    - Validates product availability
    - Enforces maximum quantity limits (10 per item)
    - Handles both user and session carts

    Authentication:
    - Optional JWT authentication
    - Works with both authenticated and anonymous users
    """

    @swagger_auto_schema(request_body=CartItemSerializer)
    def post(self, request):
        """
        Add product variant to cart or update quantity.

        Args:
            request: HTTP request object containing:
                - product_variant: ID of variant to add
                - quantity: Amount to add (default: 1)

        Returns:
            Response: Updated cart item details

        Raises:
            400: Bad Request if quantity exceeds limit
            404: Not Found if product variant doesn't exist
        """

        user = request.user if request.user.is_authenticated else None
        session_id = request.session.session_key

        product_variant_id = request.data.get("product_variant")
        quantity = request.data.get("quantity", 1)
        if not product_variant_id:
            return Response(
                {"error": "Please select a product variant."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product_variant = ProductVariant.objects.get(id=product_variant_id)
            print("===product variant==", product_variant)
        except ProductVariant.DoesNotExist:
            return Response(
                {"error": "Product is Out of Stock."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user:
            cart, created = Cart.objects.get_or_create(user=user)
            if session_id:
                cart.session_id = session_id
                # cart.save()
        else:

            try:
                cart, created = Cart.objects.get_or_create(
                    session_id=session_id, user=None
                )
            except Exception:
                Cart.objects.filter(session_id=session_id).distinct()

        cart_item = CartItem.objects.filter(
            cart=cart, product_variant=product_variant.id
        ).first()

        if cart_item:
            if cart_item.quantity > 10:
                return Response(
                    {
                        "message": "You can only order a maximum of \
                            10 items per product."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:
                total_quantity = int(cart_item.quantity) + int(quantity)

                if total_quantity > 10:
                    return Response(
                        {
                            "message": "You can only order a \
                            maximum of 10 items per product."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                cart_item.quantity = total_quantity
                cart_item.save()
        else:
            if quantity:
                if quantity > 10:
                    return Response(
                        {
                            "message": "You can only order a \
                                maximum of 10 items per product."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                cart_item = CartItem.objects.create(
                    cart=cart, product_variant=product_variant, quantity=quantity
                )
        cart_item.save()

        serializer = CartItemSerializer(cart_item)
        response = Response(serializer.data, status=status.HTTP_200_OK)

        return response

    def get(self, request):
        """
        Get all items in the current cart.

        Args:
            request: HTTP request object

        Returns:
            Response: List of cart items with details
        """
        try:
            user = request.user
            session_id = request.session.session_key

            try:
                cart = Cart.objects.filter(
                    Q(session_id=session_id)
                    | Q(user=user if user.is_authenticated else None)
                ).last()
            except Cart.DoesNotExist:
                return Response([], status=status.HTTP_200_OK)

            cart_item = CartItem.objects.filter(cart=cart).order_by("-created_at")
        except CartItem.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

        serializer = CartItemSerializer(cart_item, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=CartItemSerializer)
    def put(self, request, pk):
        """
        Update quantity of existing cart item.

        Args:
            request: HTTP request object with new quantity
            pk: Primary key of cart item

        Returns:
            Response: Updated cart item details

        Raises:
            404: Not Found if cart item doesn't exist
            400: Bad Request if quantity exceeds inventory
        """
        try:
            cart_item = CartItem.objects.get(id=pk)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND
            )
        quantity = request.data.get("quantity")

        if not quantity:
            return Response(
                {"error": "Quantity is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """
        Remove item from cart.

        Args:
            request: HTTP request object
            pk: Primary key of cart item to remove

        Returns:
            Response: Success message

        Raises:
            404: Not Found if cart item doesn't exist
        """
        try:
            cart_item = CartItem.objects.get(id=pk)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND
            )

        cart_item.delete()
        return Response(
            {"message": "Item removed from the cart."},
            status=status.HTTP_204_NO_CONTENT,
        )


class ReOrderCartItemAPIView(APIView):
    """
    API view for bulk cart item operations.

    Methods:
    - POST: Add multiple items to cart at once
        - Validates each item individually
        - Handles quantity limits per item
        - Updates existing items if present

    Features:
    - Bulk item addition
    - Quantity validation
    - Stock checking

    Authentication:
    - Optional JWT authentication
    - Works with both authenticated and anonymous users
    """

    @swagger_auto_schema(request_body=CartItemInputSerializer(many=True))
    def post(self, request):
        """
        Add multiple product variants to cart.

        Args:
            request: HTTP request object containing list of:
                - product_variant: ID of variant
                - quantity: Amount to add

        Returns:
            Response: List of updated cart items

        Raises:
            400: Bad Request if any item is invalid
        """
        user = request.user if request.user.is_authenticated else None
        session_id = request.session.session_key or request.session.create()

        data = request.data
        serializer = CartItemInputSerializer(data=data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data

        if user:
            cart, created = Cart.objects.get_or_create(user=user)
            cart.session_id = session_id
        else:
            cart, created = Cart.objects.get_or_create(session_id=session_id, user=None)

        response_data = []
        for item in validated_data:
            product_variant_id = item["product_variant"]
            quantity = item["quantity"]

            try:
                product_variant = ProductVariant.objects.get(id=product_variant_id)
            except ProductVariant.DoesNotExist:
                continue  # Skip invalid product_variant_id

            cart_item = CartItem.objects.filter(
                cart=cart, product_variant=product_variant
            ).first()

            if cart_item:
                total_quantity = int(cart_item.quantity) + int(quantity)

                if total_quantity:
                    cart_item.quantity = total_quantity
                else:
                    return Response(
                        {
                            "error": f"Product variant {product_variant.variant_name} \
                                is out of stock."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                if quantity:
                    cart_item = CartItem.objects.create(
                        cart=cart, product_variant=product_variant, quantity=quantity
                    )
                else:
                    return Response(
                        {
                            "error": f"Product variant {product_variant.variant_name} \
                                is out of stock."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            cart_item.save()
            response_data.append(CartItemSerializer(cart_item).data)

        return Response(response_data, status=status.HTTP_200_OK)
