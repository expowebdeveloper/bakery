from django.utils import timezone
from rest_framework import serializers

from account.models import CustomUser
from orders.models import Order, OrderStatus
from todos.models import Task


class TodoOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "email",
            "contact_number",
            "address",
            "total_amount",
            "final_amount",
            "shipping_fee",
            "status",
            "total_with_vat",
            "updated_at",
            "order_id",
            "platform_fee",
            "packing_fee",
            "created_at",
            "vat_amount",
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Convert the status key to its corresponding value
        status_str = dict(OrderStatus.choices()).get(instance.status, instance.status)
        representation["status"] = status_str

        return representation


class TaskGetSerializer(serializers.ModelSerializer):
    order_task = TodoOrderSerializer(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.assigned_to:
            employee = getattr(instance.assigned_to, "employee_detail", None)
            employee_id = employee.employee_id if employee else None
            representation["assigned_to"] = {
                "id": instance.assigned_to.id,
                "email": instance.assigned_to.email,
                "first_name": instance.assigned_to.first_name,
                "last_name": instance.assigned_to.last_name,
                "employee_id": employee_id,
            }
        if instance.owner:
            employee = getattr(instance.assigned_to, "employee_detail", None)
            employee_id = employee.employee_id if employee else None
            representation["owner"] = {
                "id": instance.owner.id,
                "email": instance.owner.email,
                "first_name": instance.owner.first_name,
                "last_name": instance.owner.last_name,
                "employee_id": employee_id,
            }
        return representation


class TaskSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.email")
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), allow_null=True, required=False
    )
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=True)
    task_id = serializers.ReadOnlyField()
    order_task = TodoOrderSerializer(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "task_id",
            "title",
            "description",
            "assigned_to",
            "owner",
            "priority",
            "start_date",
            "end_date",
            "notes",
            "status",
            "created_at",
            "order_task",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.assigned_to:
            representation["assigned_to"] = {
                "id": instance.assigned_to.id,
                "email": instance.assigned_to.email,
                "first_name": instance.assigned_to.first_name,
                "last_name": instance.assigned_to.last_name,
            }
        if instance.owner:
            representation["owner"] = {
                "id": instance.owner.id,
                "email": instance.owner.email,
                "first_name": instance.owner.first_name,
                "last_name": instance.owner.last_name,
            }
        return representation

    def create(self, validated_data):
        task_obj = Task.objects.order_by("-created_at").first()

        if task_obj is None:
            task_id = "TASK-1"
        else:
            last_idx = task_obj.task_id
            print(f"last_idx: {last_idx}")
            if "-" in last_idx:
                idx = last_idx.split("-")[1]
                next_idx = int(idx) + 1
            else:
                next_idx = 1
            next_id = f"TASK-{next_idx}"
            task_id = next_id

        task = Task.objects.create(task_id=task_id, **validated_data)
        return task

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        if start_date and end_date:
            if not start_date:
                start_date = timezone.now().date()
                attrs["start_date"] = start_date

            if end_date < start_date:
                raise serializers.ValidationError(
                    "End date can't be less then the start date."
                )

        return attrs
