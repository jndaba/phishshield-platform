from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from django.http import HttpResponse
from .models import SimulationEmail, SimulationResult, QuizQuestion, QuizSubmission
from .serializers import SimulationEmailSerializer, SimulationResultSerializer
from .certificate_generator import generate_certificate_pdf
from authentication.models import ActivityAudit

# ----------------------------------------------------
# 1. Virtual Mailbox Simulation Views & Admin Controls
# ----------------------------------------------------

class SimulationEmailListCreateView(generics.ListCreateAPIView):
    """Allows learners to fetch scenarios and admins to create new email simulations."""
    serializer_class = SimulationEmailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Auto-seed initial realistic phishing & safe emails if database is empty
        if not SimulationEmail.objects.exists():
            SimulationEmail.objects.create(
                sender_name="M-Pesa Business Notifications",
                sender_email="alerts@safaricom-mpesa-service.net",
                subject="Transaction Reversal Request: Ksh 14,500",
                difficulty="medium",
                is_phishing=True,
                body_html="""
                    <p class="mb-2">Dear Customer,</p>
                    <p class="mb-2">A reversal request for transaction ID <strong>SL89XQ21</strong> of <strong>Ksh 14,500</strong> to Alex Mwangi has been initiated.</p>
                    <p class="mb-3">If you did not authorize this reversal, authenticate your session immediately to cancel within 15 minutes.</p>
                    <div class="my-4">
                        <a href="http://mpesa-support-reversals.xyz/auth" target="_blank" rel="noreferrer" class="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded text-xs">
                            Cancel Transaction Reversal
                        </a>
                    </div>
                    <p class="text-xs text-slate-400">Safaricom PLC Mobile Financial Services.</p>
                """,
                clues="Look at the sender domain (@safaricom-mpesa-service.net vs official safaricom.co.ke) and the artificial 15-minute countdown urgency."
            )
            SimulationEmail.objects.create(
                sender_name="University ICT Support",
                sender_email="helpdesk@dekut.ac.ke",
                subject="Scheduled Wi-Fi Infrastructure Maintenance",
                difficulty="easy",
                is_phishing=False,
                body_html="""
                    <p class="mb-2">Dear Campus Community,</p>
                    <p class="mb-2">Please be informed that routine Wi-Fi maintenance will occur this Saturday between 02:00 AM and 05:00 AM.</p>
                    <p class="mb-2">No action or credential validation is required on your part.</p>
                    <p class="text-xs text-slate-400">ICT Operations & Maintenance Team</p>
                """,
                clues="Valid institutional sender domain (@dekut.ac.ke) with no demand for passwords or external links."
            )
            SimulationEmail.objects.create(
                sender_name="Microsoft 365 Security",
                sender_email="security@account-protection-microsoft.co",
                subject="Action Required: 3 Quarantined Messages",
                difficulty="hard",
                is_phishing=True,
                body_html="""
                    <p class="mb-2">Your mailbox has 3 incoming messages held in quarantine due to SPF policy failures.</p>
                    <p class="mb-3">Review these messages to prevent permanent deletion from the cloud server.</p>
                    <div class="my-4">
                        <a href="http://auth-office365-quarantine.com/review" target="_blank" rel="noreferrer" class="inline-block bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded text-xs">
                            Release Quarantined Messages
                        </a>
                    </div>
                    <p class="text-xs text-slate-400">Microsoft Security Operations Center</p>
                """,
                clues="The domain uses a deceptive lookalike syntax (.co instead of official microsoft.com) and directs to an unverified auth URL."
            )
        return SimulationEmail.objects.all().order_by('-created_at')

class SimulationEmailDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows administrators to edit or delete any email simulation."""
    queryset = SimulationEmail.objects.all()
    serializer_class = SimulationEmailSerializer
    permission_classes = [permissions.AllowAny]

class RecordSimulationAttemptView(APIView):
    """Evaluates a learner's decision, logs audit trail, and updates readiness score."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, email_id):
        user_action = request.data.get('action')  # 'phish' or 'safe'
        email = SimulationEmail.objects.filter(id=email_id).first()
        if not email:
            return Response({'error': 'Email simulation not found'}, status=404)

        is_correct = (user_action == 'phish' and email.is_phishing) or (user_action == 'safe' and not email.is_phishing)

        SimulationResult.objects.create(
            user=request.user,
            email=email,
            user_action=user_action,
            is_correct=is_correct,
            time_taken_seconds=request.data.get('time_taken', 10)
        )

        # Audit trail logging
        ActivityAudit.objects.create(
            user=request.user,
            title=f"Simulation: {email.subject[:35]}...",
            description="Correct identification" if is_correct else "Incorrect identification",
            activity_type="simulation",
            risk_score="0%" if is_correct else "High"
        )

        # Update readiness score
        profile = request.user.profile
        profile.simulations_completed += 1
        if is_correct and profile.readiness_score < 100:
            profile.readiness_score = min(100, profile.readiness_score + 4)
        elif not is_correct and profile.readiness_score > 20:
            profile.readiness_score = max(20, profile.readiness_score - 6)
        profile.save()

        return Response({
            'is_correct': is_correct,
            'explanation': email.clues,
            'new_readiness': profile.readiness_score
        })


# ----------------------------------------------------
# 2. Quiz Assessments & PDF Certificate Generation
# ----------------------------------------------------

class QuizQuestionListView(APIView):
    """Fetches all quiz assessment questions."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        questions = QuizQuestion.objects.all()
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
    """Scores user submissions and validates threshold for certification."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_answers = request.data.get('answers', {})
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
    """Generates and downloads a custom ReportLab PDF completion certificate."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        name = request.query_params.get('name', 'Student Candidate')
        pdf_buffer = generate_certificate_pdf(student_name=name)
        
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="PhishShield_Certificate_{name.replace(" ", "_")}.pdf"'
        return response