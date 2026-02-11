from rest_framework import serializers
from .models import Project, Objective


class ProjectSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'color', 'icon', 'is_active', 'stats', 'created_at', 'updated_at']

    def get_stats(self, obj):
        return obj.get_stats()


class ObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objective
        fields = ['id', 'project', 'title', 'description', 'deadline', 'status', 'created_at', 'updated_at']
