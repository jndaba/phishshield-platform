from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class SimulationScenario(models.Model):
    scenario_number = models.IntegerField(unique=True)
    sender_display_name = models.CharField(max_length=200)
    sender_email = models.EmailField()
    recipient_email = models.EmailField(default="learner@phishshield.internal")
    subject = models.CharField(max_length=255)
    sent_time_display = models.CharField(max_length=100, default="Today at 09:15 AM")
    body_html = models.TextField()
    is_phishing = models.BooleanField(default=True)
    threat_category = models.CharField(max_length=100, default="Credential Harvesting")
    detailed_explanation = models.TextField(
        help_text="Detailed security breakdown explaining RFC indicators, domain analysis, and psychological vectors."
    )
    key_indicators = models.TextField(
        help_text="Key bullet points separated by newlines showing exact indicators."
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['scenario_number']

    def __str__(self):
        status_label = "MALICIOUS" if self.is_phishing else "SAFE"
        return f"[{self.scenario_number}] [{status_label}] {self.subject}"


# Backwards compatibility alias for older references to SimulationEmail
SimulationEmail = SimulationScenario


class SimulationResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='simulation_results')
    scenario = models.ForeignKey(
        SimulationScenario, 
        on_delete=models.CASCADE, 
        related_name='submissions',
        null=True,
        blank=True
    )
    user_choice_is_phishing = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'scenario')
        ordering = ['-attempted_at']

    def __str__(self):
        status_text = "PASSED" if self.is_correct else "FAILED"
        scenario_num = self.scenario.scenario_number if self.scenario else "N/A"
        return f"{self.user.username} - Scenario {scenario_num}: {status_text}"


class QuizQuestion(models.Model):
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')],
        default='A'
    )
    explanation = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Question: {self.question_text[:50]}..."


class QuizSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_submissions')
    score = models.IntegerField()
    total_questions = models.IntegerField(default=10)
    passed = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} Quiz: {self.score}/{self.total_questions} ({'Pass' if self.passed else 'Fail'})"