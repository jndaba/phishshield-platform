from django.contrib import admin
from .models import SimulationScenario, SimulationResult, QuizQuestion, QuizSubmission


@admin.register(SimulationScenario)
class SimulationScenarioAdmin(admin.ModelAdmin):
    list_display = ('scenario_number', 'subject', 'sender_email', 'threat_category', 'is_phishing', 'created_at')
    list_filter = ('is_phishing', 'threat_category')
    search_fields = ('subject', 'sender_display_name', 'sender_email', 'detailed_explanation')
    ordering = ('scenario_number',)


@admin.register(SimulationResult)
class SimulationResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'scenario', 'user_choice_is_phishing', 'is_correct', 'attempted_at')
    list_filter = ('is_correct', 'user_choice_is_phishing', 'attempted_at')
    search_fields = ('user__username', 'scenario__subject')
    ordering = ('-attempted_at',)


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question_text', 'correct_option', 'created_at')
    search_fields = ('question_text', 'explanation')


@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'total_questions', 'passed', 'submitted_at')
    list_filter = ('passed', 'submitted_at')
    search_fields = ('user__username',)
    ordering = ('-submitted_at',)