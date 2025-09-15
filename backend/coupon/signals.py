from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from account.models import CustomUser
from coupon.models import Coupon, UserCoupon
from coupon.tasks import assign_coupons_to_new_user
from orders.models import Order

User = get_user_model()


@receiver(post_save, sender=Coupon)
def assign_coupon_to_all_users(sender, instance, created, **kwargs):
    if (
        created
        and instance.customer_eligibility == Coupon.CustomerEligibilityType.ALL_CUSTOMER
    ):
        users = User.objects.all()
        user_coupons = [
            UserCoupon(user=user, coupon=instance)
            for user in users
            if not UserCoupon.objects.filter(user=user, coupon=instance).exists()
        ]
        UserCoupon.objects.bulk_create(user_coupons)


@receiver(post_save, sender=Coupon)
def assign_coupon_to_eligible_users(sender, instance, created, **kwargs):
    users = None
    if created:

        if (
            instance.customer_eligibility
            == Coupon.CustomerEligibilityType.SPECIFIC_CUSTOMER
        ):
            if (
                instance.customer_specification
                == Coupon.CustomerSpecificType.HAVENT_PURCHASED
            ):
                users = User.objects.filter(role="bakery").exclude(
                    id__in=Order.objects.values_list("user_id", flat=True)
                )
            elif (
                instance.customer_specification
                == Coupon.CustomerSpecificType.PURCHASED_MORE_THAN_ONCE
            ):
                # Users who have made more than one purchase
                user_ids = (
                    Order.objects.values("user_id")
                    .annotate(order_count=Count("id"))
                    .filter(order_count__gt=1)
                    .values_list("user_id", flat=True)
                )
                users = User.objects.filter(id__in=user_ids, role="bakery")

            elif (
                instance.customer_specification
                == Coupon.CustomerSpecificType.PURCHASED_ONCE
            ):
                # Users who have made exactly one purchase
                user_ids = (
                    Order.objects.values("user_id")
                    .annotate(order_count=Count("id"))
                    .filter(order_count=1)
                    .values_list("user_id", flat=True)
                )
                users = User.objects.filter(id__in=user_ids, role="bakery")

            elif (
                instance.customer_specification
                == Coupon.CustomerSpecificType.RECENT_PURCHASED
            ):
                # Users who have made a recent purchase (within the last 30 days)
                recent_date = timezone.now() - timedelta(days=30)
                user_ids = Order.objects.filter(
                    created_at__gte=recent_date
                ).values_list("user_id", flat=True)
                users = User.objects.filter(id__in=user_ids, role="bakery")

            else:
                users = User.objects.none()

        if users:
            user_coupons = [
                UserCoupon(
                    user=user,
                    coupon=instance,
                    maximum_usage=instance.usage_count,
                )
                for user in users
                if not UserCoupon.objects.filter(user=user, coupon=instance).exists()
            ]
            UserCoupon.objects.bulk_create(user_coupons)


@receiver(post_save, sender=CustomUser)
def create_user_coupons(sender, instance, created, **kwargs):
    """
    Signal to assign coupons to a new user if the user role is 'bakery'.
    """
    if created and instance.role == "bakery":
        assign_coupons_to_new_user.delay(instance.id)
