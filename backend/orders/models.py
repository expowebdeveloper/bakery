from datetime import datetime, timedelta
from enum import Enum

from django.conf import settings
from django.db import models
from django.db.models import Max
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _

from account.models import BaseModel, CustomUser
from dashboard.models import AdminConfiguration
from product.models import ProductVariant


class OrderStatus(Enum):
    PAYMENT_PENDING = "payment_pending"
    DELIVERED = "delivered"
    IN_PROGRESS = "in_progress"
    REJECTED = "rejected"
    CANCELED = "canceled"
    IN_TRANSIT = "in_transit"

    @classmethod
    def choices(cls):
        return [
            (status.value, status.name.replace("_", " ").capitalize()) for status in cls
        ]


class Order(BaseModel):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name="order",
        null=True,
        blank=True,
    )
    email = models.EmailField(null=True, blank=True)
    contact_number = models.CharField(max_length=15)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status = models.CharField(
        max_length=100,
        choices=OrderStatus.choices(),
        default=OrderStatus.PAYMENT_PENDING.value,
    )
    vat_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    total_with_vat = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    shipping_fee = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, default=0.00
    )
    order_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    platform_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0, null=True, blank=True
    )
    packing_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0, null=True, blank=True
    )
    vat_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    address = models.TextField(null=True, blank=True)
    coupon_name = models.CharField(max_length=200, null=True, blank=True)

    def save(self, *args, **kwargs):
        config = AdminConfiguration.objects.last()
        self.platform_fee = config.platform_fee if config else settings.PLATFORM_FEE
        self.packing_fee = config.packing_fee if config else settings.PACKING_FEE
        if not self.order_id:
            self.order_id = self.generate_order_id()
            self.final_amount = self.calculate_final_amount()

        # if self.pk and self.status != self.status:
        #     # Trigger custom signal for status change
        #     order_status_changed.send(
        #         sender=self.__class__, instance=self, old_status=self.status
        #     )
        super().save(*args, **kwargs)
        self.status = self.status

    def generate_order_id(self):
        """
        Generate a unique order ID in the format YYYYMMDDXXX.
        Example: 20240116001 (10 digits).
        """
        current_date = datetime.now().strftime("%Y%m%d")

        # Get the highest order_id for today
        last_order = Order.objects.filter(order_id__startswith=current_date).aggregate(
            Max("order_id")
        )["order_id__max"]

        if last_order:
            last_number = int(last_order[-3:])  # Extract last 3 digits
            new_number = last_number + 1
        else:
            new_number = 1  # Start from 001 if no orders exist today

        return f"{current_date}{new_number:03d}"

    def calculate_vat(self, vat_percentage=12, shipping_fee=0):
        self.total_with_vat = self.total_amount + self.vat_amount
        self.shipping_fee = shipping_fee

        self.total_amount = self.total_with_vat + self.shipping_fee
        self.save()

    def calculate_final_amount(self):

        total = self.total_with_vat + self.total_amount
        return total

    def __str__(self) -> str:
        return f"{self.email}-{self.status}"


class OrderItem(BaseModel):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(
        ProductVariant, related_name="order_items", on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self) -> str:
        return f"{self.product.product.name}"


class InvoiceStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PAID = "paid", "Paid"
    CANCELLED = "cancelled", "Cancelled"
    REFUNDED = "refunded", "Refunded"


class Invoice(BaseModel):
    invoice_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    pdf_file = models.FileField(upload_to="invoices/", null=True, blank=True)
    status = models.CharField(
        _("Customer Get Types"),
        max_length=50,
        choices=InvoiceStatus.choices,
        null=True,
        blank=True,
        default=InvoiceStatus.PENDING.value,
    )
    due_date = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        """
        Automatically set `due_date` to 20 days after the invoice's `created_at` date.
        """
        if not self.due_date:
            # ✅ Ensure `created_at` is set before calculating `due_date`
            if not self.created_at:
                self.created_at = now()
            self.due_date = self.created_at.date() + timedelta(days=20)

        super().save(*args, **kwargs)
