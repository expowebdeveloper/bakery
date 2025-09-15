import json

from celery import shared_task
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.timezone import now
from twilio.rest import Client  # type: ignore

from account.models import CustomUser
from bakery.models import Bakery
from notification.models import AdminNotification, Notification
from notification.utils import send_notification_email
from orders.models import Order, OrderStatus
from product.models import Inventory, Product, ProductVariant


@shared_task
def send_low_stock_notifications():
    LOW_STOCK_THRESHOLD = settings.LOW_STOCK_THRESHOLD

    low_stock_products = Inventory.objects.filter(
        total_quantity__lte=LOW_STOCK_THRESHOLD
    )

    # Update the status of products to "out_of_stock"
    out_of_stock_products = ProductVariant.objects.filter(
        inventory_items__in=low_stock_products
    )
    out_of_stock_products = Product.objects.filter(
        variants__in=out_of_stock_products
    ).distinct()
    out_of_stock_products.update(status="out_of_stock")

    # Update the status of in-stock products
    in_stock_inventories = Inventory.objects.filter(
        total_quantity__gt=LOW_STOCK_THRESHOLD
    )
    in_stock_variants_products = ProductVariant.objects.filter(
        inventory_items__in=in_stock_inventories
    )
    in_stock_products = Product.objects.filter(
        variants__in=in_stock_variants_products
    ).distinct()

    in_stock_products.update(status="in_stock")
    products = [
        {
            "variant_name": product.product_variant.variant_name,
            "variant_id": product.product_variant.id,
            "stock": product.total_quantity,
        }
        for product in low_stock_products
    ]
    email_body_html = render_to_string(
        "notifications/low_stock_notification.html", {"products": products}
    )

    if low_stock_products.exists():
        product_list = "\n".join(
            [
                f"{product.product_variant.variant_name} \
                    ID:{product.product_variant.id}\
                    (Stock: {product.total_quantity})"
                for product in low_stock_products
            ]
        )
        subject = "Low Stock Alert"
        message = f"The following products are low in stock:\n\n{product_list}"
        meta_data = {"products": list(in_stock_products.values_list("id", flat=True))}
        send_email_and_notification_to_admin(
            subject, message, meta_data, email_body_html=email_body_html
        )

    return f"Low stock check completed. {low_stock_products.count()}"


@shared_task
def send_order_notification_to_admin(order_id):
    try:
        order = Order.objects.filter(id=order_id).last()
        if not order:
            return f"Order {order.order_id} does not exist."
        first_name = order.user.first_name
        last_name = order.user.last_name
        subject = "New Order Placed"
        context = {
            "order_id": order.order_id,
            "first_name": order.user.first_name,
            "last_name": order.user.last_name,
            "total_amount": order.total_amount,
            "status": order.status,
        }
        email_body = render_to_string("notifications/order_notification.html", context)

        message = f"Order ID: {order.order_id}\nUser: {first_name} {last_name}\n \
            Total Amount: ${order.total_amount}\nStatus: {order.status}"
        meta_data = {"order": order_id}
        send_email_and_notification_to_admin(
            subject, message, meta_data, email_body_html=email_body
        )
        Notification.objects.create(
            recipient=order.user,
            title=subject,
            message=message,
            notification_type=Notification.NOTIFICATION_TYPES.alert,
            meta_data=meta_data,
        )
        send_notification_email(
            subject,
            message,
            [order.user.email],
        )

        return f"Notification sent to admin and user for order {order_id}."

    except Exception as e:
        return f"An error occurred: {str(e)}"


@shared_task
def send_sms_reminder(reminder_type, recipient_phone, additional_info=None):
    message = ""

    if reminder_type == "order_confirmation":
        message = "Thank you for your order!\
            Your package will be shipped soon. Stay tuned for updates!"

    elif reminder_type == "shipping_notification":
        message = "Good news! Your order has been shipped and will arrive soon."

    elif reminder_type == "cart_abandonment":
        message = f"Hey! You left some amazing items in your cart.\
        Complete your purchase and \
            enjoy 10% off with code {additional_info['discount_code']}!"

    elif reminder_type == "back_in_stock":
        message = f"Good news! Your favorite item is back in stock!\
        Grab it before it's gone: {additional_info['product_link']}"

    elif reminder_type == "delivery_update":
        message = "Your order is out for delivery! You’ll receive it soon.\
        Thank you for shopping with us!"

    elif reminder_type == "discount_sale":
        message = f"Flash Sale Alert! Get {additional_info['discount_percent']}% off \
        on all products for the next {additional_info['sale_duration']} hours!"

    elif reminder_type == "feedback_request":
        message = f"Thanks for your order! How was your experience?\
        Share your feedback here: {additional_info['feedback_link']}"

    elif reminder_type == "delivery_delay":
        message = f"Your order will be delivered on\
            {additional_info['new_delivery_date']} We apologize for the delay!"

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        client.messages.create(
            body=message, from_=settings.TWILIO_PHONE_NUMBER, to=f"+91{recipient_phone}"
        )

    except Exception as e:
        # Handle error
        raise Exception(f"Failed to send SMS: {str(e)}")

    return f"SMS sent to {recipient_phone} with message: {message}"


def send_customer_order_reminders():
    try:
        # Filter orders as required (e.g., pending status)
        orders = Order.objects.filter(status=OrderStatus.PAYMENT_PENDING.value)
        for order in orders:
            reminder_type = "order_reminder"
            print(order.id)
            additional_info = f"Order ID: {order.id}"

            # Access the user associated with the order
            user = order.user

            # Find the bakery associated with the user
            bakery = Bakery.objects.filter(user=user).first()
            if order.status == OrderStatus.PAYMENT_PENDING:
                reminder_type = "shipping_notification"
                additional_info = {
                    "message": "Your order is pending and will be shipped soon."
                }
            elif order.status == "Delivered":
                reminder_type = "delivery_update"

            if bakery and bakery.contact_no:
                phone_number = bakery.contact_no
                send_sms_reminder.apply_async(
                    args=[reminder_type, phone_number, additional_info]
                )
            else:
                print(
                    f"No contact number found for\
                        bakery associated with user {user.id} in order {order.id}"
                )

        return f"Reminders sent for {orders.count()} orders."
    except Exception as e:
        return f"An error occurred: {str(e)}"


# @shared_task
def send_promotional_emails_task(promotion_details):
    """
    Celery task to send promotional emails to subscribed customers.
    """
    customers = Bakery.objects.filter(newletter_reminders=True)
    subject = "Exciting Offer!"
    for customer in customers:
        # Render HTML email
        message_html = render_to_string(
            "emails/promotion_email.html",
            {
                "customer_name": customer.name,
                "promotion_title": promotion_details.get("title", "Exciting Offer!"),
                "promotion_description": promotion_details.get(
                    "description", "Amazing discounts await!"
                ),
                "expiry_date": promotion_details.get(
                    "expiry_date", "Limited time offer"
                ),
                "shop_url": promotion_details.get("url", "https://bakery.rexett.com"),
            },
        )

        # Send email
        send_notification_email(subject, message_html)

    return f"Promotional emails sent to {customers.count()} customers."


def send_email_and_notification_to_admin(
    subject, message, meta_data, email_body_html=None
):
    try:
        admin_users = CustomUser.objects.filter(is_superuser=True)
        if not admin_users.exists():
            return "No admin users found."

        admin_notifications = AdminNotification.objects.filter(user__in=admin_users)
        if isinstance(meta_data, str):
            meta_data = json.loads(meta_data)
        for admin_notification in admin_notifications:
            if admin_notification.order_placed:

                Notification.objects.create(
                    recipient=admin_notification.user,
                    title=subject,
                    message=message,
                    notification_type=Notification.NOTIFICATION_TYPES.alert,
                    meta_data=meta_data,
                )

        admin_emails = list(admin_users.values_list("email", flat=True))
        send_notification_email(
            subject=subject,
            message=message,
            recipients=admin_emails,
            email_body_html=email_body_html,
        )
        return True
    except Exception:
        return False


@shared_task
def update_sale_active_status():
    """
    Celery task to update `sale_active` for all Inventory records daily.
    """
    current_date = now().date()

    Inventory.objects.filter(
        sale_price_dates_from__lte=current_date, sale_price_dates_to__gte=current_date
    ).update(sale_active=True)

    Inventory.objects.filter(sale_price_dates_from__gt=current_date).update(
        sale_active=False
    )

    Inventory.objects.filter(sale_price_dates_to__lt=current_date).update(
        sale_active=False
    )

    return "Sale active statuses updated successfully!"
