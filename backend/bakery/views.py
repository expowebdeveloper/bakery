import uuid

from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication  # type: ignore

from account.models import RegistrationToken
from account.permissions import IsBakery
from bakery.models import Bakery, BakeryAddress, BakeryOTP
from bakery.serializers import (
    BakeryAddressSerializer,
    BakeryRegisterSerializer,
    BakerySerializer,
    OTPVerificationSerializer,
)
from bakery.utils import send_verification_otp


class RegisterBakeryAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        token = request.GET.get("token")

        if not token:
            return Response(
                {"error": "Token is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token_instance = RegistrationToken.objects.get(token=token)

            if not token_instance.is_valid():
                return Response(
                    {"error": "Token has expired."}, status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ Instead of redirecting, return JSON data
            return JsonResponse(
                {
                    "message": "Token is valid.",
                    "token": token,
                    "register_url": request.build_absolute_uri(),
                },
                status=200,
            )

        except RegistrationToken.DoesNotExist:
            return Response(
                {"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST
            )

    @swagger_auto_schema(request_body=BakeryRegisterSerializer)
    def post(self, request):
        token = request.data.get("token")
        if token:
            token_uuid = uuid.UUID(token)
        else:
            token_uuid = None
        try:
            with transaction.atomic():
                serializer = BakeryRegisterSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

                # ✅ Check and delete the token after successful registration
                if token:
                    try:
                        token_instance = RegistrationToken.objects.get(token=token_uuid)
                        token_instance.delete()
                    except RegistrationToken.DoesNotExist:
                        pass
                return Response(
                    {
                        "message": "Bakery created successfully",
                        "data": serializer.data,
                    },
                    status=status.HTTP_201_CREATED,
                )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SendEmailOTPAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        if request.user.is_authenticated:
            user = request.user
            try:
                bakery = Bakery.objects.get(user=user)
                if bakery.user.email:
                    send_verification_otp(bakery, email=True)
                    return Response(
                        {"message": "OTP sent to email successfully"},
                        status=status.HTTP_200_OK,
                    )
                return Response(
                    {"message": "Email not found for authenticated user"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Bakery.DoesNotExist:
                return Response(
                    {"message": "Bakery not found for the user"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            except Exception as e:
                return Response(
                    {"message": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            email = request.data.get("email")
            if email:
                try:
                    send_verification_otp(email=email)
                    return Response(
                        {"message": "OTP sent to email successfully"},
                        status=status.HTTP_200_OK,
                    )
                except Exception as e:
                    return Response(
                        {"message": str(e)},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            return Response(
                {"message": "Email is required for unauthenticated users"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SendSMSAPIView(APIView):

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        bakery = Bakery.objects.get(user=user)

        if bakery.contact_no:
            try:
                send_verification_otp(bakery, phone=True)
            except Exception as e:
                return Response(
                    {"message": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"message": "OTP sent via SMS successfully"}, status=status.HTTP_200_OK
            )

        return Response(
            {"message": "Contact number not found."}, status=status.HTTP_400_BAD_REQUEST
        )


class VerifyOTPAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(request_body=OTPVerificationSerializer)
    def post(self, request):
        user = request.user

        try:
            bakery = Bakery.objects.get(user=user)
        except Bakery.DoesNotExist:
            return Response(
                {"error": "No bakery associated with this user"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            bakery_otp = BakeryOTP.objects.get(bakery=bakery)
        except BakeryOTP.DoesNotExist:
            return Response(
                {"error": "No OTP found for this bakery"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not bakery_otp.is_otp_valid():
            return Response(
                {"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email_otp = request.data.get("email_otp")
            phone_otp = request.data.get("phone_otp")

            if email_otp:
                if bakery_otp.email_otp == email_otp:
                    bakery.email_verified = True
                    bakery.save()
                    return Response(
                        {"message": "Email OTP verification successful"},
                        status=status.HTTP_200_OK,
                    )
                return Response(
                    {"error": "Invalid Email OTP"}, status=status.HTTP_400_BAD_REQUEST
                )

            if phone_otp:
                if bakery_otp.phone_otp == phone_otp:
                    bakery.contact_no_verified = True
                    bakery.save()
                    return Response(
                        {"message": "Phone OTP verification successful"},
                        status=status.HTTP_200_OK,
                    )
                return Response(
                    {"error": "Invalid Phone OTP"}, status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {"error": "Provide either an email OTP or a phone OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateBakeryAPIView(APIView):
    permission_classes = [IsBakery]
    authentication_classes = [JWTAuthentication]

    def get_object(self):
        try:
            return Bakery.objects.get(user=self.request.user)
        except Bakery.DoesNotExist:
            return None

    @swagger_auto_schema(auto_schema=None)
    def get(self, request, *args, **kwargs):
        bakery = self.get_object()
        serializer = BakerySerializer(bakery)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=BakerySerializer)
    def patch(self, request, *args, **kwargs):
        bakery = self.get_object()
        if not bakery:
            return Response(
                {"error": "No bakery found for this user"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BakerySerializer(instance=bakery, data=request.data, partial=True)
        if serializer.is_valid():
            updated_bakery = serializer.save()
            return Response(
                {
                    "message": "Bakery updated successfully",
                    "data": BakerySerializer(updated_bakery).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        bakery_address = get_object_or_404(BakeryAddress, pk=pk)
        bakery_address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BakeryAddressListCreateAPIView(APIView):
    permission_classes = [IsBakery]
    authentication_classes = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        bakery_addresses = BakeryAddress.objects.filter(
            bakery__user=request.user
        ).order_by("-created_at")
        paginator = self.pagination_class()
        paginated_tasks = paginator.paginate_queryset(
            bakery_addresses, request, view=self
        )
        serializer = BakeryAddressSerializer(paginated_tasks, many=True)
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(request_body=BakeryAddressSerializer)
    def post(self, request):
        try:
            bakery = Bakery.objects.get(user=request.user)
            data = request.data.copy()
            data["bakery"] = bakery.id
            serializer = BakeryAddressSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Bakery.DoesNotExist:
            return Response(
                {"error": "Bakery not found for the user."},
                status=status.HTTP_404_NOT_FOUND,
            )


class BakeryAddressDetailAPIView(APIView):
    permission_classes = [IsBakery]
    authentication_classes = [JWTAuthentication]

    def get(self, request, pk):
        bakery_address = get_object_or_404(BakeryAddress, pk=pk)
        serializer = BakeryAddressSerializer(bakery_address)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=BakeryAddressSerializer)
    def patch(self, request, pk):
        bakery_address = get_object_or_404(BakeryAddress, pk=pk)
        serializer = BakeryAddressSerializer(
            bakery_address, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        bakery_address = get_object_or_404(BakeryAddress, pk=pk)
        bakery_address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
