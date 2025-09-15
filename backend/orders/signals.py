from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.timezone import now

from account.models import CustomUser
from cart.models import Cart
from coupon.models import UserCoupon
from dashboard.models import AdminInvoiceConfiguration
from notification.models import AdminNotification, Notification
from notification.tasks import send_order_notification_to_admin
from notification.utils import send_notification_email
from orders.models import Invoice, Order, OrderItem, OrderStatus
from orders.utils import generate_invoice_number, generate_invoice_pdf

User = get_user_model()


@receiver(post_save, sender=Order)
def SendOrderCreatedNotification(sender, instance, **kwargs):
    send_order_notification_to_admin.delay(instance.id)


@receiver(post_save, sender=OrderItem)
def UpdateProductQuantityWithOrder(sender, instance, created, **kwargs):
    if created:
        with transaction.atomic():

            product_variant = instance.product.inventory_items

            if product_variant.total_quantity >= instance.quantity:
                product_variant.total_quantity -= instance.quantity
                product_variant.save()
            else:
                raise ValidationError(
                    f"Not enough stock available for {product_variant.sku}"
                )


@receiver(post_save, sender=Order)
def RedeemUserCoupon(sender, instance, created, **kwargs):

    if created:
        cart = Cart.objects.filter(user=instance.user).last()
        try:
            applied_coupon = UserCoupon.objects.get(
                user=instance.user, coupon=cart.applied_coupon
            )
        except UserCoupon.DoesNotExist:
            pass
        else:
            if applied_coupon:
                applied_coupon.redeemed = True
                applied_coupon.redemption_date = timezone.now()
                if applied_coupon.maximum_usage > 1:
                    applied_coupon.maximum_usage -= 1

                applied_coupon.save()
                coupon = applied_coupon.coupon
                if coupon.maximum_usage_value > 1:
                    coupon.maximum_usage_value -= 1
                    coupon.save()


@receiver(post_save, sender=Order)
def create_invoice(sender, instance, created, **kwargs):

    if instance.status == OrderStatus.PAYMENT_PENDING.value and not hasattr(
        instance, "invoice"
    ):

        invoice = Invoice.objects.create(
            invoice_number=generate_invoice_number(),
            user=instance.user,
            order=instance,
            total_amount=instance.final_amount,
        )
        pdf_file = generate_invoice_pdf(invoice)
        invoice.pdf_file.save(f"{invoice.invoice_number}.pdf", pdf_file)

    elif not hasattr(instance, "invoice"):
        invoice = Invoice.objects.create(
            invoice_number=generate_invoice_number(),
            user=instance.user,
            order=instance,
            total_amount=instance.final_amount,
        )


@receiver(pre_save, sender=Order)
def send_order_status_update_email(sender, instance, **kwargs):
    """
    Sends an email notification when the order status is updated to 'delivered'.
    """
    try:

        # Fetch the previous status directly from the database
        previous_status = Order.objects.get(pk=instance.pk).status

        # Check if the status has changed to 'delivered'
        order_items = instance.items.all()
        invoice = instance.invoice
        if previous_status != "delivered" and instance.status == "delivered":
            subject = f"Order #{instance.order_id} Delivered Successfully"
            message = (
                f"Dear {instance.user.first_name},\n\n"
                f"Your order (ID: {instance.order_id})\
                    has been successfully delivered.\n\n"
                "Thank you for shopping with us!\n\n"
                "Best regards,\n"
                "The Bakery Team"
            )
            try:
                invoice_config = AdminInvoiceConfiguration.objects.last()
            except Exception:
                invoice_config = None
            logo_url = (
                f"https://bakery-api.rexett.com{invoice_config.logo.url}"
                if invoice_config.logo
                else None
            )
            html_message = render_to_string(
                "emails/order_status_update.html",
                {
                    "order": instance,
                    "orders": order_items,
                    "old_status": previous_status,
                    "invoice": invoice,
                    "invoice_config": invoice_config,
                    "logo_url": logo_url,
                },
            )

            # Get all admin users with role "accountant"
            admin_users = CustomUser.objects.filter(
                is_superuser=True, role="accountant"
            )
            if admin_users.exists():
                admin_emails = list(admin_users.values_list("email", flat=True))

                # Send email to admins
                send_notification_email(
                    subject, message, admin_emails, email_body_html=html_message
                )

                # Create notifications for admins
                for admin_user in admin_users:
                    Notification.objects.create(
                        recipient=admin_user,
                        title=subject,
                        message=message,
                        notification_type=Notification.NOTIFICATION_TYPES.alert,
                        meta_data={"order_id": instance.order_id},
                    )

            # Send email to the user
            send_notification_email(
                subject, message, [instance.user.email], email_body_html=html_message
            )

            # Create notification for the user
            Notification.objects.create(
                recipient=instance.user,
                title=subject,
                message=message,
                notification_type=Notification.NOTIFICATION_TYPES.alert,
                meta_data={"order_id": instance.order_id},
            )

    except Order.DoesNotExist:
        print("Order does not exist, skipping notification.")

    except Exception as e:
        print(f"Something went wrong: {str(e)}")


# @receiver(pre_save, sender=Order)
# def track_status_change(sender, instance, **kwargs):
#     try:
#         # Get the previous version of the order
#         previous = sender.objects.get(pk=instance.pk)

#         subject = f"Order #{instance.order_id} Status Update"
#         message = (
#             f"Dear {instance.user.first_name},\n\n"
#             f"The status of your order (ID: {instance.order_id}) \
#             has been updated from '{previous.status}' to '{instance.status}'.\n\n"
#             "Thank you for shopping with us.\n\n"
#             "Best regards,\n"
#             "The Bakery Team"
#         )
#         html_message = render_to_string(
#             "emails/order_status_update.html",
#             {
#                 "instance": instance,
#                 "old_status": previous.status,
#             },
#         )
#         # Trigger the custom signal
#         send_notification_email(
#             subject,
#             message,
#             [instance.user.email],
#             email_body_html=html_message,
#         )
#     except sender.DoesNotExist:
#         pass


@receiver(pre_save, sender=Invoice)
def update_updated_at_on_status_change(sender, instance, **kwargs):
    if instance.pk:  # Ensure it's an update, not a new creation
        previous_invoice = Invoice.objects.filter(pk=instance.pk).first()
        if previous_invoice and previous_invoice.status != instance.status:
            # Update the updated_at field when the status changes
            instance.updated_at = now()
            send_status_update_email(instance, previous_invoice.status, instance.status)


def send_status_update_email(invoice, old_status, new_status):
    try:
        subject = f"Invoice Status Updated: #{invoice.id}"
        message = (
            f"Dear {invoice.user.first_name} {invoice.user.last_name},\n\n"
            f"The status of your invoice (ID: {invoice.invoice_number}) \
                has been updated.\n\n"
            f"Previous Status: {old_status}\n"
            f"New Status: {new_status}\n\n"
            f"Thank you,\nYour Company Name"
        )
        admin_users = CustomUser.objects.filter(is_superuser=True, role="accountant")
        html_message = render_to_string(
            "email/invoice_status_update.html",
            {
                "invoice": invoice,
                "old_status": old_status,
                "new_status": new_status,
            },
        )
        if not admin_users.exists():
            return "No admin users found."
        admin_notifications = AdminNotification.objects.filter(user__in=admin_users)
        for admin_notification in admin_notifications:
            if admin_notification.order_placed:
                Notification.objects.create(
                    recipient=admin_notification.user,
                    title=subject,
                    message=message,
                    notification_type=Notification.NOTIFICATION_TYPES.alert,
                )
        admin_emails = list(admin_users.values_list("email", flat=True))

        send_notification_email(
            subject, message, admin_emails, email_body_html=html_message
        )
        try:
            send_notification_email(
                subject, message, [invoice.user.email], email_body_html=html_message
            )
        except Exception as e:
            # Log or handle the exception
            print(f"Error sending email: {e}")
    except Exception:
        # Log or handle the exception
        print("Failed to send email")
