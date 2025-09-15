from rest_framework import serializers

from dashboard.models import (
    AdminConfiguration,
    AdminInvoiceConfiguration,
    CustomerQuery,
    ZipCodeConfig,
)


class ZipCodeConfigSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()

    class Meta:
        model = ZipCodeConfig
        fields = [
            "id",
            "zip_code",
            "state",
            "city",
            "location",
            "address",
            "min_order_quantity",
            "delivery_availability",
            "delivery_threshold",
            "notes",
            "delivery_cost",
            "min_order_amount",
            "is_deleted",
        ]

    def get_location(self, obj):
        return f"{obj.city}, {obj.state}"

    def validate_zip_code(self, value):
        if len(value) != 5 or not value.isdigit():
            raise serializers.ValidationError("Zip code must be exactly 5 digits.")
        return value

    def validate_min_order_quantity(self, value):
        if value < 1 or value > 9999:
            raise serializers.ValidationError(
                "Minimum order quantity must be between 1 and 9999."
            )
        return value

    def validate_delivery_threshold(self, value):
        if value < 1 or value > 999999:
            raise serializers.ValidationError(
                "Delivery threshold must be between 1 and 999999."
            )
        return value

    def create(self, validated_data):
        validated_data["is_deleted"] = False
        return super().create(validated_data)


class ProductStatsSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    products_added_today = serializers.IntegerField()
    percentage_added_today = serializers.FloatField()


class AdminConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminConfiguration
        fields = "__all__"


class AdminInvoiceConfigurationSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(required=False)

    class Meta:
        model = AdminInvoiceConfiguration
        fields = [
            "id",
            "website",
            "company_address",
            "company_email",
            "contact_number",
            "company_name",
            "logo",
            "organization_no",
            "vat_id",
            "bank_name",
            "bank_branch",
            "iban_number",
            "account_no",
        ]

    def validate_website(self, value):
        """
        Validate the website URL (optional, but must be a valid URL if provided).
        """
        if value and not value.startswith(("http://", "https://")):
            raise serializers.ValidationError(
                "Website must start with 'http://' or 'https://'."
            )
        return value

    def validate_company_email(self, value):
        """
        Validate the email address (optional, but must be valid if provided).
        """
        if value and "@" not in value:
            raise serializers.ValidationError("Enter a valid email address.")
        return value

    def validate_contact_number(self, value):
        """
        Validate the contact number (optional, must contain only digits).
        """
        if value and not value.isdigit():
            raise serializers.ValidationError(
                "Contact number must contain only digits."
            )
        if value and (len(value) < 10 or len(value) > 15):
            raise serializers.ValidationError(
                "Contact number must be between 10 to 15 digits."
            )
        return value

    def validate_company_name(self, value):
        """
        Validate the company name (optional, but cannot contain special characters).
        """
        if value and not value.replace(" ", "").isalpha():
            raise serializers.ValidationError(
                "Company name must contain only alphabetic characters."
            )
        return value

    def validate(self, data):
        """
        General validation to ensure at least one field is not blank.
        """
        if all(
            not data.get(field)
            for field in [
                "website",
                "company_address",
                "company_email",
                "contact_number",
                "company_name",
            ]
        ):
            raise serializers.ValidationError("At least one field must be provided.")
        return data


class CustomerQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerQuery
        fields = "__all__"
