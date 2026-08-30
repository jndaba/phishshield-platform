from django.urls import path
from .views import QuizQuestionListView, QuizSubmitView, CertificateDownloadView

urlpatterns = [
    path('quiz/questions/', QuizQuestionListView.as_view(), name='quiz_questions'),
    path('quiz/submit/', QuizSubmitView.as_view(), name='quiz_submit'),
    path('certificate/download/', CertificateDownloadView.as_view(), name='certificate_download'),
]