from django.db import models
from django.contrib.auth.models import User

class LearningModule(models.Model):
    module_number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='Foundations')
    description = models.TextField(blank=True, default='')
    rich_content = models.TextField(blank=True, default='')
    video_url = models.URLField(max_length=500, blank=True, default='')
    image_url = models.URLField(max_length=500, blank=True, default='')
    document = models.FileField(upload_to='module_docs/', null=True, blank=True)
    estimated_read_time = models.CharField(max_length=50, default='12 mins')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['module_number']

    def __str__(self):
        return f"Module {self.module_number}: {self.title}"


class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lms_progress')
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE, related_name='user_progress')
    completed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'module')

    def __str__(self):
        status = 'Done' if self.completed else 'Pending'
        return f"{self.user.username} - {self.module.title} ({status})"


class IncidentGuide(models.Model):
    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical Priority'),
        ('HIGH', 'High Priority'),
        ('MEDIUM', 'Medium Priority'),
        ('LOW', 'Low Priority'),
    ]

    title = models.CharField(max_length=255)
    threat_category = models.CharField(max_length=100, default='General Threat')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='HIGH')
    summary = models.TextField(blank=True, default='')
    immediate_steps = models.TextField(
        blank=True, 
        default='',
        help_text="Step-by-step containment instructions separated by newlines or markdown numbers."
    )
    containment_checklist = models.TextField(
        blank=True,
        default='',
        help_text="Key recovery checks separated by newlines."
    )
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="authored_guides")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.title}"