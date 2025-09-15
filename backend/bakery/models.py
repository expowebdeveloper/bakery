import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework.permissions import BasePermission

from account.models import BaseModel
from account.models import CustomUser as User
from product.fields import CaseInsensitiveCharField


class IsBakery(BasePermission):
    """
    Custom permission to only allow users with the role 'bakery' to access the view.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == "bakery"


class Bakery(BaseModel):
    class CustomerTypes(models.TextChoices):
        COMPANY = "C", "Company"
        INDIVIDUAL = "I", "Individual"

    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    name = CaseInsensitiveCharField(max_length=255, unique=True)
    contact_no = models.CharField(max_length=15)
    contact_no_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    term_condition = models.BooleanField(default=False)
    sms_reminders = models.BooleanField(default=True)
    email_reminders = models.BooleanField(default=True)
    newletter_reminders = models.BooleanField(default=True)
    customer_type = models.CharField(
        _("Country"),
        max_length=2,
        choices=CustomerTypes.choices,
        default=CustomerTypes.COMPANY,
        null=True,
        blank=True,
    )
    customer_id = models.CharField(max_length=15, unique=True, blank=True, null=True)
    organization_no = models.CharField(
        max_length=100, unique=True, blank=True, null=True
    )
    vat_id = models.CharField(max_length=100, unique=True, blank=True, null=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.customer_id:
            self.customer_id = self.generate_unique_customer_id()
        super().save(*args, **kwargs)

    def generate_unique_customer_id(self):
        return f"CUST-{uuid.uuid4().hex[:8].upper()}"


class BakeryAddress(BaseModel):
    class CountryChoices(models.TextChoices):
        SWEDEN = "SE", "SWEDEN"

    class DeliveryChoices(models.TextChoices):
        BILLING = "BL", "Billing"
        SHIPPING = "SP", "Shipping"

    class SwedenStatesChoices(models.TextChoices):
        STOCKHOLM = "Stockholms län", _("Stockholms län")
        VÄSTERNORRLAND = "Västernorrlands län", _("Västernorrlands län")
        VÄSTMANLAND = "Västmanlands län", _("Västmanlands län")
        VÄSTRA_GÖTALAND = "Västra Götalands län", _("Västra Götalands län")
        ÖSTERGÖTLAND = "Östergötlands län", _("Östergötlands län")
        DALARNA = "Dalarnas län", _("Dalarnas län")
        GÄVLEBORG = "Gävleborgs län", _("Gävleborgs län")
        GOTLAND = "Gotlands län", _("Gotlands län")
        HALLAND = "Hallands län", _("Hallands län")
        JÄMTLAND = "Jämtlands län", _("Jämtlands län")
        JÖNKÖPING = "Jönköpings län", _("Jönköpings län")
        KALMAR = "Kalmar län", _("Kalmar län")
        KRONOBERG = "Kronobergs län", _("Kronobergs län")
        NORDBOTTEN = "Norrbottens län", _("Norrbottens län")
        ÖREBRO = "Örebro län", _("Örebro län")
        SKÅNE = "Skåne län", _("Skåne län")
        SÖDERMANLAND = "Södermanlands län", _("Södermanlands län")
        UPPSALA = "Uppsala län", _("Uppsala län")
        VÄRMLAND = "Värmlands län", _("Värmlands län")
        VÄSTERBOTTEN = "Västerbottens län", _("Västerbottens län")
        BLEKINGE = "Blekinge län", _("Blekinge län")
        NORDMALING = "Nordmalings län", _("Nordmalings län")

    bakery = models.ForeignKey(
        Bakery, on_delete=models.CASCADE, related_name="addresses"
    )
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    state = models.CharField(
        max_length=80, choices=SwedenStatesChoices.choices, verbose_name=_("State")
    )
    country = models.CharField(
        _("Country"),
        max_length=2,
        choices=CountryChoices.choices,
        default=CountryChoices.SWEDEN,
    )
    delivery = models.CharField(
        max_length=2,
        choices=DeliveryChoices.choices,
        default=DeliveryChoices.BILLING,
        verbose_name=_("Delivery"),
    )
    zipcode = models.IntegerField()
    primary = models.BooleanField(default=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    contact_no = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Address for {self.bakery.name}"


class BakeryOTP(models.Model):
    bakery = models.OneToOneField(Bakery, on_delete=models.CASCADE)
    email_otp = models.CharField(max_length=6, null=True, blank=True)
    phone_otp = models.CharField(max_length=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_email_sent_at = models.DateTimeField(null=True, blank=True)
    last_sms_sent_at = models.DateTimeField(null=True, blank=True)

    def is_otp_valid(self):
        """Checks if the OTP is still valid."""
        if settings.OTP_TIMEOUT is not None:
            return timezone.now() < self.expires_at
        return True

    def can_resend_otp(self, otp_type, cooldown_seconds=60):
        """Ensures OTP can only be resent after the cooldown period."""
        if otp_type == "email" and self.last_email_sent_at:
            return (
                timezone.now() - self.last_email_sent_at
            ).total_seconds() > cooldown_seconds
        elif otp_type == "phone" and self.last_sms_sent_at:
            return (
                timezone.now() - self.last_sms_sent_at
            ).total_seconds() > cooldown_seconds
        return True

    def resend_otp(self, otp_type, expiry_minutes=5):
        pass

    def __str__(self):
        return f"OTP for {self.bakery.name}"
