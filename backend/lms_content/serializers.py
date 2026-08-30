from rest_framework import serializers
from .models import LearningModule, UserProgress
from django.contrib.auth.models import User

class LearningModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningModule
        fields = '__all__'

class UserProgressSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'username', 'module', 'module_title', 'completed', 'score', 'updated_at']

class AdminUserManagementSerializer(serializers.ModelSerializer):
    progress = UserProgressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'date_joined', 'progress']