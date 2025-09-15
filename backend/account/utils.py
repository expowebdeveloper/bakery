import random
import string

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


def generate_password(length=12, include_special_chars=True):
    """
    Generate a strong password with a mix of uppercase,
    lowercase, digits, and special characters.
    """

    if length < 8:
        raise ValueError("Password length should be at least 8 characters")

    # Define character pools
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special_chars = string.punctuation if include_special_chars else ""

    # Ensure at least one character from each required set
    password = [
        random.choice(lowercase),
        random.choice(uppercase),
        random.choice(digits),
    ]

    if include_special_chars:
        password.append(random.choice(special_chars))

    # Fill the remaining length with random choices
    all_characters = lowercase + uppercase + digits + special_chars
    password += random.choices(all_characters, k=length - len(password))

    # Shuffle to avoid predictable patterns
    random.shuffle(password)

    return "".join(password)


def send_reset_email(email, password):
    try:
        reset_password_url = f"{settings.BACKEND_URL}/reset-password/"
        subject = "Bakery Management Credentials"
        context = {
            "email": email,
            "password": password,
            "reset_password_url": reset_password_url,
        }
        message = render_to_string("emails/password_reset.html", context)

        send_mail(
            subject=subject,
            message="",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            html_message=message,
            fail_silently=False,
        )
        return True
    except Exception:
        return False
