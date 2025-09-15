from asgiref.sync import sync_to_async
from django.conf import settings
from rest_framework import serializers

from account.serializers import UserDetailSerializer
from dashboard.models import AdminConfiguration
from orders.models import Invoice, Order, OrderItem, OrderStatus
from product.serializers import ProductVariantSerializer
from todos.serializers import TaskSerializer


# Convert sync ORM query to async-compatible
async def get_admin_configuration():
    return await sync_to_async(AdminConfiguration.objects.all().last)()


class ContactInformationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    contact_number = serializers.CharField(max_length=15)


class OrderCustomerAddress(serializers.Serializer):
    shipping_address_id = serializers.IntegerField()


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductVariantSerializer()

    class Meta:
        model = OrderItem
        fields = ("product", "quantity", "price")


class OrderInvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for listing and retrieving invoices with additional fields.
    """

    class Meta:
        model = Invoice
        fields = [
            "invoice_number",
            "status",
            "pdf_file",
        ]


class AdminOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = UserDetailSerializer()
    invoice = OrderInvoiceSerializer(read_only=True)
    discounted_amount = serializers.SerializerMethodField()
    task = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "email",
            "contact_number",
            "address",
            "total_amount",
            "discount_amount",
            "final_amount",
            "shipping_fee",
            "items",
            "status",
            "total_with_vat",
            "updated_at",
            "order_id",
            "platform_fee",
            "packing_fee",
            "invoice",
            "discounted_amount",
            "created_at",
            "coupon_name",
            "vat_amount",
            "task",
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Convert the status key to its corresponding value
        status_str = dict(OrderStatus.choices()).get(instance.status, instance.status)
        representation["status"] = status_str

        return representation

    async def create(self, validated_data):
        items_data = validated_data.pop("items")
        configuration = await get_admin_configuration()

        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            item_data["order"] = order
            OrderItem.objects.create(**item_data)
        vat_amount = (
            configuration.vat_amount if configuration else settings.VAT_PERCENTAGE
        )

        order.calculate_vat(vat_percentage=vat_amount)

        return order

    def get_discounted_amount(self, obj):
        # Calculate discounted amount as total_amount - discount_amount
        if obj.total_amount and obj.discount_amount:
            return obj.total_amount - obj.discount_amount
        return None

    def get_task(self, obj):
        task = obj.tasks.all()
        if task.exists():
            return TaskSerializer(task.first()).data
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = UserDetailSerializer()
    invoice = OrderInvoiceSerializer(read_only=True)
    discounted_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "email",
            "contact_number",
            "address",
            "total_amount",
            "discount_amount",
            "final_amount",
            "shipping_fee",
            "items",
            "status",
            "total_with_vat",
            "updated_at",
            "order_id",
            "platform_fee",
            "packing_fee",
            "invoice",
            "discounted_amount",
            "created_at",
            "coupon_name",
            "vat_amount",
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Convert the status key to its corresponding value
        status_str = dict(OrderStatus.choices()).get(instance.status, instance.status)
        representation["status"] = status_str

        return representation

    async def create(self, validated_data):
        items_data = validated_data.pop("items")
        configuration = await get_admin_configuration()
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            item_data["order"] = order
            OrderItem.objects.create(**item_data)
        vat_amount = (
            configuration.vat_amount if configuration else settings.VAT_PERCENTAGE
        )

        order.calculate_vat(vat_percentage=vat_amount)

        return order

    def get_discounted_amount(self, obj):
        # Calculate discounted amount as total_amount - discount_amount
        if obj.total_amount and obj.discount_amount:
            return obj.total_amount - obj.discount_amount
        return None


class OrderApprovalStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=OrderStatus.choices(), required=True)


class InvoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for listing and retrieving invoices with additional fields.
    """

    order = OrderSerializer()
    username = serializers.SerializerMethodField()
    order_date = serializers.DateTimeField(source="order.created_at", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "status",
            "username",
            "order",
            "order_date",
            "total_amount",
            "created_at",
            "updated_at",
            "pdf_file",
        ]

    def get_username(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class InvoiceStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating the status of an invoice.
    """

    class Meta:
        model = Invoice
        fields = ["status"]


class InvoiceIDSerializer(serializers.Serializer):
    invoice_id = serializers.IntegerField()

    def validate_invoice_id(self, value):
        """
        Validate that the invoice ID exists.
        """
        if not Invoice.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invoice with this ID does not exist.")
        return value
