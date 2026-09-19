from django.urls import path
from .views import (
    ModuleListCreateView,
    ModuleDetailView,
    UserProgressUpdateView,
    AdminUserListView,
    IncidentGuideListCreateView,
    IncidentGuideDetailView,
)

urlpatterns = [
    # Learning Modules & Progress
    path('modules/', ModuleListCreateView.as_view(), name='module_list'),
    path('modules/<int:pk>/', ModuleDetailView.as_view(), name='module_detail'),
    path('modules/<int:module_id>/progress/', UserProgressUpdateView.as_view(), name='module_progress'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users_list'),

    # Incident Recovery Guides (Learner & Admin Access)
    path('incident-guides/', IncidentGuideListCreateView.as_view(), name='incident_guides_list_create'),
    path('incident-guides/<int:guide_id>/', IncidentGuideDetailView.as_view(), name='incident_guide_detail'),
]