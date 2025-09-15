from django.db import models
from django.utils.translation import gettext_lazy as _

from account.models import BaseModel


class ZipCodeConfig(BaseModel):

    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"

    DELIVERY_AVAILABLITY_CHOICES = [
        (AVAILABLE, "Available"),
        (UNAVAILABLE, "Unavailable"),
    ]

    class CountryChoices(models.TextChoices):
        SWEDEN = "SE", "SWEDEN"

    class SwedenStatesChoices(models.TextChoices):
        STOCKHOLM = "Stockholm", _("Stockholm")
        VÄSTERNORRLAND = "Västernorrland", _("Västernorrland")
        VÄSTMANLAND = "Västmanland", _("Västmanland")
        VÄSTRA_GÖTALAND = "Västra Götaland", _("Västra Götaland")
        ÖSTERGÖTLAND = "Östergötland", _("Östergötland")
        DALARNA = "Dalarna", _("Dalarna")
        GÄVLEBORG = "Gävleborg", _("Gävleborg")
        GOTLAND = "Gotland", _("Gotland")
        HALLAND = "Halland", _("Halland")
        JÄMTLAND = "Jämtland", _("Jämtland")
        JÖNKÖPING = "Jönköping", _("Jönköping")
        KALMAR = "Kalmar", _("Kalmar")
        KRISTIANSTAD = "Kristianstad", _("Kristianstad")
        KOPPARBERG = "Kopparberg", _("Kopparberg")
        SKÅNE = "Skåne", _("Skåne")
        SÖDERMANLAND = "Södermanland", _("Södermanland")
        UPPSALA = "Uppsala", _("Uppsala")
        VÄRMLAND = "Värmland", _("Värmland")
        VÄSTERBOTTEN = "Västerbotten", _("Västerbotten")
        BLEKINGE = "Blekinge", _("Blekinge")
        NORDMALING = "Nordmaling", _("Nordmaling")
        ÖREBRO = "Örebro", _("Örebro")

    zip_code = models.CharField(max_length=6, unique=True)
    city = models.CharField(max_length=50)
    state = models.CharField(
        max_length=100,
        choices=SwedenStatesChoices.choices,
        default=SwedenStatesChoices.BLEKINGE,
    )
    min_order_quantity = models.PositiveIntegerField(null=True, blank=True)
    delivery_availability = models.CharField(
        max_length=13, choices=DELIVERY_AVAILABLITY_CHOICES, default=AVAILABLE
    )
    delivery_threshold = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    is_deleted = models.BooleanField(default=False)
    address = models.TextField(blank=True)
    country = models.CharField(
        _("Country"),
        max_length=100,
        choices=CountryChoices.choices,
        default=CountryChoices.SWEDEN,
    )
    delivery_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    def __str__(self):
        return f"{self.city},{self.state}"


class AdminConfiguration(BaseModel):
    reorder_level = models.IntegerField(default=100)
    vat_amount = models.DecimalField(max_digits=5, decimal_places=2, default=20.00)
    out_of_stock = models.IntegerField(default=5)
    shipping_charges = models.DecimalField(
        max_digits=5, decimal_places=2, default=20.00
    )
    platform_fee = models.DecimalField(
        max_digits=5, decimal_places=2, default=5.00, null=True, blank=True
    )
    packing_fee = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    openai_key = models.TextField(null=True, blank=True)
    groq_key = models.TextField(null=True, blank=True)
    order_accept_time = models.TimeField(null=True, blank=True)
    order_restrict_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return "Admin Configuration"


class AdminInvoiceConfiguration(BaseModel):
    website = models.CharField(max_length=255, null=True, blank=True)
    company_address = models.TextField(null=True, blank=True)
    company_email = models.CharField(max_length=200, null=True, blank=True)
    contact_number = models.CharField(max_length=200, null=True, blank=True)
    company_name = models.CharField(max_length=200, null=True, blank=True)
    logo = models.ImageField(upload_to="company_logos/", null=True, blank=True)
    organization_no = models.CharField(
        max_length=100, unique=True, blank=True, null=True
    )
    vat_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    bank_name = models.CharField(max_length=100, unique=True, blank=True, null=True)
    bank_branch = models.CharField(max_length=100, unique=True, blank=True, null=True)
    iban_number = models.CharField(max_length=100, unique=True, blank=True, null=True)
    account_no = models.CharField(max_length=100, unique=True, blank=True, null=True)

    def __str__(self):
        return self.company_name or "Admin Invoice Configuration"


class CustomerQuery(BaseModel):

    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    contact_no = models.CharField(max_length=255)
    message = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.email or "Query"
