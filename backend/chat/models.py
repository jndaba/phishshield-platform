from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class SupportTicketMessage(models.Model):
    CATEGORY_CHOICES = [
        ('PHISHING_URL', 'Phishing URL Analysis'),
        ('CREDENTIAL_LEAK', 'Compromised Credentials'),
        ('MALICIOUS_EMAIL', 'Suspicious Email Attachment'),
        ('SYSTEM_INQUIRY', 'General System / Curriculum Query'),
    ]

    sender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='sent_support_messages'
    )
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='received_support_messages'
    )
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='PHISHING_URL'
    )
    subject = models.CharField(
        max_length=200, 
        blank=True, 
        default="Security Incident Inquiry"
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.category}] {self.sender.username} -> {self.recipient.username}: {self.message[:30]}"