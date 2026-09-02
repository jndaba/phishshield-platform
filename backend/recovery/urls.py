from django.urls import path
from .views import RecoveryGuideListCreateView, RecoveryGuideDetailView

urlpatterns = [
    path('guides/', RecoveryGuideListCreateView.as_view(), name='recovery_guides'),
    path('guides/<int:pk>/', RecoveryGuideDetailView.as_view(), name='recovery_guide_detail'),
]