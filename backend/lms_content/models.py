from django.db import models
from django.contrib.auth.models import User


class LearningModule(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, default="Phishing Fundamentals")
    duration_minutes = models.IntegerField(default=15)
    content_body = models.TextField(blank=True, default="")
    order = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order}. {self.title}"


class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lms_progress")
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE, related_name="learner_records")
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'module')

    def __str__(self):
        return f"{self.user.username} - {self.module.title} ({'Done' if self.completed else 'Pending'})"


class IncidentGuide(models.Model):
    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical Priority'),
        ('HIGH', 'High Priority'),
        ('MEDIUM', 'Medium Priority'),
        ('LOW', 'Low Priority'),
    ]

    title = models.CharField(max_length=255)
    threat_category = models.CharField(max_length=100, default="Credential Phishing")
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='HIGH')
    summary = models.TextField()
    immediate_steps = models.TextField(
        help_text="Step-by-step containment instructions separated by newlines or markdown numbers."
    )
    containment_checklist = models.TextField(
        blank=True,
        default="",
        help_text="Key recovery checks separated by newlines."
    )
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="authored_guides")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.severity}] {self.title}"