from django.contrib import admin

from orders.models import Invoice, Order, OrderItem

# Register your models here.
admin.site.register(OrderItem)
admin.site.register(Order)
admin.site.register(Invoice)
