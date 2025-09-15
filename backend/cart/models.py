from decimal import Decimal

from django.conf import settings
from django.contrib.auth.signals import user_logged_in
from django.db import models
from django.dispatch import receiver

from account.models import BaseModel
from account.models import CustomUser as User
from bakery.models import BakeryAddress
from coupon.models import Coupon
from dashboard.models import AdminConfiguration
from product.models import ProductVariant

try:
    config = AdminConfiguration.objects.last()
except:
    config = None


class Cart(BaseModel):
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=40, null=True, blank=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    applied_coupon = models.ForeignKey(
        Coupon, null=True, blank=True, on_delete=models.SET_NULL
    )
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    packing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    vat_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    total_with_vat = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    @property
    def total_price(self):
        """Calculate the total price without any discounts."""
        cart_items = self.items.all()
        total_item_price = Decimal("0.00")

        for item in cart_items:
            total_item_price += Decimal(item.item_price)
        return total_item_price

    def calculate_discounted_total(self, free_items=None, products=None):
        """Calculate total price, excluding price of free items."""
        cart_items = self.items.all()
        total_item_price = Decimal("0.00")
        if free_items:
            coupon = self.applied_coupon
            free_item_ids = {item.id for item in free_items} if free_items else set()
            discount_value = coupon.customer_gets_quantity
            for item in cart_items:
                if item.id not in free_item_ids:
                    total_item_price += Decimal(item.item_price)
                else:
                    chargable_quantity = item.quantity - discount_value
                    if chargable_quantity > 0:
                        print("insidee the chardinge quenity")
                        item_discounted_price = item.item_price / 2
                        total_item_price += item_discounted_price

        else:
            product_item_ids = {item.id for item in products} if products else set()
            coupon = self.applied_coupon
            if coupon.customer_gets_types == Coupon.CustomerGetsType.PERCENTAGE:
                for item in cart_items:
                    if item.id in product_item_ids:
                        discount_percentage = coupon.customer_gets_discount_value

                        item_discounted_price = item.item_price * (
                            1 - (Decimal(discount_percentage) / 100)
                        )
                        dis_amount = item.item_price - item_discounted_price
                        # Add the discounted price to the total
                        total_item_price += dis_amount
            else:
                for item in cart_items:
                    if item.id in product_item_ids:
                        discount_value = Decimal(coupon.customer_gets_discount_value)
                        total_item_price += discount_value * item.quantity
        return (
            total_item_price
            + Decimal(self.shipping_cost)
            # + Decimal(self.platform_fee)
            # + Decimal(self.packing_fee)
        )

    @property
    def cart_items(self):
        """
        Get all cart items related to this cart.
        """
        return self.items.all()

    @property
    def discounted_price(self):
        """
        Calculate the total price after applying the discount
        from the applied coupon.Returns the discounted total price or
        the original total price if no coupon is applied.
        """
        total_cart_price = self.total_price
        if self.applied_coupon:
            coupon = self.applied_coupon
            # if coupon.maximum_usage_value > 0:
            if coupon.coupon_type == Coupon.CouponType.AMOUNT_OFF_ORDER:
                if coupon.discount_types == Coupon.DiscountType.AMOUNT:
                    discount_amount = coupon.discount_value
                    total_cart_price = max(total_cart_price - discount_amount, 0.00)

                elif coupon.discount_types == Coupon.DiscountType.PERCENTAGE:

                    discount_amount = (
                        Decimal(coupon.discount_value) / 100
                    ) * total_cart_price
                    total_cart_price = max(total_cart_price - discount_amount, 0.00)

            elif coupon.coupon_type == Coupon.CouponType.BUY_X_GET_Y:
                free_items = set()
                amount_off_each = set()
                buy_products = coupon.buy_products.all()

                if CartItem.objects.filter(
                    cart=self, product_variant__in=buy_products
                ).exists():
                    products_get = coupon.customer_get_products.all().distinct()

                    for product in products_get:
                        item = CartItem.objects.filter(
                            cart=self, product_variant=product
                        ).first()
                        if (
                            item
                            and item not in free_items
                            and item not in amount_off_each
                        ):
                            if (
                                coupon.customer_gets_types
                                == Coupon.CustomerGetsType.FREE
                            ):
                                free_items.add(item)
                                total_cart_price = self.calculate_discounted_total(
                                    free_items=free_items,
                                    products=amount_off_each,
                                )
                            elif (
                                coupon.customer_gets_types
                                == Coupon.CustomerGetsType.AMOUNT_OFF_EACH
                            ):
                                amount_off_each.add(item)
                                total_cart_price -= self.calculate_discounted_total(
                                    free_items=free_items,
                                    products=amount_off_each,
                                )
                            elif (
                                coupon.customer_gets_types
                                == Coupon.CustomerGetsType.PERCENTAGE
                            ):
                                amount_off_each.add(item)

                                total_cart_price -= self.calculate_discounted_total(
                                    free_items=free_items,
                                    products=amount_off_each,
                                )

            elif coupon.coupon_type == Coupon.CouponType.AMOUNT_OFF_PRODUCT:
                if coupon.applies_to == Coupon.CouponApplyType.SPECIFIC_PRODUCTS:
                    eligible_products = coupon.specific_products.all()
                else:
                    eligible_products = ProductVariant.objects.all()
                updated_total = Decimal("0.00")

                cart_items = CartItem.objects.filter(
                    cart=self, product_variant__in=eligible_products
                )

                for item in cart_items:
                    if coupon.discount_types == Coupon.DiscountType.AMOUNT:
                        original_price = (
                            item.product_variant.inventory_items.regular_price
                        )
                        discounted_price = max(
                            original_price - coupon.discount_value,
                            Decimal("0.00"),
                        )
                        item.discounted_price = discounted_price * item.quantity
                        # item.save()
                        updated_total += item.discounted_price
                    else:
                        original_price = (
                            item.product_variant.inventory_items.regular_price
                        )
                        discounted_price = original_price * (
                            1 - coupon.discount_value / Decimal("100")
                        )

                        discounted_price = max(discounted_price, Decimal("0.00"))

                        item.discounted_price = discounted_price * item.quantity
                        # item.save()
                        updated_total += item.discounted_price

                non_discounted_items = CartItem.objects.exclude(
                    product_variant__in=eligible_products
                )
                for item in non_discounted_items:
                    updated_total += item.item_price

                total_cart_price = updated_total

            elif coupon.coupon_type == Coupon.CouponType.FREE_SHIPPING:
                address = BakeryAddress.objects.filter(
                    bakery__user=self.user, primary=True
                ).last()
                offered_states = coupon.states.values_list("abbreviation", flat=True)

                if address and address.state in offered_states:
                    if coupon.exclude_shipping_rate:
                        self.shipping_cost = 0.00
                    else:
                        self.shipping_cost = coupon.shipping_rate

                    self.save()
        return total_cart_price

    def calculate_vat(self, vat_percentage=10, shipping_cost=10):
        discount_total = self.discounted_price if self.discounted_price else 0
        result_amount = self.total_price - discount_total
        self.shipping_cost = shipping_cost
        self.platform_fee = settings.PLATFORM_FEE
        self.packing_fee = settings.PACKING_FEE
        if result_amount:
            self.vat_amount = (discount_total * vat_percentage) / 100
            self.total_with_vat = (
                discount_total
                + self.vat_amount
                + self.shipping_cost
                # + Decimal(self.platform_fee)
                # + Decimal(self.packing_fee)
            )
        else:
            self.vat_amount = (self.total_price * vat_percentage) / 100
            self.total_with_vat = (
                self.total_price
                + self.vat_amount
                + self.shipping_cost
                # + Decimal(self.platform_fee)
                # + Decimal(self.packing_fee)
            )

        self.order_total = self.total_with_vat

        Cart.objects.filter(pk=self.pk).update(
            vat_amount=self.vat_amount,
            total_with_vat=self.order_total,
            shipping_cost=Decimal(shipping_cost),
        )

    def __str__(self):
        return f"Cart({self.user if self.user else 'Guest'})"

    def save(self, *args, **kwargs):
        # configurations = AdminConfiguration.objects.all().last()
        self.platform_fee = config.platform_fee if config else settings.PLATFORM_FEE
        self.packing_fee = config.packing_fee if config else settings.PACKING_FEE

        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["session_id"], name="unique_session_cart")
        ]


class CartItem(BaseModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    @property
    def item_price(self):
        variant_inventory = self.product_variant.inventory_items
        bulk_price_rules = variant_inventory.bulking_price_rules
        quantity = int(self.quantity)
        applied_price = Decimal(0)

        if self.cart.applied_coupon is None:
            if bulk_price_rules:
                # Sort rules based on `quantity_from`, handling None values
                valid_rules = [
                    rule
                    for rule in bulk_price_rules
                    if rule.get("quantity_from") is not None
                    and str(rule.get("quantity_from")).strip().isdigit()
                ]

                if valid_rules:
                    sorted_rules = sorted(
                        valid_rules, key=lambda x: int(x["quantity_from"])
                    )
                else:
                    sorted_rules = bulk_price_rules
                for rule in sorted_rules:
                    # Convert to integers

                    quantity_to = (
                        int(rule.get("quantity_to", 0))
                        if rule.get("quantity_to")
                        else 0
                    )
                    price = Decimal(rule.get("price", 0)) if rule.get("price") else 0

                    # Ensure `self.quantity` is an integer

                    # Check if this rule applies
                    if quantity == quantity_to:
                        # Calculate bulk sets for this rule
                        multiplier = quantity // quantity_to
                        remainder = quantity % quantity_to

                        # Apply the bulk price
                        applied_price += multiplier * price

                        # Update quantity to process the remainder
                        quantity = remainder

                # Apply the regular price for any leftover items

                if quantity > 0:
                    applied_price += Decimal(quantity) * Decimal(
                        variant_inventory.regular_price
                    )

                # Format to 2 decimal places
                return applied_price.quantize(Decimal("1.00"))

        if variant_inventory.sale_active:
            if quantity > 0:
                applied_price += Decimal(quantity) * Decimal(
                    variant_inventory.sale_price
                )

        return Decimal(variant_inventory.regular_price) * Decimal(self.quantity)

    def __str__(self):
        return f"CartItem({self.product_variant.variant_name}, {self.quantity})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
    """
    Handle cart transfer when a user logs in.
    """
    session_id = request.session.session_key

    if not session_id:
        return

    try:
        cart = Cart.objects.get(session_id=session_id, user=None)
        cart.user = user
        cart.session_id = None
        cart.save()
    except Cart.DoesNotExist:
        pass
