from rest_framework import serializers
from .models import SimulationEmail, SimulationResult

class SimulationEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationEmail
        fields = '__all__'

class SimulationResultSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email_subject = serializers.CharField(source='email.subject', read_only=True)

    class Meta:
        model = SimulationResult
        fields = ['id', 'user', 'username', 'email', 'email_subject', 'user_action', 'is_correct', 'time_taken_seconds', 'completed_at']