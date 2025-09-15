from django.contrib import admin

from dashboard.models import (
    AdminConfiguration,
    AdminInvoiceConfiguration,
    ZipCodeConfig,
)

admin.site.register(ZipCodeConfig)
admin.site.register(AdminInvoiceConfiguration)
admin.site.register(AdminConfiguration)
