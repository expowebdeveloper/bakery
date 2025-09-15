import logging
import re

from django.conf import settings
from django.contrib.auth import get_user_model, logout
from django.core.mail import send_mail
from django.db.models import Q, Value
from django.db.models.functions import Concat
from django.template.loader import render_to_string
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from account.models import CustomUser as User
from account.models import (
    EmployeeDetail,
    PasswordResetOTP,
    RegistrationToken,
    VerifyEmailOTP,
)
from account.permissions import IsAccountantBakeryAdminStockManager, IsAdmin
from account.serializers import (
    AccEmailVerificationSerializer,
    ForgetPasswordSerializer,
    LoginSerializer,
    NewPasswordSerializer,
    RegisterSerializer,
    ResetOtpPasswordSerializer,
    ResetPasswordSerializer,
    SendOTPSerializer,
    UserUpdateSerializer,
)

logger = logging.getLogger(__name__)


class EmployeeRegisterAPIView(APIView):
    permission_classes = [IsAdmin]
    authentication_classess = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        """
        Return a fresh queryset each time, applying custom filters.
        """
        queryset = User.objects.filter(
            role__in=["accountant", "worker", "stock_manager"]
        )

        search_query = self.request.query_params.get("search", None)

        sort_by = self.request.query_params.get("sort_by", "asc")
        if search_query:
            queryset = queryset.annotate(
                full_name=Concat("first_name", Value(" "), "last_name")
            ).filter(
                Q(first_name__icontains=search_query)
                | Q(email__iregex=search_query)
                | Q(last_name__icontains=search_query)
                | Q(full_name__icontains=search_query)
                | Q(role__icontains=search_query)
                | Q(employee_detail__contact_no__icontains=search_query)
                | Q(employee_detail__employee_id__icontains=search_query)
                | Q(employee_detail__shift__icontains=search_query)
                | Q(employee_detail__terminate_date__icontains=search_query)
                | Q(employee_detail__hiring_date__icontains=search_query)
                | Q(employee_detail__status__icontains=search_query)
            )

        if sort_by:
            valid_sort_fields = {
                "asc": "-employee_detail__created_at",
                "desc": "employee_detail__created_at",
                "email": "email",
                "-email": "-email",
                "name": "first_name",
                "-name": "-first_name",
                "shift": "employee_detail__shift",
                "-shift": "-employee_detail__shift",
                "hiring_date": "employee_detail__hiring_date",
                "-hiring_date": "-employee_detail__hiring_date",
                "-status": "-employee_detail__status",
                "status": "employee_detail__status",
                "terminate_date": "employee_detail__terminate_date",
                "-terminate_date": "-employee_detail__terminate_date",
            }
            if sort_by in valid_sort_fields:
                queryset = queryset.order_by(valid_sort_fields[sort_by])
            else:
                # Default sorting if invalid sort_by is provided
                queryset = queryset.order_by("-employee_detail__created_at")

        return queryset

    @swagger_auto_schema(request_body=RegisterSerializer)
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user, message = serializer.save()
            return Response(
                {
                    "user": RegisterSerializer(user).data,
                    "message": "Email sent to the User",
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

    def get(self, request, pk=None, *args, **kwargs):
        """
        Get single employee detail and List of employees
        """
        if pk:
            try:
                user = User.objects.get(id=pk)
                serializer = RegisterSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Retrieve list of employees
            queryset = self.get_queryset()
            paginator = self.pagination_class()
            paginated_tasks = paginator.paginate_queryset(queryset, request, view=self)
            serializer = RegisterSerializer(paginated_tasks, many=True)
            return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(request_body=RegisterSerializer)
    def patch(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(id=pk)

            # Fetch the employee details related to the user
            try:
                employee_detail = EmployeeDetail.objects.get(user=user)
            except EmployeeDetail.DoesNotExist:
                employee_detail = {}

            # Update the serializer with the existing user and employee details
            serializer = RegisterSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                # Update the user fields
                updated_user = serializer.save()

                # If the employee detail data is provided, update it
                employee_detail_data = request.data.get("employee_detail", None)
                if employee_detail_data:
                    for field, value in employee_detail_data.items():
                        setattr(employee_detail, field, value)
                    employee_detail.save()

                return Response(
                    {
                        "user": RegisterSerializer(updated_user).data,
                        "message": "User and employee details updated successfully",
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk, *args, **kwargs):
        """
        Delete employee.
        """
        try:
            user = User.objects.get(id=pk)
            user.delete()
            return Response(
                {"message": "User deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


class LoginAPIView(APIView):

    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        logger.info(f"user request:{request.data}")
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
            token_data = serializer.get_token(user)
            return Response(token_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classess = [JWTAuthentication]
    """
     This view used to log out the current session
    """

    def post(self, request):
        logout(request)

        request.session.flush()
        return Response(
            {"data": {}, "message": "User Logged Out Successfully", "status": True},
            status=status.HTTP_200_OK,
        )


class ForgetPasswordAPIView(APIView):
    """
    Sends an OTP to the user's email for password reset
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @swagger_auto_schema(request_body=ForgetPasswordSerializer)
    def post(self, request, *args, **kwargs):
        serializer = ForgetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "User with this email does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Generate OTP and send email
            otp_instance, _ = PasswordResetOTP.objects.get_or_create(user=user)
            otp_instance.generate_otp()
            context = {
                "user": user,
                "otp": otp_instance.otp,
            }
            try:
                message = render_to_string("emails/password_reset.html", context)
                send_mail(
                    subject="Your Password Reset OTP",
                    message="",  # Fallback for plain text
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception:
                return Response(
                    {"error": "Failed to send OTP. Please try again later."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            return Response(
                {"message": "OTP has been sent to your email."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordAPIView(APIView):
    """
    Verifies the old password and resets the password
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @swagger_auto_schema(request_body=ResetPasswordSerializer)
    def post(self, request, *args, **kwargs):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")
            new_password = serializer.validated_data.get("new_password")
            User = get_user_model()

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "User with this email does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            user.set_password(new_password)
            user.save()

            return Response(
                {"message": "Password reset successful."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateNewPasswordAPIView(APIView):
    """
    Verifies the old password and resets the password
    """

    permission_classes = [IsAccountantBakeryAdminStockManager]
    authentication_classes = [JWTAuthentication]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @swagger_auto_schema(request_body=NewPasswordSerializer)
    def post(self, request, *args, **kwargs):
        serializer = NewPasswordSerializer(data=request.data)
        if serializer.is_valid():
            old_password = serializer.validated_data.get("old_password")
            new_password = serializer.validated_data.get("new_password")
            User = get_user_model()

            try:
                user = User.objects.get(email=request.user.email)
            except User.DoesNotExist:
                return Response(
                    {"error": "User with this email does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if old_password == new_password:
                return Response(
                    {"error": "New password could not be same as old password"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not user.check_password(old_password):
                return Response(
                    {"error": "Old password is incorrect."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:
                user.set_password(new_password)
                user.save()

            return Response(
                {"message": "Password reset successful."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetOtpPasswordAPIView(APIView):
    """
    Verifies the OTP for reset password.
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @swagger_auto_schema(request_body=ResetOtpPasswordSerializer)
    def post(self, request, *args, **kwargs):
        serializer = ResetOtpPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")
            otp = serializer.validated_data.get("otp")
            # new_password = serializer.validated_data.get("new_password")
            User = get_user_model()

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "User with this email does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            try:
                otp_instance = PasswordResetOTP.objects.get(user=user, otp=otp)
            except PasswordResetOTP.DoesNotExist:
                return Response(
                    {"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST
                )

            if otp_instance.is_expired():
                return Response(
                    {"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST
                )

            if not otp_instance.is_valid:
                return Response(
                    {"error": "OTP is no longer valid."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            otp_instance.is_valid = False
            otp_instance.save()

            return Response(
                {"message": "Otp Verification successful."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailAPIView(APIView):
    """
    API View to verify the email using an OTP.
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @swagger_auto_schema(request_body=AccEmailVerificationSerializer)
    def post(self, request):
        serializer = AccEmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp_instance = VerifyEmailOTP.objects.filter(
                email=email, is_valid=True
            ).first()

            if otp_instance:
                otp_instance.is_valid = False  # Mark the OTP as used
                otp_instance.email_valid = True
                otp_instance.save()
                return Response(
                    {"message": "OTP verified successfully"}, status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Invalid OTP or OTP has expired."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendVerifyEmailAPIView(APIView):
    """
    API View to send an OTP to the user's email for verification.
    """

    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @swagger_auto_schema(request_body=SendOTPSerializer)
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)

        if serializer.is_valid():
            # Save the instance, ensuring the `create` method runs
            otp_instance = serializer.save()

            if otp_instance:
                return Response(
                    {"message": "OTP sent successfully"}, status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Failed to create OTP instance"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NextEmployeeIDAPIView(APIView):
    def get(self, request):
        """
        Returns the next expected unique employee ID.
        """
        last_number = 0

        # Get the highest existing EMP number
        last_employee = EmployeeDetail.objects.order_by("-employee_id").first()

        if last_employee:
            match = re.search(
                r"EMP(\d+)", last_employee.employee_id
            )  # Extract numeric part
            if match:
                last_number = int(match.group(1))

        next_id = f"EMP{last_number + 1:04d}"

        while EmployeeDetail.objects.filter(employee_id=next_id).exists():
            last_number += 1
            next_id = f"EMP{last_number:04d}"

        return Response({"next_employee_id": next_id})


class UserUpdateAPIView(APIView):
    """
    API View to update user details and profile picture.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        """
        Retrieve user details.
        """
        serializer = UserUpdateSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """
        Update user details and profile picture.
        """
        user = request.user
        serializer = UserUpdateSerializer(
            user, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Profile updated successfully!", "data": serializer.data},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GenerateRegistrationLinkAPIView(APIView):
    permission_classes = [IsAdmin]
    authentication_classess = [JWTAuthentication]
    """
    API to generate a secure registration link with a UUID token valid for 48 hours.
    """

    # flake8: noqa: E501
    def post(self, request, *args, **kwargs):
        # Create a new registration token
        token_instance = RegistrationToken.objects.create()

        # Generate the registration link
        registration_link = f"https://bakery.rexett.com/client-signup-registration/?token={token_instance.token}"

        return Response(
            {"registration_link": registration_link}, status=status.HTTP_201_CREATED
        )
