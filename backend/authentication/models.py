from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_admin = models.BooleanField(default=False)
    readiness_score = models.IntegerField(default=0)
    simulations_completed = models.IntegerField(default=0)
    streak_days = models.IntegerField(default=1)
    reset_password_token = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} (Admin: {self.is_admin})"


class ActivityAudit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audit_logs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    activity_type = models.CharField(max_length=50, default="general")
    risk_score = models.CharField(max_length=20, default="LOW")
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class PlatformContact(models.Model):
    name = models.CharField(max_length=150, default="Joel Ndaba")
    role = models.CharField(max_length=150, default="Lead Cybersecurity Coordinator")
    phone = models.CharField(max_length=50, default="+25421952909")
    email = models.EmailField(default="joelndaba24@gmail.com")
    office_location = models.CharField(max_length=200, default="Icons Cyber Lab, Block B, Room 204")
    institution = models.CharField(max_length=200, default="Icons Computer School and Cyber")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.role})"