from django.urls import path

from coupon.views import (
    ApplyCouponAPIView,
    AssignCouponView,
    BulkCouponUpdateDeleteAPIView,
    CouponDetailAPIView,
    CouponListCreateAPIView,
    CouponTrashAPIView,
    RedeemCouponView,
    StateListCreateAPIView,
    UserAssignedCouponsView,
)

urlpatterns = [
    path("coupons/", CouponListCreateAPIView.as_view(), name="coupon-list-create"),
    path("coupons/<int:pk>/", CouponDetailAPIView.as_view(), name="coupon-detail"),
    path("coupon-status/<int:pk>/", CouponTrashAPIView.as_view(), name="coupon-status"),
    path("assign-coupon/", AssignCouponView.as_view(), name="assign-coupon"),
    path(
        "user/coupons/",
        UserAssignedCouponsView.as_view(),
        name="user-assigned-coupons",
    ),
    path(
        "user/redeem-coupon/<int:coupon_id>/",
        RedeemCouponView.as_view(),
        name="redeem-coupon",
    ),
    path(
        "apply/coupon/",
        ApplyCouponAPIView.as_view(),
        name="apply-coupon",
    ),
    path(
        "bulk-coupon-update/",
        BulkCouponUpdateDeleteAPIView.as_view(),
        name="bulk-coupon",
    ),
    path("states/", StateListCreateAPIView.as_view(), name="state-list-create"),
]
