import re

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import serializers

from account.models import CustomUser as User
from account.utils import generate_password, send_reset_email
from bakery.models import Bakery, BakeryAddress
from dashboard.models import ZipCodeConfig


class RegisterUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "role", "first_name", "last_name", "password"]
        extra_kwargs = {
            "email": {"validators": []},
        }  # type: ignore

    def validate_email(self, value):
        """
        Validate that the email is unique and properly formatted using a regex pattern.
        """

        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, value):
            raise serializers.ValidationError(("Enter a valid email address."))

        if self.instance and self.instance.email == value:
            return value

        # Check for uniqueness only for new or updated emails
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")

        return value

    def create(self, validated_data):
        role = validated_data.get("role", "bakery")
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            role=role,
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )

        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "role",
            "first_name",
            "last_name",
            "password",
            "is_active",
        ]
        extra_kwargs = {
            "email": {"validators": []},
        }  # type: ignore

    def validate_email(self, value):
        """
        Validate that the email is unique and properly formatted using a regex pattern.
        """

        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, value):
            raise serializers.ValidationError(("Enter a valid email address."))

        return value

    def create(self, validated_data):
        role = validated_data.get("role", "bakery")
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            role=role,
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )

        return user


class BakeryAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = BakeryAddress
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["country"] = instance.get_country_display()
        representation["delivery"] = instance.get_delivery_display()
        return representation

    def validate_zip_code(self, value):
        if not re.match(r"^\d{5,6}$", str(value)):
            raise serializers.ValidationError(
                "Please provide a valid 5 or 6 digit zipcode."
            )
        if not ZipCodeConfig.objects.filter(
            zipcode=value, delivery_availability=ZipCodeConfig.AVAILABLE
        ).exists():
            raise serializers.ValidationError("This zipcode is not valid.")
        return value

    def validate_email(self, value):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Please provide a valid email address.")
        return value

    def validate_contact_no(self, value):
        if not re.match(r"^\d{10}$", str(value)):
            raise serializers.ValidationError(
                "Please provide a valid 10-digit contact number."
            )
        return value


class BakeryRegisterSerializer(serializers.ModelSerializer):
    user = RegisterUserSerializer()
    address = serializers.CharField(write_only=True, required=False)
    city = serializers.CharField(write_only=True, required=False)
    state = serializers.CharField(write_only=True, required=False)
    country = serializers.CharField(write_only=True, required=False)
    zipcode = serializers.CharField(write_only=True, required=False)
    primary = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = Bakery
        fields = [
            "name",
            "contact_no",
            "term_condition",
            "user",
            "address",
            "city",
            "state",
            "country",
            "zipcode",
            "primary",
            "organization_no",
            "vat_id",
        ]

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Please provide a valid email address.")

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")

        return value

    def validate_contact_no(self, value):
        # Check if the number contains a country code
        if value.startswith("+"):
            # Ensure the country code is Sweden's (+46)
            if not value.startswith("+46"):
                raise serializers.ValidationError(
                    "Invalid country code. Only Sweden's country code (+46) is allowed."
                )
            # Validate the rest of the number (9 digits after the country code)
            if not re.match(r"^\+46\d{9}$", value):
                raise serializers.ValidationError(
                    "Invalid contact number format. \
                    It should start with +46 followed by 9 digits."
                )
        else:
            # If no country code, prepend Sweden's country code
            if not re.match(r"^\d{9}$", value):
                raise serializers.ValidationError(
                    "Invalid contact number format.\
                    It should have 9 digits if no country code is provided."
                )
            value = f"+46{value}"

        return value

    def validate_zipcode(self, value):
        if (
            value
            and not ZipCodeConfig.objects.filter(
                zip_code=value, delivery_availability=ZipCodeConfig.AVAILABLE
            ).exists()
        ):
            raise serializers.ValidationError("This zipcode is not valid.")
        return value

    def create(self, validated_data):
        user_data = validated_data.pop(
            "user", None
        )  # ✅ Default to None instead of throwing an error

        if not isinstance(user_data, dict):
            raise serializers.ValidationError(
                {"user": "Invalid format. Expected an object."}
            )

        address_data = {
            "address": validated_data.pop("address", None),
            "city": validated_data.pop("city", None),
            "state": validated_data.pop("state", None),
            "country": validated_data.pop("country", None),
            "zipcode": validated_data.pop("zipcode", None),
            "primary": validated_data.pop("primary", None),
        }

        user_data["role"] = "bakery"
        if not user_data.get("password"):
            password = generate_password()
            user_data["password"] = password
            try:
                send_reset_email(user_data["email"], password)
            except Exception as e:
                return f"User created but failed to send email: {str(e)}"

        # Validate & Create User
        user_serializer = RegisterUserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        # Create Bakery
        bakery = Bakery.objects.create(user=user, **validated_data)

        # Create Bakery Address if provided
        if any(address_data.values()):  # ✅ Use `any()` instead of `all()`
            address_data["bakery"] = bakery
            BakeryAddress.objects.create(**address_data)

        return bakery


class BakerySerializer(serializers.ModelSerializer):
    user = UpdateUserSerializer(required=False)
    # address = BakeryAddressSerializer(required=False)
    addresses = BakeryAddressSerializer(many=True)
    order_count = serializers.SerializerMethodField()

    class Meta:
        model = Bakery
        fields = "__all__"

    def validate_contact_no(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError(
                "Please provide a valid 10-digit contact number."
            )
        return value

    def get_order_count(self, obj):
        return obj.user.order.count()

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        if user_data:
            user_serializer = RegisterUserSerializer(
                instance=instance.user, data=user_data, partial=True
            )
            user_serializer.is_valid(raise_exception=True)
            user_serializer.save()

        # Update bakery fields
        instance.name = validated_data.get("name", instance.name)
        instance.contact_no = validated_data.get("contact_no", instance.contact_no)
        instance.organization_no = validated_data.get(
            "organization_no", instance.organization_no
        )
        instance.vat_id = validated_data.get("vat_id", instance.vat_id)
        instance.sms_reminders = validated_data.get(
            "sms_reminders", instance.sms_reminders
        )
        instance.email_reminders = validated_data.get(
            "email_reminders", instance.email_reminders
        )
        instance.newletter_reminders = validated_data.get(
            "newletter_reminders", instance.newletter_reminders
        )
        instance.save()

        # Update or create bakery address
        address_data = validated_data.get("address", None)
        if address_data:
            bakery_address, created = BakeryAddress.objects.get_or_create(
                bakery=instance
            )
            for attr, value in address_data.items():
                setattr(bakery_address, attr, value)
            bakery_address.save()

        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        customer_type_display = instance.get_customer_type_display()

        # Adding it to the response
        representation["customer_type"] = customer_type_display

        return representation


class OTPVerificationSerializer(serializers.Serializer):
    email_otp = serializers.CharField(max_length=6, required=False)
    phone_otp = serializers.CharField(max_length=6, required=False)


class BakeryAdminSerializer(serializers.ModelSerializer):
    user = UpdateUserSerializer(required=False)
    addresses = BakeryAddressSerializer(many=True)
    order_count = serializers.SerializerMethodField()
    order_ids = serializers.SerializerMethodField()

    class Meta:
        model = Bakery
        fields = "__all__"

    def get_order_count(self, obj):
        return obj.user.order.count()

    def get_order_ids(self, obj):
        """Return a list of order IDs associated with the user."""
        return list(obj.user.order.values_list("order_id", flat=True))

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        customer_type_display = instance.get_customer_type_display()

        representation["customer_type"] = customer_type_display

        return representation
