from django.core.management.base import BaseCommand
from django.utils.timezone import now

from account.models import CustomUser, EmployeeDetail


class Command(BaseCommand):
    help = "Create an admin user and its EmployeeDetail"

    def handle(self, *args, **kwargs):
        email = "services@rexett.com"
        password = "4=F2f&Y5v4i6"

        # Create or update the admin user
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                "first_name": "Admin",
                "last_name": "User",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Admin user created: {email}"))
        else:
            # Update role if user exists but has a different role
            if user.role != "admin":
                user.role = "admin"
                user.is_admin = True
                user.is_staff = True
                user.is_superuser = True
                user.save()
                self.stdout.write(
                    self.style.WARNING(f"Existing user updated to admin role: {email}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Admin user already exists: {email}")
                )

        # Ensure EmployeeDetail is created for the admin
        employee_detail, emp_created = EmployeeDetail.objects.get_or_create(
            user=user,
            defaults={
                "employee_id": "EMP001",
                "hiring_date": now().date(),
                "contact_no": "1234567890",
                "address": "Admin Address",
                "city": "Stockholm",
                "state": "Stockholm",
                "zip_code": "11111",
                "status": "active",
                "job_type": "FT",
            },
        )

        if emp_created:
            self.stdout.write(self.style.SUCCESS("EmployeeDetail created for Admin"))
        else:
            self.stdout.write(
                self.style.WARNING("EmployeeDetail already exists for Admin")
            )
