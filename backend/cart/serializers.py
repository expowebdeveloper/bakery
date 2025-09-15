from rest_framework import serializers

from bakery.models import BakeryAddress
from bakery.serializers import BakeryAddressSerializer
from cart.models import Cart, CartItem
from product.models import ProductVariant
from product.serializers import ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    item_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    product_variant = ProductVariantSerializer()

    class Meta:
        model = CartItem
        fields = ["id", "product_variant", "quantity", "item_price"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    discounted_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    applied_coupon_name = serializers.SerializerMethodField()
    discounted_amount = serializers.SerializerMethodField()
    delivery_address = serializers.SerializerMethodField()

    class Meta:
        product_variant = ProductVariantSerializer()
        model = Cart
        fields = [
            "id",
            "user",
            "session_id",
            "items",
            "applied_coupon",
            "applied_coupon_name",
            "total_price",
            "discounted_price",
            "shipping_cost",
            "vat_amount",
            "total_with_vat",
            "discounted_amount",
            "delivery_address",
            "platform_fee",
            "packing_fee",
        ]

    def get_delivery_address(self, obj):
        """Fetch the user's default address or return None."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            address = BakeryAddress.objects.filter(
                bakery__user=request.user, primary=True
            ).first()
            return BakeryAddressSerializer(address).data if address else None
        return None

    def get_discounted_amount(self, obj):
        # Calculate discounted amount as total_price - discounted_price
        if obj.total_price and obj.discounted_price:
            return obj.total_price - obj.discounted_price
        return None

    def get_applied_coupon_name(self, obj):
        # Calculate discounted amount as total_price - discounted_price
        if obj:
            if obj.applied_coupon:

                return obj.applied_coupon.code
        return None


class CartItemInputSerializer(serializers.Serializer):
    product_variant = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate_product_variant(self, value):
        try:
            ProductVariant.objects.get(id=value)
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError(
                f"Product variant with ID {value} does not exist."
            )
        return value
