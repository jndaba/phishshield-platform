from django.contrib import admin
from .models import UserProfile, ActivityAudit

admin.site.register(UserProfile)
admin.site.register(ActivityAudit)