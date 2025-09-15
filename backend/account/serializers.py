import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.timezone import now
from email_validator import EmailNotValidError, validate_email
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore

from account.models import CustomUser, EmployeeDetail, UserProfile, VerifyEmailOTP
from account.utils import generate_password, send_reset_email

logger = logging.getLogger(__name__)


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "role", "first_name", "last_name"]


class EmployeeDetailsSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(required=False)
    user = UserDetailSerializer(required=False)

    class Meta:
        model = EmployeeDetail
        fields = [
            "employee_id",
            "shift",
            "hiring_date",
            "address",
            "city",
            "state",
            "country",
            "zip_code",
            "contact_no",
            "job_type",
            "user",
            "status",
            "created_at",
        ]

    def validate_contact_no(self, value):
        """
        Ensure the contact number has only digits and is between 10 and 15 characters.
        """
        if not value.isdigit():
            raise serializers.ValidationError(
                "Contact number must contain only digits."
            )
        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Contact number must be between 10 and 15 digits."
            )
        return value


class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=False)
    employee_detail = EmployeeDetailsSerializer()
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "role",
            "first_name",
            "last_name",
            "is_active",
            "employee_detail",
            "profile_picture",
        ]

    def validate_email(self, value):
        """
        Validate that the email is properly formatted using a stricter regex pattern.
        """
        try:
            valid = validate_email(value, check_deliverability=True)
            value = valid.email  # Replace with the normalized form
        except EmailNotValidError:
            raise serializers.ValidationError("Enter a valid email.")

        user_id = self.instance.id if self.instance else None
        if CustomUser.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("This email is already in use.")

        return value

    def create(self, validated_data):
        employee_detail_data = validated_data.pop("employee_detail")
        employee_id = employee_detail_data.get("employee_id")
        profile_picture = validated_data.pop("profile_picture", None)

        if EmployeeDetail.objects.filter(employee_id=employee_id).exists():
            raise ValidationError({"error": "An employee with this ID already exists."})
        role = validated_data.get("role", "worker")
        password = generate_password()

        # Create the user
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=password,
            role=role,
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            is_active=validated_data.get("is_active", True),
        )

        UserProfile.objects.create(user=user, profile_picture=profile_picture)
        # Create the associated EmployeeDetail
        try:
            EmployeeDetail.objects.create(
                user=user,
                employee_id=employee_detail_data["employee_id"],
                hiring_date=employee_detail_data["hiring_date"],
                shift=employee_detail_data["shift"],
                address=employee_detail_data["address"],
                city=employee_detail_data["city"],
                zip_code=employee_detail_data["zip_code"],
                country=employee_detail_data["country"],
                state=employee_detail_data["state"],
                contact_no=employee_detail_data["contact_no"],
                job_type=employee_detail_data["job_type"],
            )
        except Exception as e:
            return user, f"Failed to created employee: {str(e)}"

        try:
            send_reset_email(validated_data["email"], password)
        except Exception as e:
            return user, f"User created but failed to send email: {str(e)}"

        return user, True

    def update(self, instance, validated_data):
        employee_detail_data = validated_data.pop("employee_detail", None)

        # Update CustomUser fields
        instance.email = validated_data.get("email", instance.email)
        instance.role = validated_data.get("role", instance.role)
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.is_active = validated_data.get("is_active", instance.is_active)
        instance.save()

        # Update EmployeeDetail fields if provided
        if employee_detail_data:
            employee_detail = EmployeeDetail.objects.get(user=instance)
            employee_detail.employee_id = employee_detail_data.get(
                "employee_id", employee_detail.employee_id
            )
            employee_detail.hiring_date = employee_detail_data.get(
                "hiring_date", employee_detail.hiring_date
            )
            employee_detail.shift = employee_detail_data.get(
                "shift", employee_detail.shift
            )
            employee_detail.address = employee_detail_data.get(
                "address", employee_detail.address
            )
            employee_detail.city = employee_detail_data.get(
                "city", employee_detail.city
            )
            employee_detail.zip_code = employee_detail_data.get(
                "zip_code", employee_detail.zip_code
            )
            employee_detail.country = employee_detail_data.get(
                "country", employee_detail.country
            )
            employee_detail.contact_no = employee_detail_data.get(
                "contact_no", employee_detail.contact_no
            )
            employee_detail.state = employee_detail_data.get(
                "state", employee_detail.state
            )
            employee_detail.state = employee_detail_data.get(
                "job_type", employee_detail.job_type
            )
            employee_detail.save()

        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        logger.info(f"email:{email}")
        logger.info(f"password:{password}")
        user = authenticate(email=email, password=password)

        logger.info(f"user:{user}")
        if user is None:
            logger.error(f"inside the user check:{user}")
            raise serializers.ValidationError("Invalid email or password")

        return {"user": user}

    def get_token(self, user):
        logger.info(f"refresh:{user}")
        refresh = RefreshToken.for_user(user)
        logger.info(f"refresh:{refresh}")

        # Fetch the user's profile if it exists
        user_profile = getattr(user, "profile", None)

        return {
            "id": str(user.id),
            "email": str(user.email),
            "role": str(user.role),
            "first_name": str(user.first_name),
            "last_name": str(user.last_name),
            "profile": (
                {
                    "profile_picture": (
                        user_profile.profile_picture.url
                        if user_profile and user_profile.profile_picture
                        else None
                    ),
                    "bio": user_profile.bio if user_profile else None,
                    "phone_number": user_profile.phone_number if user_profile else None,
                }
                if user_profile
                else None
            ),
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)


class NewPasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)


class ResetOtpPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(required=True)
    # new_password = serializers.CharField(write_only=True)


class AccEmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # Check if an OTP for this email already exists and is valid
        otp_instance = VerifyEmailOTP.objects.filter(email=value, is_valid=True).first()
        if not otp_instance:
            raise serializers.ValidationError("No valid OTP found for this email.")
        return value


class SendOTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerifyEmailOTP
        fields = ["email"]

    def create(self, validated_data):
        email = validated_data["email"]
        VerifyEmailOTP.objects.filter(email=email).delete()
        otp_instance, created = VerifyEmailOTP.objects.get_or_create(email=email)

        if created:
            otp_instance.generate_otp()

        subject = "Your Email Verification OTP"
        from_email = settings.EMAIL_HOST_USER
        context = {"otp": otp_instance.otp}
        message = render_to_string("emails/otp_verification.html", context)
        try:
            send_mail(
                subject,
                "",
                from_email,
                [email],
                html_message=message,
            )
        except Exception:
            raise serializers.ValidationError(
                "Failed to send OTP. Please try again later."
            )

        return otp_instance


class UserUpdateSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(
        source="profile.profile_picture", required=False
    )
    # address = serializers.CharField(source="employee_detail.address", required=False)
    # contact_no = serializers.CharField(
    #     source="employee_detail.contact_no", required=False
    # )
    address = serializers.SerializerMethodField()
    contact_no = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "first_name",
            "last_name",
            "email",
            "profile_picture",
            "address",
            "contact_no",
        ]
        read_only_fields = ["email", "role"]

    def get_address(self, obj):
        return getattr(obj, "employee_detail", None) and obj.employee_detail.address

    def get_contact_no(self, obj):
        return getattr(obj, "employee_detail", None) and obj.employee_detail.contact_no

    def update(self, instance, validated_data):
        """
        Custom update method to handle profile picture and EmployeeDetail separately.
        """
        profile_data = validated_data.pop("profile", {}).get("profile_picture", None)
        address = validated_data.pop(
            "address", self.context["request"].data.get("address", None)
        )
        contact_no = validated_data.pop(
            "contact_no", self.context["request"].data.get("contact_no", None)
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if profile_data:
            print(f"Updating Profile Picture: {profile_data}")
            profile.profile_picture = profile_data
            profile.save()

        instance.save()

        try:
            employee_detail = EmployeeDetail.objects.get(user=instance)
        except EmployeeDetail.DoesNotExist:
            print(f"Creating EmployeeDetail for user {instance.email}")
            employee_detail = EmployeeDetail.objects.create(
                user=instance, hiring_date=now().date()
            )

        print(f"Employee Detail Retrieved: {employee_detail},", address)

        if address:
            print(f"Updating address: {address}")
            employee_detail.address = address

        if contact_no:
            print(f"Updating contact_no: {contact_no}")
            employee_detail.contact_no = contact_no

        if not employee_detail.hiring_date:
            employee_detail.hiring_date = now().date()
            print(f"Setting hiring_date to: {employee_detail.hiring_date}")

        employee_detail.save()

        return instance
