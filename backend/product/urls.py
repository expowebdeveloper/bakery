from django.urls import include, path
from rest_framework.routers import DefaultRouter

from product.views import (
    AddToHotDealView,
    BulkCategoryUpdateDeleteAPIView,
    BulkMaterialUpdateDeleteAPIView,
    BulkProductUpdateDeleteAPIView,
    CategoryAPIView,
    FavouriteItemAPIView,
    GenerateSKUAPIView,
    GetBarcodeView,
    HotDealProductsView,
    ProductAndMaterialListView,
    ProductAPIView,
    ProductImageViewSet,
    ProductMaterialViewset,
    ProductOrMaterialDetailView,
    ProductSeoViewSet,
    ProductVariantViewSet,
    ProductViewSet,
    RelatedProductAPIView,
    SubCategoryViewSet,
    UpdateQuantityAPIView,
)

router = DefaultRouter()
router.register(r"product-images", ProductImageViewSet)
router.register(r"product-variants", ProductVariantViewSet)
router.register(r"product-seo", ProductSeoViewSet)
router.register(r"product-material", ProductMaterialViewset)
router.register(r"subcategories", SubCategoryViewSet)


urlpatterns = [
    path("", include(router.urls)),
    path(
        "categories/",
        CategoryAPIView.as_view(),
        name="categories",
    ),
    path("categories/<int:pk>/", CategoryAPIView.as_view(), name="categories"),
    path(
        "bulk-category-update/",
        BulkCategoryUpdateDeleteAPIView.as_view(),
        name="category-update",
    ),
    path(
        "inventory-list",
        ProductAndMaterialListView.as_view(),
        name="inventory-list",
    ),
    path(
        "update-stock/",
        UpdateQuantityAPIView.as_view(),
        name="update-stock",
    ),
    path("products/", ProductViewSet.as_view(), name="products"),
    path("products/<int:pk>/", ProductAPIView.as_view(), name="product-detail"),
    path(
        "bulk-material-update/",
        BulkMaterialUpdateDeleteAPIView.as_view(),
        name="bulk-material-update",
    ),
    path(
        "bulk-product-update/",
        BulkProductUpdateDeleteAPIView.as_view(),
        name="product-update",
    ),
    path("favourite_item/", FavouriteItemAPIView.as_view(), name="favourite_item"),
    path(
        "favourite_item/<int:pk>/", FavouriteItemAPIView.as_view(), name="update_item"
    ),
    path("related-products/", RelatedProductAPIView.as_view(), name="related-product"),
    path("hot-deals/", HotDealProductsView.as_view(), name="hot-deal-products"),
    path("add-hot-deal/<int:pk>/", AddToHotDealView.as_view(), name="add-hot-deal"),
    path("get-barcode/", GetBarcodeView.as_view(), name="get-barcode"),
    path(
        "get-product-detail/<str:unique_code>/",
        ProductOrMaterialDetailView.as_view(),
        name="get-detail",
    ),
    path(
        "generate-sku/",
        GenerateSKUAPIView.as_view(),
        name="generate-sku",
    ),
]
