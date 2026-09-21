from django.urls import path
from .views import (
    SimulationEmailListCreateView,
    SimulationEmailDetailView,
    RecordSimulationAttemptView,
    QuizQuestionListView,
    QuizSubmitView,
    CertificateDownloadView,
    SimulationInboxListView,
    SubmitScenarioDecisionView,
    AdminQuizQuestionManageView,
)

urlpatterns = [
    # 10-Scenario Mailbox Simulation Sandbox
    path('inbox/', SimulationInboxListView.as_view(), name='simulation_inbox_list'),
    path('inbox/<int:scenario_id>/verdict/', SubmitScenarioDecisionView.as_view(), name='simulation_scenario_verdict'),

    # Admin Simulation Emails & Attempts (CRUD)
    path('emails/', SimulationEmailListCreateView.as_view(), name='simulation_emails'),
    path('emails/<int:pk>/', SimulationEmailDetailView.as_view(), name='simulation_email_detail'),
    path('emails/<int:email_id>/attempt/', RecordSimulationAttemptView.as_view(), name='simulation_attempt'),

    # Assessment Quiz & Certification
    path('quiz/questions/', QuizQuestionListView.as_view(), name='quiz_questions'),
    path('quiz/submit/', QuizSubmitView.as_view(), name='quiz_submit'),
    path('certificate/download/', CertificateDownloadView.as_view(), name='certificate_download'),

    # Admin Control Panel CRUD for Assessment Questions
    path('quiz/manage/questions/', AdminQuizQuestionManageView.as_view(), name='quiz_manage_questions'),
    path('quiz/manage/questions/<int:pk>/', AdminQuizQuestionManageView.as_view(), name='quiz_manage_questions_detail'),
]