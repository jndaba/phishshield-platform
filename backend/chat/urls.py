from django.urls import path
from .views import ChatThreadView

urlpatterns = [
    path('', ChatThreadView.as_view(), name='chat_thread'),
]