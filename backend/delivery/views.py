from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.models import ZipCodeConfig
from delivery.serializers import ZipcodeSerializer


class CheckZipCodeAPIView(APIView):
    """
    API view for checking delivery availability by zipcode.

    Methods:
    - POST: Check if delivery is available for a given zipcode
        Required fields:
        - zipcode: 6-digit postal code

    Returns:
        200 OK: Delivery is available
            {
                "zip_code": str,
                "delivery_availability": bool,
                "delivery_message": str,
                "current_time": str
            }
        404 Not Found: Delivery not available
            {
                "message": "Delivery is not available in this area."
            }
        400 Bad Request: Invalid zipcode format
    """

    def post(self, request, *args, **kwargs):
        """
        Check delivery availability for a zipcode.

        Args:
            request: HTTP request object containing zipcode in request.data

        Returns:
            Response: Delivery availability status and message
        """
        serializer = ZipcodeSerializer(data=request.data)
        if serializer.is_valid():
            zip_code = serializer.validated_data["zipcode"]

            current_time = timezone.now()

            cutoff_time = current_time.replace(
                hour=14, minute=0, second=0, microsecond=0
            )
            try:
                zipcode_entry = ZipCodeConfig.objects.get(zip_code=zip_code)

                if zipcode_entry.delivery_availability == ZipCodeConfig.AVAILABLE:
                    if current_time < cutoff_time:
                        delivery_message = "Delivery available today."
                    else:
                        delivery_message = "Delivery available tomorrow."

                    return Response(
                        {
                            "zip_code": zip_code,
                            "delivery_availability": True,
                            "delivery_message": delivery_message,
                            "current_time": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                        },
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        {"message": "Delivery is not available in this area."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

            except ZipCodeConfig.DoesNotExist:
                return Response(
                    {"message": "Delivery is not available in this area."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
