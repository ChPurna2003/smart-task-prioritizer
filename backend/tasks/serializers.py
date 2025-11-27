from rest_framework import serializers


class TaskInputSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    importance = serializers.IntegerField(required=False, allow_null=True)
    estimated_hours = serializers.IntegerField(required=False, allow_null=True)
    due_date = serializers.DateField(required=False, allow_null=True)
    dependencies = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
