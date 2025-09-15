from datetime import datetime
from typing import Any

from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from product.models import (
    Category,
    FavouriteItem,
    Inventory,
    Product,
    ProductImage,
    ProductMaterial,
    ProductSeo,
    ProductVariant,
    SubCategory,
)


class ProductSeoSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        required=False, queryset=Product.objects.all()
    )

    class Meta:
        model = ProductSeo
        fields = [
            "product",
            "focused_keyword",
            "seo_title",
            "slug",
            "preview_as",
            "meta_description",
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        required=False, queryset=Product.objects.all()
    )

    class Meta:
        model = ProductImage
        fields = ["id", "product", "image", "is_featured"]


class BulkingPriceRuleSerializer(serializers.Serializer):
    quantity_from = serializers.IntegerField(required=False)
    quantity_to = serializers.IntegerField(required=False)
    price = serializers.CharField(required=False)


class ProductVariantImagesSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "images"]


class ProductVariantSerializer(serializers.ModelSerializer):
    sku = serializers.CharField(required=False)
    product = ProductVariantImagesSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    inventory = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "sku",
            "product",
            "created_at",
            "updated_at",
            "name",
            "enabled",
            "managed_stock",
            "allow_backorders",
            "description",
            "inventory",
        ]

    def get_inventory(self, obj):
        try:
            if isinstance(obj, ProductVariant):
                inventory = Inventory.objects.filter(product_variant__id=obj.id).last()
                if inventory:
                    return {
                        "id": inventory.product_variant.id,
                        "sku": inventory.sku,
                        "weight": inventory.weight,
                        "unit": inventory.unit,
                        "total_quantity": inventory.total_quantity,
                        "regular_price": inventory.regular_price,
                        "sale_price": inventory.sale_price,
                        "sale_price_dates_from": inventory.sale_price_dates_from,
                        "sale_price_dates_to": inventory.sale_price_dates_to,
                    }
            else:
                inventory = Inventory.objects.filter(sku__iexact=obj.get("sku")).last()
                if inventory:
                    return {
                        "id": inventory.product_variant.id,
                        "sku": inventory.sku,
                        "weight": inventory.weight,
                        "unit": inventory.unit,
                        "total_quantity": inventory.total_quantity,
                        "regular_price": inventory.regular_price,
                        "sale_price": inventory.sale_price,
                        "sale_price_dates_from": inventory.sale_price_dates_from,
                        "sale_price_dates_to": inventory.sale_price_dates_to,
                    }
            return None
        except Exception:
            return None

    def update(self, instance, validated_data):
        validated_data.pop("sku", None)
        return super().update(instance, validated_data)

    def validate(self, data):
        sale_price_dates_from = data.get("sale_price_dates_from")
        sale_price_dates_to = data.get("sale_price_dates_to")

        if sale_price_dates_from and sale_price_dates_to:
            if isinstance(sale_price_dates_from, str):
                sale_price_dates_from = datetime.strptime(
                    sale_price_dates_from, "%Y-%m-%d"
                ).date()
            if isinstance(sale_price_dates_to, str):
                sale_price_dates_to = datetime.strptime(
                    sale_price_dates_to, "%Y-%m-%d"
                ).date()

            if sale_price_dates_to <= sale_price_dates_from:
                raise serializers.ValidationError(
                    "Sale price end date must be after the start date."
                )

        return data

    def validate_allow_backorders(self, value):
        valid_options = ["Do Not Allow", "Allow"]
        if value not in valid_options:
            raise serializers.ValidationError(
                f"Allow backorders must be one of: {', '.join(valid_options)}."
            )
        return value

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError(
                "Description cannot exceed 500 characters."
            )
        return value

    def get_name(self, obj):
        if not isinstance(obj, dict):
            product_name = obj.variant_name

            return f"{product_name}"
        else:
            inventory = Inventory.objects.filter(sku__iexact=obj.get("sku")).first()
            product = inventory.product_variant.product.name
            unit = inventory.unit
            weight = inventory.weight
            return f"{product}-{weight}-{unit}"


class InventorySerializer(serializers.ModelSerializer):
    bulking_price_rules = BulkingPriceRuleSerializer(many=True, required=False)
    sku = serializers.CharField(required=False)
    total_quantity = serializers.IntegerField(required=False)
    regular_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    sale_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    product_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = [
            "sku",
            "total_quantity",
            "product_variant",
            "regular_price",
            "sale_price",
            "sale_price_dates_from",
            "sale_price_dates_to",
            "weight",
            "unit",
            "barcode",
            "bulking_price_rules",
            "product_quantity",
        ]

    def to_representation(self, instance):
        data = {}
        if isinstance(instance, Inventory):
            # Handling barcode as an image field by setting it to URL if it exists
            data["barcode"] = instance.barcode.url if instance.barcode else None

            # Handling DecimalFields
            if instance.regular_price is not None:
                data["regular_price"] = str(instance.regular_price)

            if instance.sale_price is not None:
                data["sale_price"] = str(instance.sale_price)

            # Handling other fields
            data["sku"] = instance.sku
            data["total_quantity"] = instance.total_quantity
            data["product_variant"] = instance.product_variant
            data["bulking_price_rules"] = BulkingPriceRuleSerializer(
                instance.bulking_price_rules, many=True
            ).data
            data["product_quantity"] = self.get_product_quantity(instance)

            return data
        else:
            return instance

    def get_product_quantity(self, obj):
        total_price = 0
        if isinstance(obj, dict) and "bulking_price_rules" in obj:
            rules = obj["bulking_price_rules"]

            for rule in rules:
                quantity_from = int(rule["quantity_from"])
                quantity_to = int(rule["quantity_to"])

                if quantity_from and quantity_to:
                    total_price = quantity_to - quantity_from

        return total_price


class AdvancedSerializer(serializers.Serializer):
    purchase_note = serializers.CharField(required=False)
    min_order_quantity = serializers.IntegerField(required=False)


class ProductSEO(serializers.Serializer):
    focused_keyword = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    seo_title = serializers.CharField(required=False)
    slug = serializers.CharField(required=False)
    preview_as = serializers.CharField(required=False)
    meta_description = serializers.CharField(required=False)


class VariantInventorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    inventory = InventorySerializer(required=False)

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product",
            "name",
            "enabled",
            "managed_stock",
            "allow_backorders",
            "inventory",
        ]

    def create(self, validated_data):
        try:
            inventory_data = validated_data.pop("inventory", None)
            product_variant = ProductVariant.objects.create(**validated_data)

            if inventory_data:
                inventory_serializer = InventorySerializer(data=inventory_data)
                inventory_serializer.is_valid(raise_exception=True)
                inventory_serializer.save(product_variant=product_variant)

            return product_variant

        except IntegrityError as ie:
            raise serializers.ValidationError(
                {
                    "error": "A record with the same SKU already exists.\
                    Please provide a unique SKU.",
                    "detail": f"{str(ie)}",
                }
            )
        except ValidationError as ve:
            raise serializers.ValidationError({"error": ve.detail})
        except Exception as e:
            raise serializers.ValidationError(
                {
                    "error": "An unexpected error occurred during creation.",
                    "details": str(e),
                }
            )

    def update(self, instance, validated_data):
        try:
            inventory_data = validated_data.pop("inventory", None)
            instance = super().update(instance, validated_data)

            if inventory_data:
                inventory_instance = Inventory.objects.get(product_variant=instance)
                inventory_serializer = InventorySerializer(
                    inventory_instance, data=inventory_data, partial=True
                )
                inventory_serializer.is_valid(raise_exception=True)
                inventory_serializer.save()

            return instance
        except Inventory.DoesNotExist:
            raise serializers.ValidationError(
                {"error": "Inventory for this variant does not exist."}
            )
        except ValidationError as ve:
            raise serializers.ValidationError({"error": ve.detail})
        except Exception as e:
            raise serializers.ValidationError({"error": str(e)})

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        try:
            inventory_instance = instance.inventory_items
            if inventory_instance:
                inventory = InventorySerializer(inventory_instance).data
                inventory.pop("product_variant")
                representation["inventory"] = inventory
            else:
                representation["inventory"] = None
        except Inventory.DoesNotExist:
            representation["inventory"] = None
        return representation

    def get_name(self, obj):
        if not isinstance(obj, dict):
            product_name = obj.variant_name

            return f"{product_name}"
        else:
            inventory = Inventory.objects.filter(sku__iexact=obj.get("sku")).first()
            product = inventory.product_variant.product.name
            unit = inventory.unit
            weight = inventory.weight
            return f"{product}-{weight}-{unit}"


class ProductDetailSerializer(serializers.Serializer):
    inventory = InventorySerializer()
    variants = ProductVariantSerializer(many=True)
    advanced = serializers.DictField()


class ProductCreateSerializer(serializers.Serializer):
    name = serializers.CharField()
    category = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all()
    )
    sub_category = serializers.PrimaryKeyRelatedField(
        many=True, queryset=SubCategory.objects.all()
    )
    description = serializers.CharField()
    status = serializers.CharField()
    product_tag = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True,
        required=False,
    )
    product_detail = ProductDetailSerializer()
    product_seo = ProductSeoSerializer()
    images = serializers.ListField(
        child=serializers.FileField(
            max_length=100000, allow_empty_file=False, use_url=False
        )
    )


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ProductSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ["id", "name"]


class SubCategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )  # type: ignore

    product_count = serializers.SerializerMethodField()

    class Meta:
        model = SubCategory
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category_image",
            "parent",
            "product_count",
            "is_active",
            "is_deleted",
            "created_at",
        ]

    def get_product_count(self, obj):
        return Product.objects.filter(sub_category=obj).distinct().count()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["parent"] = (
            ProductCategorySerializer(instance.parent).data if instance.parent else None
        )
        return representation


class CategorySerializer(serializers.ModelSerializer):
    parent: Any = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    product_count = serializers.SerializerMethodField()
    subcategories = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "slug",
            "category_image",
            "parent",
            "product_count",
            "subcategories",
            "created_at",
            "is_deleted",
        ]

    def get_product_count(self, obj):
        if isinstance(obj, SubCategory) and obj.parent:
            return Product.objects.filter(sub_category=obj).count()
        elif isinstance(obj, Category):
            return Product.objects.filter(category=obj).count()
        else:
            return Product.objects.filter(category=obj).count()

    def get_subcategories(self, obj):
        subcategories = SubCategory.objects.filter(parent=obj, is_active=True)
        return SubCategorySerializer(subcategories, many=True).data

    def create(self, validated_data):
        parent_category = validated_data.pop("parent", None)

        if parent_category:
            try:
                parent = Category.objects.get(id=parent_category.id)
            except Category.DoesNotExist:
                raise serializers.ValidationError(
                    f"Parent category with ID {parent_category} does not exist."
                )

            subcategory = SubCategory.objects.create(parent=parent, **validated_data)
            return subcategory
        else:
            category = Category.objects.create(**validated_data)
            return category


class ProductSerializer(serializers.ModelSerializer):
    product_detail = ProductDetailSerializer()
    product_tag = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True,
        required=False,
    )
    product_seo = ProductSeoSerializer()
    feature_image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    category = ProductCategorySerializer(many=True)
    sub_category = ProductSubCategorySerializer(many=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "hot_deal",
            "product_tag",
            "category",
            "sub_category",
            "description",
            "status",
            "is_active",
            "product_detail",
            "is_deleted",
            "product_seo",
            "images",
            "feature_image",
            "created_at",
            "updated_at",
        ]

    def get_feature_image(self, obj):
        featured_image = obj.images.filter(is_featured=True).last()
        if featured_image:
            return ProductImageSerializer(featured_image).data
        return None


class ProductMaterialSerializer(serializers.ModelSerializer):
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model = ProductMaterial
        fields = [
            "id",
            "name",
            "quantity",
            "unit_of_measure",
            "expiry_date",
            "cost",
            "reorder",
            "description",
            "is_active",
            "is_deleted",
            "updated_by",
            "updated_at",
            "created_at",
        ]

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity must be a positive number.")
        return value

    def validate_cost(self, value):
        if value < 0:
            raise serializers.ValidationError("Cost must be a positive number.")
        return value

    def validate_reorder(self, value):
        if value < 0:
            raise serializers.ValidationError("Reorder must be a positive number.")
        return value

    # def validate_expiry_date(self, value):
    #     if isinstance(value, datetime):
    #         expiry_datetime = value
    #     else:
    #         expiry_datetime = datetime.combine(value, datetime.min.time())
    #         expiry_datetime = timezone.make_aware(expiry_datetime)

    #     if expiry_datetime <= timezone.now():
    #         raise serializers.ValidationError("Expiry date must be in the future.")
    #     return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name cannot be blank.")
        return value

    def get_updated_by(self, obj):
        """
        Return the username and email of the user who updated the product material.
        """
        if obj.updated_by:
            name = f"{obj.updated_by.first_name} {obj.updated_by.last_name}"
            employee = getattr(obj.updated_by, "employee_detail", None)
            employee_id = employee.employee_id if employee else None
            return {
                "name": name,
                "email": obj.updated_by.email,
                "employee_id": employee_id,
            }
        return None

    def validate_unit_of_measure(self, value):
        measure_field = (
            ("kg", "Kilogram"),
            ("g", "Gram"),
            ("litre", "Litre"),
            ("mg", "Milligram"),
            ("lb", "Pound"),
            ("oz", "Ounce"),
            ("ml", "Millilitre"),
            ("cup", "Cup"),
            ("tbsp", "Tablespoon"),
            ("tsp", "Teaspoon"),
            ("piece", "Piece"),
            ("slice", "Slice"),
        )

        # Extract valid unit keys from the measure_field
        valid_units = [unit[0] for unit in measure_field]

        # Validate the input value
        if value not in valid_units:
            raise serializers.ValidationError(
                f"Unit of measure must be one of: {', '.join(valid_units)}."
            )
        return value


class InventoryListSerializer(serializers.Serializer):

    name = serializers.CharField(source="product_variant.variant_name", read_only=True)
    sku = serializers.CharField()
    status = serializers.CharField()
    quantity = serializers.IntegerField()
    reorder = serializers.IntegerField(allow_null=True)

    def to_representation(self, instance):
        product_variant_data = instance.product_variant

        inventory = instance
        reorder_value = (
            100 - inventory.total_quantity if inventory.total_quantity < 100 else None
        )
        return {
            "name": product_variant_data.variant_name,
            "sku": inventory.sku,
            "status": "AVAILABLE" if inventory.total_quantity > 0 else "OUT_OF_STOCK",
            "quantity": inventory.total_quantity,
            "reorder": reorder_value,
            "barcode": f"{inventory.start_series}-{inventory.end_series}",
        }


class UpdateQuantitySerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    sku = serializers.CharField(required=True)
    quantity = serializers.IntegerField(required=True)
    start_from = serializers.IntegerField(required=False, allow_null=True)
    end_from = serializers.IntegerField(required=False, allow_null=True)


class FavouriteItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = FavouriteItem
        fields = ["id", "user", "product"]

    def validate_product(self, value):
        """Validate that the product exists."""
        if isinstance(value, Product):
            if not Product.objects.filter(id=value.id).exists():
                raise serializers.ValidationError("Product not found.")
        else:
            if not Product.objects.filter(id=value).exists():
                raise serializers.ValidationError("Product not found.")

        return value

    def to_representation(self, instance):
        """Customize the response to include product details."""
        rep = super().to_representation(instance)
        rep["product"] = ProductSerializer(instance.product).data
        return rep


class BulkDuplicateSerializer(serializers.Serializer):
    products = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="List of product IDs to duplicate.",
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

    def validate_products(self, value):
        if not all(isinstance(id, int) for id in value):
            raise serializers.ValidationError("All product IDs must be integers.")
        return value


class BulkCategorySerializer(serializers.Serializer):
    categories = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of Category IDs to duplicate.",
    )
    sub_categories = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of SubCategory IDs to duplicate.",
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

    def validate_categories(self, value):
        if not all(isinstance(id, int) for id in value):
            raise serializers.ValidationError("All Category IDs must be integers.")
        return value


class BulkProductMaterialSerializer(serializers.Serializer):
    product_materials = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="List of Raw Material IDs to duplicate.",
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
            raise serializers.ValidationError("All  Raw Material must be integers.")
        return value


class GetBarcodeSerializer(serializers.Serializer):
    sku = serializers.CharField(max_length=100)

    class Meta:
        fields = ["sku"]

    def validate_sku(self, value):
        if not Inventory.objects.filter(sku=value).exists():
            raise serializers.ValidationError(f"No inventory found with SKU: {value}")
        return value
