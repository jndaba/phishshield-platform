from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    RequestPasswordResetView,
    ResetPasswordConfirmView,
    CurrentUserStatsView,
    AdminMetricsView,
    ActiveAdminListView,
    PlatformContactView,
    PlatformContactDetailView,
    AdminAllUsersListView,
    AdminUserDetailManageView,
    UserProfileUpdateView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('password-reset/request/', RequestPasswordResetView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', ResetPasswordConfirmView.as_view(), name='password-reset-confirm'),
    path('user-stats/', CurrentUserStatsView.as_view(), name='user-stats'),
    path('admin-metrics/', AdminMetricsView.as_view(), name='admin-metrics'),
    path('admins/active/', ActiveAdminListView.as_view(), name='active-admins-list'),
    path('contact/', PlatformContactView.as_view(), name='platform-contact'),
    path('contact/<int:contact_id>/', PlatformContactDetailView.as_view(), name='platform-contact-detail'),
    path('manage/users/', AdminAllUsersListView.as_view(), name='admin-all-users'),
    path('manage/users/<int:user_id>/', AdminUserDetailManageView.as_view(), name='admin-user-detail'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='user-profile-update'),
]