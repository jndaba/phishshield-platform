from django.db import models

class RecoveryGuide(models.Model):
    PLATFORM_CHOICES = [
        ('google', 'Google / Gmail'),
        ('microsoft', 'Microsoft 365 / Outlook'),
        ('social', 'Social Media (Instagram / WhatsApp)'),
        ('bank', 'Banking & Mobile Money (M-Pesa / Cards)'),
    ]
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    step_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    action_text = models.TextField()
    visual_diagram = models.ImageField(upload_to='recovery_visuals/', null=True, blank=True)
    emergency_url = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ['platform', 'step_number']