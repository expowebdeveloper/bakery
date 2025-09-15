from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from account.views import (
    CreateNewPasswordAPIView,
    EmployeeRegisterAPIView,
    ForgetPasswordAPIView,
    GenerateRegistrationLinkAPIView,
    LoginAPIView,
    LogoutView,
    NextEmployeeIDAPIView,
    ResetOtpPasswordAPIView,
    ResetPasswordAPIView,
    SendVerifyEmailAPIView,
    UserUpdateAPIView,
    VerifyEmailAPIView,
)

urlpatterns = [
    path("employees/", EmployeeRegisterAPIView.as_view(), name="register"),
    path(
        "employees/<int:pk>/", EmployeeRegisterAPIView.as_view(), name="employee_detail"
    ),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "password/new/", CreateNewPasswordAPIView.as_view(), name="create-new-password"
    ),
    path("password/forget/", ForgetPasswordAPIView.as_view(), name="forget-password"),
    path("password/reset/", ResetPasswordAPIView.as_view(), name="reset-password"),
    path(
        "password/otp-verify/",
        ResetOtpPasswordAPIView.as_view(),
        name="reset-password-otp-verify",
    ),
    path(
        "send-verification-email/",
        SendVerifyEmailAPIView.as_view(),
        name="send-verification-email",
    ),
    path("verify-email/", VerifyEmailAPIView.as_view(), name="verify-email"),
    path(
        "employees/next-id/", NextEmployeeIDAPIView.as_view(), name="next-employee-id"
    ),
    path("user/update/", UserUpdateAPIView.as_view(), name="user-update"),
    path(
        "generate-registration-link/",
        GenerateRegistrationLinkAPIView.as_view(),
        name="generate-link",
    ),
]
