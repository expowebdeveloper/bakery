from django.contrib import admin

from account.models import (
    CustomUser,
    EmployeeDetail,
    PasswordResetOTP,
    RegistrationToken,
    UserProfile,
    VerifyEmailOTP,
)

admin.site.register(CustomUser)
admin.site.register(PasswordResetOTP)
admin.site.register(EmployeeDetail)
admin.site.register(VerifyEmailOTP)
admin.site.register(UserProfile)


@admin.register(RegistrationToken)
class RegistrationTokenAdmin(admin.ModelAdmin):
    list_display = ("token", "created_at", "expires_at")
    readonly_fields = ("token", "created_at", "expires_at")
