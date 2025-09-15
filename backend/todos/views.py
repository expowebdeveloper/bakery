from django.db.models import Case, Q, Value, When
from django.db.models.functions import Concat
from django.http import Http404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from account.models import CustomUser
from account.permissions import AllowGetOnlyIsAdminStockWorker, IsAdmin
from account.serializers import UserDetailSerializer
from todos.models import Task, TaskStatus
from todos.serializers import TaskGetSerializer, TaskSerializer


class AllTaskListCreateAPIView(APIView):

    permission_classes = [AllowGetOnlyIsAdminStockWorker]
    authentication_classess = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        tasks = (
            Task.objects.select_related("order_task")
            .all()
            .exclude(status=[TaskStatus.COMPLETED, TaskStatus.CANCELED])
        )
        sort_by = request.query_params.get("sort_by", "asc")
        search = request.query_params.get("search")

        if search:
            tasks = tasks.annotate(
                full_name=Concat(
                    "assigned_to__first_name", Value(" "), "assigned_to__last_name"
                )
            ).filter(
                Q(task_id__iregex=search)
                | Q(assigned_to__first_name__iregex=search)
                | Q(full_name__regex=search)
                | Q(status__iregex=search)
                | Q(priority__iregex=search)
                | Q(title__iregex=search)
            )
        if sort_by == "asc":
            tasks = tasks.order_by("-created_at")
        elif sort_by == "desc":
            tasks = tasks.order_by("created_at")
        elif sort_by == "end_date":
            tasks = tasks.order_by("end_date")
        elif sort_by == "-end_date":
            tasks = tasks.order_by("-end_date")
        elif sort_by == "title":
            tasks = tasks.order_by("title")
        elif sort_by == "-title":
            tasks = tasks.order_by("-title")
        elif sort_by == "priority":
            tasks = tasks.order_by(
                Case(
                    When(priority="high", then=Value(1)),
                    When(priority="medium", then=Value(2)),
                    When(priority="low", then=Value(3)),
                )
            )
        elif sort_by == "-priority":
            tasks = tasks.order_by(
                Case(
                    When(priority="high", then=Value(1)),
                    When(priority="medium", then=Value(2)),
                    When(priority="low", then=Value(3)),
                ).desc()
            )
        paginator = self.pagination_class()
        paginated_tasks = paginator.paginate_queryset(tasks, request, view=self)
        serializer = TaskGetSerializer(paginated_tasks, many=True)

        return paginator.get_paginated_response(serializer.data)


class TaskListCreateAPIView(APIView):

    permission_classes = [AllowGetOnlyIsAdminStockWorker]
    authentication_classess = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        tasks = Task.objects.filter(owner=request.user) | Task.objects.filter(
            assigned_to=request.user
        ).exclude(status__in=[TaskStatus.COMPLETED, TaskStatus.CANCELED])
        tasks = tasks.order_by("-created_at")
        # Search by task ID
        sort_by = request.query_params.get("sort_by", "asc")
        search = request.query_params.get("search")

        if search:
            tasks = tasks.annotate(
                full_name=Concat(
                    "assigned_to__first_name", Value(" "), "assigned_to__last_name"
                )
            ).filter(
                Q(task_id__iregex=search)
                | Q(assigned_to__first_name__iregex=search)
                | Q(assigned_to__last_name__iregex=search)
                | Q(full_name__icontains=search)
                | Q(status__iregex=search)
            )
        if sort_by == "asc":
            tasks = tasks.order_by("-created_at")
        else:
            tasks = tasks.order_by("created_at")
        # Pagination
        paginator = self.pagination_class()
        paginated_tasks = paginator.paginate_queryset(tasks, request, view=self)

        # Serialize data
        serializer = TaskGetSerializer(paginated_tasks, many=True)

        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(request_body=TaskSerializer)
    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailAPIView(APIView):
    permission_classes = [AllowGetOnlyIsAdminStockWorker]
    authentication_classess = [JWTAuthentication]

    def get_object(self, pk, user):
        try:
            task = Task.objects.get(pk=pk)
            if task.owner == user or task.assigned_to == user:
                return task
            else:
                raise Http404
        except Task.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        task = self.get_object(pk, request.user)
        serializer = TaskSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=TaskSerializer)
    def patch(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response(
                {"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = self.get_object(pk, request.user)
        if task.owner == request.user:
            task.delete()
        else:
            return Response(
                {"error": "You Does not have permission to delete the task."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class TaskUsersListAPIView(APIView):
    permission_classes = [IsAdmin]
    authentication_classess = [JWTAuthentication]
    pagination_class = PageNumberPagination

    def get(self, request):
        try:
            employee_list = CustomUser.objects.filter(
                role__in=["worker", "stock_manager", "accountant"]
            ).order_by("-created_at")
            serializer = UserDetailSerializer(employee_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return Response(status=status.HTTP_204_NO_CONTENT)
