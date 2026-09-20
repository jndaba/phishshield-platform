from django.urls import path
from .views import ChatThreadView, UnreadMessageCountView

urlpatterns = [
    path('thread/', ChatThreadView.as_view(), name='chat_thread'),
    path('unread-count/', UnreadMessageCountView.as_view(), name='chat_unread_count'),
]