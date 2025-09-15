import uuid
from datetime import datetime, timedelta
from io import BytesIO

from django.conf import settings
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils import timezone
from weasyprint import HTML
from xhtml2pdf import pisa

from bakery.utils import generate_otp, send_otp_email, send_otp_sms
from dashboard.models import AdminInvoiceConfiguration


def contact_verification_otp(otp_verification, email=False, phone=False):
    """
    Generate and send OTP for email and/or phone verification.

    Args:
        otp_verification: OTPVerification object to store the generated OTPs
        email (bool): Whether to generate and send email OTP
        phone (bool): Whether to generate and send phone OTP

    Returns:
        bool: True if OTP generation and sending was successful

    Raises:
        Exception: If OTP was sent too recently (within cooldown period)
    """
    email_otp = generate_otp()
    phone_otp = generate_otp()
    expire_at = (
        timezone.now() + timedelta(minutes=int(settings.OTP_TIMEOUT))
        if settings.OTP_TIMEOUT is not None
        else None
    )
    otp_verification.email_otp = email_otp
    otp_verification.contact = phone_otp

    if email:
        if not otp_verification.can_resend_otp(otp_type="email", cooldown_seconds=60):
            raise Exception(
                "Email OTP was sent too recently. Please wait before resending."
            )
        otp_verification.email_otp = email_otp
        otp_verification.last_email_sent_at = timezone.now()
        otp_verification.expires_at = expire_at
    if phone:
        if not otp_verification.can_resend_otp(otp_type="phone", cooldown_seconds=60):
            raise Exception(
                "SMS OTP was sent too recently. Please wait before resending."
            )
        otp_verification.phone_otp = phone_otp
        otp_verification.expires_at = expire_at
        otp_verification.last_sms_sent_at = timezone.now()

    # Save the OTP record to update any changes
    otp_verification.save()

    # Send OTP if email or phone is specified
    if email:
        send_otp_email(otp_verification.email, email_otp)

    if phone:
        send_otp_sms(otp_verification.contact_number, phone_otp)

    return True


def generate_invoice_number():
    """
    Generate a unique invoice number.

    Returns:
        str: Unique invoice number in format 'INV-XXXXXXXX'
            where X is a hexadecimal digit
    """
    return f"INV-{uuid.uuid4().hex[:8].upper()}"


def generate_invoice_pdf(invoice):
    """
    Generate a PDF file for the given invoice.

    Args:
        invoice: Invoice object containing order and items information

    Returns:
        BytesIO: PDF file buffer containing the generated invoice
    """
    try:
        invoice_config = AdminInvoiceConfiguration.objects.last()
    except Exception:
        invoice_config = None

    print(f"🧾 Generating Invoice PDF for Invoice ID: {invoice.id}")

    if not hasattr(invoice, "order"):
        print("🚨 Invoice has no order associated!")
        return None

    order = invoice.order
    logo_url = (
        f"https://bakery-api.rexett.com{invoice_config.logo.url}"
        if invoice_config.logo
        else None
    )

    order_items = order.items.all()
    html_string = render_to_string(
        "invoice.html",
        {
            "invoice": invoice,
            "orders": order_items,
            "invoice_config": invoice_config,
            "logo_url": logo_url,
        },
    )

    pdf_file = BytesIO()
    HTML(string=html_string).write_pdf(pdf_file)
    return pdf_file


def generate_order_pdf(request):
    """
    Generate a PDF file for an order.

    Args:
        request: HTTP request object

    Returns:
        HttpResponse: PDF file response with appropriate headers
            Content-Type: application/pdf
            Content-Disposition: attachment

    Raises:
        HttpResponse: Status 500 if PDF generation fails
    """
    # Sample order data
    order_data = {
        "order_id": f"ORD-{datetime.now().strftime('%Y%m%d')}-001",
        "customer_name": "John Doe",
        "order_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "items": [
            {"name": "Item 1", "quantity": 1, "price": 10, "total": 10},
            {"name": "Item 2", "quantity": 2, "price": 15, "total": 30},
        ],
        "total_amount": 40,
    }

    html_content = render_to_string("order_template.html", order_data)
    buffer = BytesIO()
    pisa_status = pisa.CreatePDF(html_content, dest=buffer)

    if pisa_status.err:
        return HttpResponse("Error generating PDF", status=500)

    buffer.seek(0)
    return HttpResponse(
        buffer,
        content_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={order_data['order_id']}.pdf",
        },
    )
