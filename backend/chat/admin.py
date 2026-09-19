from django.contrib import admin
from .models import SupportTicketMessage


@admin.register(SupportTicketMessage)
class SupportTicketMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'recipient', 'category', 'subject', 'is_read', 'created_at')
    list_filter = ('category', 'is_read', 'created_at')
    search_fields = ('sender__username', 'recipient__username', 'subject', 'message')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)