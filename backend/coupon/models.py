import random

from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from account.models import BaseModel, CustomUser
from product.models import ProductVariant


class State(models.Model):
    name = models.CharField(max_length=100, unique=True)
    abbreviation = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name


class Coupon(BaseModel):
    class CouponType(models.TextChoices):
        BUY_X_GET_Y = "buy_x_get_y", "Buy X Get Y"
        AMOUNT_OFF_PRODUCT = "amount_off_product", "Amount Off Product"
        AMOUNT_OFF_ORDER = "amount_off_order", "Amount Off Order"
        FREE_SHIPPING = "free_shipping", "Free Shipping"

    class ShippingScope(models.TextChoices):
        ALL_STATES = "all_states", "All States"
        SPECIFIC_STATES = "specific_states", "Specific States"

    class CustomerEligibilityType(models.TextChoices):
        ALL_CUSTOMER = "all_customer", "All Customer"
        SPECIFIC_CUSTOMER = "specific_customer", "Specific Customer"

    class CustomerSpecificType(models.TextChoices):
        HAVENT_PURCHASED = "havent_purchased", "Haven't Purchased"
        RECENT_PURCHASED = "recent_purchased", "Recent Purchased"
        PURCHASED_ONCE = "purchased_once", "Purchased Once"
        PURCHASED_MORE_THAN_ONCE = (
            "purchased_more_than_once",
            "Purchased More Than Once",
        )

    class CouponCombination(models.TextChoices):
        PRODUCT_DISCOUNTS = "product_discounts", "Product Discounts"
        ORDER_DISCOUNTS = "order_discounts", "Order Discounts"
        SHIPPING_DISCOUNTS = "shipping_discounts", "Shipping Discounts"

    class MaximumDiscountUsage(models.TextChoices):
        PER_CUSTOMER = "per_customer", "Use Per Customer"
        LIMIT_DISCOUNT_USAGE_TIME = (
            "limit_discount_usage_time",
            "Limit Number of Times Discount Usage",
        )

    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "percentage"
        AMOUNT = "amount", "amount"

    class CustomerGetsType(models.TextChoices):
        FREE = "free", "Free"
        AMOUNT_OFF_EACH = "amount_off_each", "Amount Off Each"
        PERCENTAGE = "percentage", "Percentage"

    class CouponApplyType(models.TextChoices):
        SPECIFIC_PRODUCTS = "specific_products", "Specific Products"
        ALL_PRODUCTS = "all_products", "All Products"

    class MinimumPurchaseType(models.TextChoices):
        NO_REQUIREMENT = "no_requirement", "No Minimum Purchase Requirement"
        MINIMUM_PURCHASE_AMOUNT = "minimum_purchase", "Minimum Purchase Amount"
        MINIMUM_QUANTITY_OF_ITEMS = "minimum_items", "Minimum Quantity Of Items"

    code = models.CharField(unique=True)
    coupon_type = models.CharField(
        _("Coupon Type"),
        max_length=100,
        choices=CouponType.choices,
        default=CouponType.BUY_X_GET_Y,
    )
    minimum_purchase_amount = models.BooleanField(default=False)
    minimum_purchase_value = models.DecimalField(
        default=0.0, decimal_places=2, max_digits=10
    )
    minimum_purchase_item = models.BooleanField(default=False)
    minimum_item_value = models.DecimalField(
        default=0.0, decimal_places=2, max_digits=10
    )
    customer_eligibility = models.CharField(
        _("Customer Eligibility"),
        max_length=100,
        choices=CustomerEligibilityType.choices,
        null=True,
        blank=True,
        default=None,
    )
    customer_specification = models.CharField(
        _("Customer Specification"),
        max_length=100,
        choices=CustomerSpecificType.choices,
        null=True,
        blank=True,
        default=None,
    )

    maximum_discount_usage = models.CharField(
        _("Maximum Discount Usage"),
        max_length=100,
        choices=MaximumDiscountUsage.choices,
        null=True,
        blank=True,
        default=None,
    )
    maximum_usage_value = models.IntegerField(default=0)
    combination = models.CharField(
        _("Combination"),
        max_length=100,
        choices=CouponCombination.choices,
        null=True,
        blank=True,
        default=None,
    )
    shipping_scope = models.CharField(
        _("Shipping Scope"),
        max_length=50,
        choices=ShippingScope.choices,
        null=True,
        blank=True,
        default=None,
    )
    states = models.ManyToManyField(
        "State",
        blank=True,
        related_name="coupons",
        help_text="Select specific states if shipping scope is 'Specific States'",
    )  # type: ignore
    shipping_rate = models.DecimalField(
        _("Shipping Rate"), max_digits=10, decimal_places=2, null=True, blank=True
    )
    exclude_shipping_rate = models.BooleanField(default=False)
    discount_types = models.CharField(
        _("Discount Types"),
        max_length=50,
        choices=DiscountType.choices,
        null=True,
        blank=True,
        default=None,
    )
    discount_value = models.IntegerField(default=0)
    start_date = models.DateField()
    start_time = models.TimeField()
    end_date = models.DateField()
    end_time = models.TimeField()
    buy_products = models.ManyToManyField(
        ProductVariant, blank=True, related_name="coupons"
    )
    buy_products_quantity = models.IntegerField(default=0)
    customer_gets_types = models.CharField(
        _("Customer Get Types"),
        max_length=50,
        choices=CustomerGetsType.choices,
        null=True,
        blank=True,
        default=None,
    )
    specific_products = models.ManyToManyField(
        ProductVariant, blank=True, related_name="specific_products"
    )
    customer_gets_quantity = models.IntegerField(default=0)
    customer_get_products = models.ManyToManyField(
        ProductVariant, blank=True, related_name="customer_get_coupons"
    )
    is_active = models.BooleanField(default=True)

    usage_count = models.IntegerField(
        default=0, help_text="Current number of times this coupon has been used"
    )
    applies_to = models.CharField(
        _("Coupon Applies Types"),
        max_length=50,
        choices=CouponApplyType.choices,
        null=True,
        blank=True,
        default=None,
    )
    get_applies_to = models.CharField(
        _("Coupon Get Apply Types"),
        max_length=50,
        choices=CouponApplyType.choices,
        null=True,
        blank=True,
        default=None,
    )

    customer_gets_discount_value = models.IntegerField(default=0)
    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    minimum_purchase_requirement = models.CharField(
        _("Minimum Purchase Requirement"),
        max_length=100,
        choices=MinimumPurchaseType.choices,
        null=True,
        blank=True,
        default=None,
    )

    def can_be_used(self, user=None):
        """Check if the coupon has remaining uses."""
        if self.maximum_discount_usage == "per_customer":
            if not user:
                raise ValueError(
                    "User instance must be provided for per_customer checks."
                )

            # Check usage for a specific customer
            user_usage_count = self.get_user_coupon_usage(user)
            if user_usage_count >= self.maximum_usage_value:
                return False

        elif self.maximum_discount_usage == "limit_discount_usage_time":
            # Check total usage
            if self.usage_count >= self.maximum_usage_value:
                return False

        return True

    def get_user_coupon_usage(self, user):
        """Get the number of times a user has used this coupon."""
        user_coupon = UserCoupon.objects.filter(user=user, coupon=self).first()
        return user_coupon.maximum_usage if user_coupon else 0

    def copy(self):
        """Method to duplicate the Coupon instance with a unique code"""
        new_coupon = Coupon(
            code=self.generate_unique_code(),
            coupon_type=self.coupon_type,
            minimum_purchase_requirement=self.minimum_purchase_requirement,
            minimum_purchase_value=self.minimum_purchase_value,
            customer_eligibility=self.customer_eligibility,
            customer_specification=self.customer_specification,
            maximum_discount_usage=self.maximum_discount_usage,
            maximum_usage_value=self.maximum_usage_value,
            combination=self.combination,
            shipping_scope=self.shipping_scope,
            shipping_rate=self.shipping_rate,
            exclude_shipping_rate=self.exclude_shipping_rate,
            discount_types=self.discount_types,
            discount_value=self.discount_value,
            start_date=self.start_date,
            start_time=self.start_time,
            end_date=self.end_date,
            end_time=self.end_time,
            # customer_buy_types=self.customer_buy_types,
            buy_products_quantity=self.buy_products_quantity,
            customer_gets_types=self.customer_gets_types,
            customer_gets_quantity=self.customer_gets_quantity,
            is_active=self.is_active,
        )
        new_coupon.save()
        new_coupon.states.set(self.states.all())  # Setting states for the new coupon
        new_coupon.buy_products.set(self.buy_products.all())
        new_coupon.specific_products.set(self.specific_products.all())
        new_coupon.customer_get_products.set(self.customer_get_products.all())
        return new_coupon

    def generate_unique_code(self):
        """Generates a unique code for the coupon"""
        base_code = f"{slugify(self.coupon_type)}-{random.randint(1000, 9999)}"
        counter = 1
        unique_code = base_code
        while Coupon.objects.filter(code=unique_code).exists():
            unique_code = f"{base_code}-{counter}"
            counter += 1
        return unique_code

    def __str__(self) -> str:
        return self.code


class UserCoupon(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="user_coupons"
    )
    coupon = models.ForeignKey(
        Coupon, on_delete=models.CASCADE, related_name="user_coupons"
    )
    redeemed = models.BooleanField(default=False)
    redemption_date = models.DateTimeField(null=True, blank=True)
    maximum_usage = models.IntegerField(default=0)

    class Meta:
        unique_together = ("user", "coupon")

    def __str__(self):
        status = "Redeemed" if self.redeemed else "Not Redeemed"
        return f"{self.user} - {self.coupon.code} /- {status}"
