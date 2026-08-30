from django.urls import path
from .views import (
    RegisterView, LoginView, RequestPasswordResetView,
    ResetPasswordConfirmView, CurrentUserStatsView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('password-reset/', RequestPasswordResetView.as_view(), name='password_reset'),
    path('password-reset/confirm/', ResetPasswordConfirmView.as_view(), name='password_reset_confirm'),
    path('user-stats/', CurrentUserStatsView.as_view(), name='user_stats'),
]