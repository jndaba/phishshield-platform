from django.urls import path
from .views import ModuleListCreateView, ModuleDetailView, UserProgressUpdateView, AdminUserListView

urlpatterns = [
    path('modules/', ModuleListCreateView.as_view(), name='module_list'),
    path('modules/<int:pk>/', ModuleDetailView.as_view(), name='module_detail'),
    path('modules/<int:module_id>/progress/', UserProgressUpdateView.as_view(), name='module_progress'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users_list'),
]