import uuid
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_admin = models.BooleanField(default=False)
    readiness_score = models.IntegerField(default=68)
    simulations_completed = models.IntegerField(default=0)
    streak_days = models.IntegerField(default=1)
    reset_password_token = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {'Admin' if self.is_admin else 'Learner'}"

class ActivityAudit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    activity_type = models.CharField(max_length=50)  # 'url_scan', 'simulation', 'module', 'account'
    risk_score = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Activity Audits'

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"

class PlatformContact(models.Model):
    name = models.CharField(max_length=150, default="Joel Ndaba")
    phone = models.CharField(max_length=50, default="+254721952909")
    email = models.EmailField(default="support@iconscomputerschool.co.ke")
    institution = models.CharField(max_length=200, default="Icons Computer School and Cyber")
    office_location = models.CharField(max_length=200, default="Nairobi, Kenya")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.phone}"    