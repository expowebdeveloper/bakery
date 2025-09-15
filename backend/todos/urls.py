from django.urls import path

from todos.views import (
    AllTaskListCreateAPIView,
    TaskDetailAPIView,
    TaskListCreateAPIView,
    TaskUsersListAPIView,
)

urlpatterns = [
    path("all-tasks/", AllTaskListCreateAPIView.as_view(), name="all-tasks"),
    path("tasks/", TaskListCreateAPIView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", TaskDetailAPIView.as_view(), name="task-detail"),
    path("employee-list/", TaskUsersListAPIView.as_view(), name="employee-list"),
]
