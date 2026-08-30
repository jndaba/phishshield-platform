from django.db import models
from django.contrib.auth.models import User

class SimulationEmail(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    sender_name = models.CharField(max_length=150)
    sender_email = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    body_html = models.TextField()
    is_phishing = models.BooleanField(default=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    clues = models.TextField(help_text="Key red flags to look out for in this email.")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} ({'Phishing' if self.is_phishing else 'Legitimate'})"

class SimulationResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='simulation_results')
    email = models.ForeignKey(SimulationEmail, on_delete=models.CASCADE)
    user_action = models.CharField(max_length=20)  # 'reported_phishing' or 'marked_safe'
    is_correct = models.BooleanField()
    time_taken_seconds = models.IntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

class QuizQuestion(models.Model):
    question = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1)  # 'A', 'B', 'C', or 'D'
    explanation = models.TextField()

class QuizSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_submissions')
    score = models.IntegerField()
    total_questions = models.IntegerField()
    passed = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)