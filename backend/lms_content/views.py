from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import LearningModule, UserProgress
from .serializers import LearningModuleSerializer, UserProgressSerializer, AdminUserManagementSerializer

class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = LearningModule.objects.all().order_by('-created_at')
    serializer_class = LearningModuleSerializer
    permission_classes = [permissions.AllowAny]  # Adjust to IsAdminUser for strict admin publishing

class UserProgressUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        module = LearningModule.objects.get(id=module_id)
        progress, _ = UserProgress.objects.get_or_create(user=request.user, module=module)
        progress.completed = request.data.get('completed', True)
        progress.score = request.data.get('score', progress.score)
        progress.save()
        return Response({'status': 'progress updated', 'completed': progress.completed})

class AdminUserListView(generics.ListAPIView):
    """Allows administrators to monitor and view registered users and their progress metrics."""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserManagementSerializer
    permission_classes = [permissions.AllowAny]  # Use permissions.IsAdminUser in production