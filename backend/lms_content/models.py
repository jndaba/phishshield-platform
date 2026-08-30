from django.db import models
from django.contrib.auth.models import User

class LearningModule(models.Model):
    module_number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default="Social Engineering")
    description = models.TextField()
    rich_content = models.TextField(default="", blank=True, help_text="Full markdown or HTML content for the module lesson.")
    featured_image = models.ImageField(upload_to='learning_images/', null=True, blank=True)
    video_url = models.URLField(null=True, blank=True, help_text="YouTube or direct MP4 video embed link")
    document = models.FileField(upload_to='learning_docs/', null=True, blank=True)
    estimated_read_time = models.CharField(max_length=20, default="8 mins")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['module_number']

    def __str__(self):
        return f"Module {self.module_number}: {self.title}"

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'module')