from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.http import HttpResponse
from .models import QuizQuestion, QuizSubmission
from .certificate_generator import generate_certificate_pdf

class QuizQuestionListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        questions = QuizQuestion.objects.all()
        # Seed default questions if database is empty
        if not questions.exists():
            QuizQuestion.objects.create(
                question="Which of the following is the most definitive indicator of a spear-phishing attack?",
                option_a="The email has a red-colored header",
                option_b="Urgent call-to-action combined with a spoofed or lookalike sender domain",
                option_c="The email contains an unsubscribe link",
                option_d="The message was sent after business hours",
                correct_option="B",
                explanation="Attackers frequently leverage psychological urgency paired with lookalike domains to bypass casual scrutiny."
            )
            QuizQuestion.objects.create(
                question="What should you do immediately if you submit banking credentials to a suspicious link?",
                option_a="Wait 24 hours to see if any money is withdrawn",
                option_b="Delete the browser history and close the tab",
                option_c="Freeze your payment accounts/cards immediately and reset your security credentials",
                option_d="Reply to the phishing email requesting account cancellation",
                correct_option="C",
                explanation="Immediately locking payment cards and changing passwords stops unauthorized transactions before attacker execution."
            )
            questions = QuizQuestion.objects.all()

        data = [{
            'id': q.id,
            'question': q.question,
            'options': {
                'A': q.option_a,
                'B': q.option_b,
                'C': q.option_c,
                'D': q.option_d,
            }
        } for q in questions]

        return Response(data)

class QuizSubmitView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_answers = request.data.get('answers', {})  # Dict format: { "question_id": "selected_option" }
        questions = QuizQuestion.objects.all()
        
        if not questions.exists():
            return Response({'error': 'No questions available.'}, status=400)

        correct_count = 0
        total_questions = questions.count()
        detailed_results = []

        for q in questions:
            selected = user_answers.get(str(q.id)) or user_answers.get(q.id)
            is_correct = (selected == q.correct_option)
            if is_correct:
                correct_count += 1
            
            detailed_results.append({
                'id': q.id,
                'question': q.question,
                'selected': selected,
                'correct_option': q.correct_option,
                'is_correct': is_correct,
                'explanation': q.explanation
            })

        percentage = round((correct_count / total_questions) * 100, 1)
        passed = percentage >= 75.0

        return Response({
            'score': correct_count,
            'total': total_questions,
            'percentage': percentage,
            'passed': passed,
            'details': detailed_results
        })

class CertificateDownloadView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        name = request.query_params.get('name', 'Student Candidate')
        pdf_buffer = generate_certificate_pdf(student_name=name)
        
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="PhishShield_Certificate_{name.replace(" ", "_")}.pdf"'
        return response