from django.db import models
from django.contrib.auth.models import User

class LearningModule(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    document = models.FileField(upload_to='learning_docs/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='learning_covers/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)