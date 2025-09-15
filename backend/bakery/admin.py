from django.contrib import admin

from bakery.models import Bakery, BakeryAddress, BakeryOTP

# Register your models here.

admin.site.register(Bakery)
admin.site.register(BakeryOTP)
admin.site.register(BakeryAddress)
