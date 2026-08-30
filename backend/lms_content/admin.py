from django.contrib import admin
from .models import LearningModule, UserProgress

admin.site.register(LearningModule)
admin.site.register(UserProgress)