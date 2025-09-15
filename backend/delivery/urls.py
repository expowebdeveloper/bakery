from django.urls import path

from delivery.views import CheckZipCodeAPIView

urlpatterns = [
    path("check-zipcode/", CheckZipCodeAPIView.as_view(), name="check-zipcode")
]
