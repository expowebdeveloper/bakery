from celery import shared_task

from account.models import CustomUser
from coupon.models import Coupon, UserCoupon


@shared_task
def assign_coupons_to_new_user(user_id):
    """
    Assigns coupons to a new user with the role 'bakery'
    if the coupon is eligible for all customers.
    """
    try:
        user = CustomUser.objects.get(id=user_id)

        if user.role == "bakery":
            eligible_coupons = Coupon.objects.filter(
                customer_eligibility=Coupon.CustomerEligibilityType.ALL_CUSTOMER.value
            )

            for coupon in eligible_coupons:
                UserCoupon.objects.get_or_create(
                    user=user,
                    coupon=coupon,
                    defaults={
                        "redeemed": False,
                        "redemption_date": None,
                        "maximum_usage": coupon.maximum_usage,
                    },
                )
    except CustomUser.DoesNotExist:
        return f"User with ID {user_id} does not exist."
