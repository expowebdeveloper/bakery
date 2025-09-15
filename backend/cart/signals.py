from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import pre_save
from django.dispatch import receiver

from cart.models import Cart, CartItem
from coupon.models import Coupon


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


@receiver(pre_save, sender=Cart)
def reset_discount_on_coupon_change(sender, instance, **kwargs):
    """
    Reset discounts and free items if the applied_coupon has changed.
    """
    if instance.pk:
        original = Cart.objects.filter(pk=instance.pk).first()

        if original:
            if original.applied_coupon != instance.applied_coupon:
                if (
                    original.applied_coupon
                    and original.applied_coupon.coupon_type
                    == Coupon.CouponType.BUY_X_GET_Y
                ):
                    try:
                        free_items = original.applied_coupon.customer_get_products.all()
                        coupon = original.applied_coupon

                        if free_items.exists():

                            for product in free_items:
                                try:
                                    cart_item = CartItem.objects.get(
                                        cart=original, product_variant=product
                                    )
                                    if (
                                        cart_item.quantity
                                        > coupon.customer_gets_quantity
                                    ):
                                        cart_item.quantity -= (
                                            coupon.customer_gets_quantity
                                        )
                                        cart_item.discounted_price = None
                                        cart_item.save()
                                    else:
                                        cart_item.delete()

                                except CartItem.DoesNotExist:
                                    continue
                    except AttributeError:
                        pass
                elif (
                    original.applied_coupon
                    and original.applied_coupon.coupon_type
                    != Coupon.CouponType.FREE_SHIPPING
                    and original.applied_coupon.coupon_type
                    != Coupon.CouponType.BUY_X_GET_Y
                ):
                    cart_items = original.cart_items.all()
                    for item in cart_items:
                        item.discounted_price = None
                        item.save()

                    original.save()


# @receiver(post_save, sender=CartItem)
# def apply_best_coupon(sender, instance, created, **kwargs):
#     if created:
#         cart = instance.cart
#         user = cart.user

#         # Calculate the total price for the cart
#         cart_total = sum(
#             item.product_variant.inventory_items.regular_price * item.quantity
#             for item in cart.cart_items.all()
#         )

#         user_coupons = UserCoupon.objects.filter(
#             user=user,
#             redeemed=False,
#             coupon__is_active=True,
#             coupon__start_date__lte=now().date(),
#             coupon__end_date__gte=now().date(),
#             coupon__minimum_purchase_value__lte=cart_total,
#         )

#         best_coupon = None
#         max_discount = 0
#         for user_coupon in user_coupons:
#             coupon = user_coupon.coupon
#             discount_value = calculate_discount(coupon, cart_total)
#             if discount_value > max_discount:
#                 max_discount = discount_value
#                 best_coupon = coupon

#         if best_coupon:
#             cart.applied_coupon = best_coupon
#             cart.save()


def calculate_discount(coupon, cart_total):
    """
    Calculate the discount value based on the coupon type and discount value.
    """
    if coupon.discount_types == "percentage":
        return (cart_total * coupon.discount_value) / 100
    elif coupon.discount_types == "amount":
        return coupon.discount_value
    return 0
