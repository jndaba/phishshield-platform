from django.urls import path
from .views import (
    RegisterView, LoginView, RequestPasswordResetView,
    ResetPasswordConfirmView, CurrentUserStatsView, AdminMetricsView,
    PlatformContactView, AdminAllUsersListView, AdminUserDetailManageView # <--- Added
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('password-reset/', RequestPasswordResetView.as_view(), name='password_reset'),
    path('password-reset/confirm/', ResetPasswordConfirmView.as_view(), name='password_reset_confirm'),
    path('user-stats/', CurrentUserStatsView.as_view(), name='user_stats'),
    path('admin-metrics/', AdminMetricsView.as_view(), name='admin_metrics'),
    path('contact/', PlatformContactView.as_view(), name='platform_contact'),  # <--- Added
    path('manage/users/', AdminAllUsersListView.as_view(), name='admin_all_users'),
    path('manage/users/<int:user_id>/', AdminUserDetailManageView.as_view(), name='admin_user_detail_manage'),
]