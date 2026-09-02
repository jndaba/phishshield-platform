from rest_framework import serializers
from .models import LearningModule, UserProgress
from django.contrib.auth.models import User

class LearningModuleSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()

    class Meta:
        model = LearningModule
        fields = [
            'id', 
            'module_number', 
            'title', 
            'category', 
            'description', 
            'rich_content', 
            'featured_image', 
            'video_url', 
            'document', 
            'estimated_read_time', 
            'is_published', 
            'completed'
        ]

    def get_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserProgress.objects.filter(user=request.user, module=obj).first()
            return progress.completed if progress else False
        return False

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'

class AdminUserManagementSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(source='profile.is_admin', read_only=True)
    readiness_score = serializers.IntegerField(source='profile.readiness_score', read_only=True)
    streak_days = serializers.IntegerField(source='profile.streak_days', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'is_admin', 'readiness_score', 'streak_days']