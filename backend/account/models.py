import random
import uuid
from datetime import timedelta

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        abstract = True


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and return a regular user with an email and password.
        """
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("accountant", "accountant"),
        ("stock_manager", "stock_manager"),
        ("worker", "worker"),
        ("admin", "admin"),
        ("bakery", "bakery"),
        ("customer", "customer"),
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="worker")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="profile"
    )
    profile_picture = models.ImageField(
        upload_to="profile_pictures/", null=True, blank=True
    )
    bio = models.TextField(blank=True, null=True)  # Optional
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # Optional

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}'s Profile"


class PasswordResetOTP(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_valid = models.BooleanField(default=True)

    def generate_otp(self):
        """Generate a 6-digit random OTP"""
        self.otp = f"{random.randint(100000, 999999)}"
        self.created_at = timezone.now()
        self.is_valid = True
        self.save()

    def is_expired(self):
        """Check if the OTP is expired (set for 5 minutes expiration)"""
        expiration_time = self.created_at + timedelta(minutes=5)

        return timezone.now() > expiration_time


class ShiftType(models.TextChoices):
    DAY_SHIFT = "Morning", "Day Shift (9 AM - 5 PM)"
    NIGHT_SHIFT = "Night", "Night Shift (11 PM - 7 AM)"
    SWING_SHIFT = "Swing", "Swing Shift (3 PM - 11 PM)"


class EmployeeDetail(BaseModel):
    class CountryChoices(models.TextChoices):
        SWEDEN = "SE", "SWEDEN"

    class JobTypeChoices(models.TextChoices):
        FULL_TIME = "FT", "Full-Time"
        PART_TIME = "PT", "Part-Time"
        CONTRACT = "CT", "Contract"
        FREELANCE = "FL", "Freelance"
        INTERN = "IN", "Internship"
        TEMPORARY = "TP", "Temporary"
        REMOTE = "RM", "Remote"

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

    EMPLOYEE_STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("on_leave", "On Leave"),
        ("terminated", "Terminated"),
        ("probation", "Probation"),
        ("resigned", "Resigned"),
    ]

    status = models.CharField(
        max_length=20,
        choices=EMPLOYEE_STATUS_CHOICES,
        default="active",
    )
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="employee_detail"
    )
    employee_id = models.CharField(max_length=200, unique=True)
    shift = models.CharField(
        max_length=10,
        choices=ShiftType.choices,
        default=ShiftType.DAY_SHIFT,
    )
    hiring_date = models.DateField()
    terminate_date = models.DateField(null=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    zip_code = models.CharField(max_length=20, null=True, blank=True)
    state = models.CharField(
        max_length=100, choices=SwedenStatesChoices.choices, null=True, blank=True
    )
    country = models.CharField(
        _("Country"),
        max_length=100,
        choices=CountryChoices.choices,
        default=CountryChoices.SWEDEN,
    )
    contact_no = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                r"^\d{10,15}$",
                message="Enter a valid contact number with 10-15 digits.",
            )
        ],
    )

    job_type = models.CharField(
        max_length=2, choices=JobTypeChoices.choices, default=JobTypeChoices.FULL_TIME
    )

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}'s Address"


class VerifyEmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_valid = models.BooleanField(default=True)
    email_valid = models.BooleanField(default=False)

    def generate_otp(self):
        """Generate a 6-digit random OTP"""
        self.otp = f"{random.randint(100000, 999999)}"
        self.created_at = timezone.now()
        self.is_valid = True
        self.save()

    def is_expired(self):
        """Check if the OTP is expired (set for 5 minutes expiration)"""
        expiration_time = self.created_at + timedelta(minutes=5)
        return timezone.now() > expiration_time


class RegistrationToken(models.Model):
    token = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False
    )  # Generate unique UUID
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        """Set the expiration time to 48 hours from creation"""
        if not self.expires_at:
            self.expires_at = now() + timedelta(hours=48)
        super().save(*args, **kwargs)

    def is_valid(self):
        """Check if the token is still valid"""
        return now() < self.expires_at
