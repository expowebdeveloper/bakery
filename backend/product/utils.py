from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from product.models import Product, ProductImage


def update_feature_image(product_id, feature_image):
    try:
        product = Product.objects.get(id=product_id)

        if feature_image:
            if isinstance(feature_image, list):
                feature_image = feature_image[0]

            with transaction.atomic():
                ProductImage.objects.filter(product=product, is_featured=True).update(
                    is_featured=False
                )

                if hasattr(feature_image, "name"):
                    ProductImage.objects.create(
                        product=product, image=feature_image, is_featured=True
                    )
                else:
                    return False
        else:
            return False
    except Product.DoesNotExist:
        return False


class CustomPagination(PageNumberPagination):
    page_size = 10

    def get_paginated_response(self, data):
        return Response(
            {
                "total_products": self.page.paginator.count,
                "count": len(data),
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )
