from rest_framework import serializers
from .models import RecoveryGuide

class RecoveryGuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecoveryGuide
        fields = '__all__'