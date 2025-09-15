from enum import Enum

from django.db import models

from account.models import BaseModel, CustomUser
from orders.models import Order


class PriorityLevel(Enum):
    HIGH = "high"
    LOW = "low"
    MEDIUM = "medium"
    UNASSIGNED = "unassigned"

    @classmethod
    def choices(cls):
        return [
            (status.value, status.name.replace("_", " ").capitalize()) for status in cls
        ]


class TaskStatus(Enum):
    UNASSIGNED = "unassigned"
    ASSIGNED = "assigned"
    INPROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELED = "canceled"
    NOTSTARTED = "not_started"
    HOLD = "hold"

    @classmethod
    def choices(cls):
        return [
            (status.value, status.name.replace("_", " ").capitalize()) for status in cls
        ]


class Task(BaseModel):
    task_id = models.CharField(max_length=100, unique=True, blank=False)
    title = models.CharField(max_length=255)
    description = models.TextField()

    assigned_to = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tasks_assigned",
    )
    owner = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="tasks_owned"
    )

    priority = models.CharField(
        max_length=200,
        choices=PriorityLevel.choices(),
        default=PriorityLevel.UNASSIGNED.value,
    )
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=200,
        choices=TaskStatus.choices(),
        default=TaskStatus.UNASSIGNED.value,
    )
    order_task = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="tasks",
        null=True,
        blank=True,
    )

    def __str__(self) -> str:
        return f"{self.title} assigned to \
            {self.assigned_to.first_name if self.assigned_to else 'N/A'} \
            - status {self.status}"
