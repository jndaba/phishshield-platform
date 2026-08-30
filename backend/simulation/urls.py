from django.urls import path
from .views import (
    SimulationEmailListCreateView,
    SimulationEmailDetailView,
    RecordSimulationAttemptView,
    QuizQuestionListView,
    QuizSubmitView,
    CertificateDownloadView
)

urlpatterns = [
    path('emails/', SimulationEmailListCreateView.as_view(), name='simulation_emails'),
    path('emails/<int:pk>/', SimulationEmailDetailView.as_view(), name='simulation_email_detail'),
    path('emails/<int:email_id>/attempt/', RecordSimulationAttemptView.as_view(), name='simulation_attempt'),
    path('quiz/questions/', QuizQuestionListView.as_view(), name='quiz_questions'),
    path('quiz/submit/', QuizSubmitView.as_view(), name='quiz_submit'),
    path('certificate/download/', CertificateDownloadView.as_view(), name='certificate_download'),
]