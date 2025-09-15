from rest_framework.permissions import BasePermission


class AllowGetOnlyIsAdminStockManager(BasePermission):
    def has_permission(self, request, view):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True
        else:
            if not request.user or not request.user.is_authenticated:
                return False
            return request.user.is_superuser or request.user.role == "stock_manager"


class AllowGetOnlyIsAdminStockWorker(BasePermission):
    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser
            or request.user.role == "stock_manager"
            or request.user.role == "accountant"
        )


class IsBakery(BasePermission):
    """
    Custom permission to only allow users with the role 'bakery' to access the view.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == "bakery"


class IsAdmin(BasePermission):
    """
    Custom permission to only allow users with the role 'admin' to access the view.

    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser


class IsAccountant(BasePermission):
    """
    Custom permission to only allow users with the role 'bakery' to access the view.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Check if the user is a super admin
        if request.user.is_superuser:
            return True

        # Check if the user has the 'admin' role
        return request.user.role == "accountant"


class IsAccountantBakeryAdminStockManager(BasePermission):
    """
    Custom permission to only allow users with the role 'bakery' to access the view.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Check if the user is a super admin
        if request.user.is_superuser:
            return True

        # Check if the user has the 'admin' role
        return (
            request.user.role == "accountant"
            or request.user.role == "stock_manager"
            or request.user.role == "bakery"
        )
