from datetime import date

from django.utils.text import slugify
from rest_framework import serializers

from account.models import CustomUser as User
from coupon.models import Coupon, State, UserCoupon
from product.models import ProductVariant


class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ["id", "name"]


class CouponSerializer(serializers.ModelSerializer):
    specific_products = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True
    )
    buy_products = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True
    )
    customer_get_products = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True
    )
    states = serializers.SlugRelatedField(
        queryset=State.objects.all(), slug_field="name", many=True, required=False
    )
    combination = serializers.ListField(
        child=serializers.ChoiceField(choices=Coupon.CouponCombination.choices),
        required=False,
    )

    class Meta:
        model = Coupon
        fields = "__all__"

        extra_kwargs = {
            "code": {"required": False},
            "minimum_purchase_value": {"required": False},
            "minimum_item_value": {"required": False},
            "maximum_usage_value": {"required": False},
            "shipping_rate": {"required": False, "allow_null": True},
            "discount_value": {"required": False},
            "buy_products_quantity": {"required": False},
            "customer_gets_quantity": {"required": False},
            "usage_count": {"required": False},
            "states": {"required": False, "allow_null": True},
            "minimum_purchase_requirement": {"required": False},
            "maximum_discount_usage": {"required": False},
            "customer_gets_types": {"required": False},
            "start_date": {"required": False},
            "end_date": {"required": False},
        }

    def to_representation(self, instance):
        """Customize the output representation."""
        representation = super().to_representation(instance)

        # Specific products
        representation["specific_products"] = [
            {"id": product.id, "name": product.variant_name}
            for product in instance.specific_products.all()
        ]

        # Buy products
        representation["buy_products"] = [
            {"id": product.id, "name": product.variant_name}
            for product in instance.buy_products.all()
        ]

        # Customer get products
        representation["customer_get_products"] = [
            {"id": product.id, "name": product.variant_name}
            for product in instance.customer_get_products.all()
        ]

        # Combination
        if instance.combination:
            if isinstance(instance.combination, str):
                representation["combination"] = eval(instance.combination)
        else:
            representation["combination"] = []
        return representation

    def validate(self, data):
        start_date = data.get("start_date", date.today())
        end_date = data.get("end_date", date.today())
        if end_date < date.today():
            raise serializers.ValidationError(
                "End date cannot be date before Current Date."
            )
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                "End date cannot be less then start date."
            )

        coupon_type = data.get("coupon_type")
        if not coupon_type:
            raise serializers.ValidationError("Please select Coupon Type")

        if coupon_type == "buy_x_get_y":

            specific_products = data.get("specific_products")
            buy_products = data.get("buy_products")
            applied_to = data.get("applies_to")
            if specific_products and buy_products:
                raise serializers.ValidationError(
                    "Cannot specify both `specific_products` and `buy_products`. \
                        Choose one."
                )

            if applied_to == Coupon.CouponApplyType.SPECIFIC_PRODUCTS.value:
                if not specific_products and not buy_products:
                    raise serializers.ValidationError(
                        "Either `specific_products` or `buy_products` must be provided."
                    )
            if applied_to == Coupon.CouponApplyType.ALL_PRODUCTS.value:
                data["buy_products"] = [
                    {"id": product.id, "name": product.variant_name}
                    for product in ProductVariant.objects.all()
                ]

            if not data.get("buy_products_quantity"):
                raise serializers.ValidationError(
                    "`buy_products_quantity` is required for Buy X Get Y coupons."
                )

            if (
                data.get("get_applies_to")
                == Coupon.CouponApplyType.SPECIFIC_PRODUCTS.value
            ):
                if not data.get("customer_get_products"):
                    raise serializers.ValidationError(
                        "`customer_get_products` is required for Buy X Get Y coupons."
                    )
                else:
                    # Extract product variant IDs from the payload
                    product_variant_ids = [
                        product.get("id")
                        for product in data.get("customer_get_products", [])
                    ]
                    data["customer_get_products"] = [
                        {"id": product.id, "name": product.variant_name}
                        for product in ProductVariant.objects.filter(
                            id__in=product_variant_ids
                        )
                    ]
            else:
                data["customer_get_products"] = [
                    {"id": product.id, "name": product.variant_name}
                    for product in ProductVariant.objects.all()
                ]
            if not data.get("customer_gets_quantity"):
                raise serializers.ValidationError(
                    "`customer_gets_quantity` is required for Buy X Get Y coupons."
                )

        elif coupon_type == "amount_off_product":
            if not data.get("discount_value"):
                raise serializers.ValidationError(
                    "`discount_value` is required for Amount Off Product coupons."
                )
            if not data.get("applies_to"):
                raise serializers.ValidationError(
                    "`product` is required for Amount Off Product coupons."
                )
            applied_to = data.get("applies_to")
            buy_products = data.get("buy_products")
            specific_products = data.get("specific_products")

            if applied_to == Coupon.CouponApplyType.SPECIFIC_PRODUCTS.value:
                if not specific_products and not buy_products:
                    raise serializers.ValidationError(
                        "Either `specific_products` or `buy_products` must be provided."
                    )
            if applied_to == Coupon.CouponApplyType.ALL_PRODUCTS.value:
                data["buy_products"] = [
                    {"id": product.id, "name": product.variant_name}
                    for product in ProductVariant.objects.all()
                ]

        elif coupon_type == "amount_off_order":
            if not data.get("discount_value"):
                raise serializers.ValidationError(
                    "`discount_value` is required for Amount Off Product coupons."
                )
            buy_products = data.get("buy_products")
            applied_to = data.get("applies_to")
            specific_products = data.get("specific_products")

            if applied_to == Coupon.CouponApplyType.SPECIFIC_PRODUCTS.value:
                if not specific_products and not buy_products:
                    raise serializers.ValidationError(
                        "Either `specific_products` or `buy_products` must be provided."
                    )
            if applied_to == Coupon.CouponApplyType.ALL_PRODUCTS.value:
                data["buy_products"] = [
                    {"id": product.id, "name": product.variant_name}
                    for product in ProductVariant.objects.all()
                ]

        else:
            if not data.get("shipping_scope"):
                raise serializers.ValidationError(
                    "`shipping_scope` is required for Free Shipping coupons."
                )

            if data.get("shipping_scope") == "all_states":
                data["states"] = list(State.objects.all())

        if data.get("applied_to") == Coupon.CouponApplyType.ALL_PRODUCTS.value:
            data["buy_products"] = [
                {"id": product.id, "name": product.variant_name}
                for product in ProductVariant.objects.all()
            ]
        return data

    def create(self, validated_data):
        specific_products_data = validated_data.pop("specific_products", [])
        buy_products_data = validated_data.pop("buy_products", [])
        customer_get_products_data = validated_data.pop("customer_get_products", [])
        state_names = validated_data.pop("states", [])

        if not state_names:
            state_names = []  # Set to empty list if None or empty

        unique_state_names = {name for name in state_names}

        states = []
        for state_name in unique_state_names:
            slug = slugify(state_name)
            state = State.objects.filter(name=slug).first()
            if not state:
                state = State.objects.create(name=slug)
            states.append(state)
        coupon = Coupon.objects.create(**validated_data)

        self._set_many_to_many_fields(
            coupon, specific_products_data, "specific_products"
        )
        self._set_many_to_many_fields(coupon, buy_products_data, "buy_products")
        self._set_many_to_many_fields(
            coupon, customer_get_products_data, "customer_get_products"
        )
        coupon.states.set(states)

        return coupon

    def update(self, instance, validated_data):
        """Override update to handle ManyToMany fields."""
        specific_products_data = validated_data.pop("specific_products", [])
        buy_products_data = validated_data.pop("buy_products", [])
        customer_get_products_data = validated_data.pop("customer_get_products", [])
        self._set_many_to_many_fields(
            instance, specific_products_data, "specific_products"
        )

        self._set_many_to_many_fields(instance, buy_products_data, "buy_products")
        self._set_many_to_many_fields(
            instance, customer_get_products_data, "customer_get_products"
        )

        instance = super().update(instance, validated_data)
        instance.save()
        return instance

    def _set_many_to_many_fields(self, instance, data, field_name):
        """
        Helper function to set ManyToMany fields.
        It extracts only 'id' from the input data.
        """
        product_ids = [item["id"] for item in data if "id" in item]
        products = ProductVariant.objects.filter(id__in=product_ids)
        getattr(instance, field_name).set(products)


class UpdateCouponSerializer(serializers.ModelSerializer):
    specific_products = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True
    )
    buy_products = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True
    )
    customer_get_products = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True
    )
    states = serializers.SlugRelatedField(
        queryset=State.objects.all(), slug_field="name", many=True, required=False
    )
    combination = serializers.ListField(
        child=serializers.ChoiceField(choices=Coupon.CouponCombination.choices),
        required=False,
    )

    class Meta:
        model = Coupon
        fields = "__all__"

        extra_kwargs = {
            "code": {"required": False},
            "minimum_purchase_value": {"required": False},
            "minimum_item_value": {"required": False},
            "maximum_usage_value": {"required": False},
            "shipping_rate": {"required": False, "allow_null": True},
            "discount_value": {"required": False},
            "buy_products_quantity": {"required": False},
            "customer_gets_quantity": {"required": False},
            "usage_count": {"required": False},
            "states": {"required": False, "allow_null": True},
            "minimum_purchase_requirement": {"required": False},
            "maximum_discount_usage": {"required": False},
            "customer_gets_types": {"required": False},
            "start_date": {"required": False},
            "end_date": {"required": False},
        }

    def to_representation(self, instance):
        """Customize the output representation."""
        representation = super().to_representation(instance)

        # Specific products
        representation["specific_products"] = [
            {"id": product.id, "name": product.variant_name}
            for product in instance.specific_products.all()
        ]

        # Buy products
        representation["buy_products"] = [
            {"id": product.id, "name": product.variant_name}
            for product in instance.buy_products.all()
        ]

        # Customer get products
        representation["customer_get_products"] = [
            {"id": product.id, "name": product.variant_name}
            for product in instance.customer_get_products.all()
        ]

        # Combination
        if instance.combination:
            if isinstance(instance.combination, str):
                representation["combination"] = eval(instance.combination)
        else:
            representation["combination"] = []
        return representation

    def create(self, validated_data):
        specific_products_data = validated_data.pop("specific_products", [])
        buy_products_data = validated_data.pop("buy_products", [])
        customer_get_products_data = validated_data.pop("customer_get_products", [])
        state_names = validated_data.pop("states", [])

        if not state_names:
            state_names = []  # Set to empty list if None or empty

        unique_state_names = {name for name in state_names}

        states = []
        for state_name in unique_state_names:
            slug = slugify(state_name)
            state = State.objects.filter(name=slug).first()
            if not state:
                state = State.objects.create(name=slug)
            states.append(state)
        coupon = Coupon.objects.create(**validated_data)

        self._set_many_to_many_fields(
            coupon, specific_products_data, "specific_products"
        )
        self._set_many_to_many_fields(coupon, buy_products_data, "buy_products")
        self._set_many_to_many_fields(
            coupon, customer_get_products_data, "customer_get_products"
        )
        coupon.states.set(states)

        return coupon

    def update(self, instance, validated_data):
        """Override update to properly handle ManyToMany fields."""

        # ✅ Extract ManyToMany fields
        specific_products_data = validated_data.pop("specific_products", [])
        buy_products_data = validated_data.pop("buy_products", [])
        customer_products_data = validated_data.pop("customer_get_products", [])

        # ✅ Call helper function to update ManyToMany fields
        self._set_many_to_many_fields(
            instance, specific_products_data, "specific_products"
        )
        self._set_many_to_many_fields(instance, buy_products_data, "buy_products")
        self._set_many_to_many_fields(
            instance, customer_products_data, "customer_get_products"
        )
        # ✅ Apply other updates
        instance = super().update(instance, validated_data)
        return instance

    def _set_many_to_many_fields(self, instance, data, field_name):
        """
        Helper function to set ManyToMany fields.
        Extracts only 'id' from the input data and updates the field.
        """
        product_ids = [int(item["id"]) for item in data if "id" in item]

        # ✅ Fetch matching ProductVariant objects
        products = ProductVariant.objects.filter(id__in=product_ids)

        if products.exists():
            # ✅ Clear existing ManyToMany relations before updating
            getattr(instance, field_name).set(products)
            instance.save()  # Ensure changes are persisted
            print(f"{field_name} updated successfully!")
        else:
            print(f"⚠️ Warning: No matching products found for {field_name}!")


class UserCouponSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    coupon = serializers.PrimaryKeyRelatedField(queryset=Coupon.objects.all())
    coupon_details = CouponSerializer(source="coupon", read_only=True)

    class Meta:
        model = UserCoupon
        fields = [
            "id",
            "user",
            "coupon",
            "redeemed",
            "redemption_date",
            "coupon_details",
            "maximum_usage",
        ]


class BulkCouponSerializer(serializers.Serializer):
    coupons = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="List of Coupon IDs to duplicate.",
    )

    status = serializers.ChoiceField(
        choices=[
            ("draft", "Draft"),
            ("delete", "Delete"),
            ("publish", "Publish"),
            ("duplicate", "Duplicate"),
        ],
        help_text="Action to perform on the products.",
    )

    def validate_product_materials(self, value):
        if not all(isinstance(id, int) for id in value):
            raise serializers.ValidationError("All Coupon must be integers.")
        return value
