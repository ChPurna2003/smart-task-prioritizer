from rest_framework import serializers


class TaskInputSerializer(serializers.Serializer):
    """
    One task coming from the frontend.
    """
    id = serializers.CharField()
    title = serializers.CharField()
    due_date = serializers.DateField(required=False, allow_null=True)
    estimated_hours = serializers.FloatField(required=False, allow_null=True)
    importance = serializers.IntegerField(min_value=1, max_value=10)
    dependencies = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
