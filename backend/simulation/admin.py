from django.contrib import admin
from .models import SimulationEmail, SimulationResult, QuizQuestion, QuizSubmission

admin.site.register(SimulationEmail)
admin.site.register(SimulationResult)
admin.site.register(QuizQuestion)
admin.site.register(QuizSubmission)