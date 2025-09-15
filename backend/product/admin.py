from django.contrib import admin

from product.models import (
    Category,
    FavouriteItem,
    Inventory,
    Product,
    ProductImage,
    ProductMaterial,
    ProductSeo,
    ProductVariant,
    SubCategory,
)

admin.site.register(Product)
admin.site.register(Category)
admin.site.register(ProductImage)
admin.site.register(ProductVariant)
admin.site.register(SubCategory)
admin.site.register(ProductSeo)
admin.site.register(Inventory)
admin.site.register(FavouriteItem)
admin.site.register(ProductMaterial)
