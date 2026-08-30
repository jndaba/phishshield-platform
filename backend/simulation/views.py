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

        ActivityAudit.objects.create(
            user=request.user,
            title=f"Simulation: {email.subject[:35]}...",
            description="Correct identification" if is_correct else "Incorrect identification",
            activity_type="simulation",
            risk_score="0%" if is_correct else "High"
        )

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

EXPANDED_10_QUESTIONS = [
    {
        "question": "Which indicator most reliably flags a sophisticated spear-phishing attack?",
        "option_a": "The email subject line is written in all lowercase letters.",
        "option_b": "Urgent executive call-to-action paired with an external lookalike sender domain.",
        "option_c": "The email has a footer offering an unsubscribe link.",
        "option_d": "The message was delivered over a weekend.",
        "correct_option": "B",
        "explanation": "Attackers leverage urgency with spoofed or lookalike domains to bypass casual scrutiny."
    },
    {
        "question": "What is the primary objective of an Adversary-in-the-Middle (AiTM) phishing proxy?",
        "option_a": "To infect the victim's router with ransomware directly.",
        "option_b": "To intercept user credentials and authenticated session cookies in real-time.",
        "option_c": "To modify the CSS layout of legitimate websites permanently.",
        "option_d": "To automatically format the operating system hard drive.",
        "correct_option": "B",
        "explanation": "AiTM reverse proxies sit between the user and actual login service to steal session cookies, bypassing legacy 2FA."
    },
    {
        "question": "If you receive an SMS regarding an M-Pesa transaction reversal asking for authentication, what should you do?",
        "option_a": "Click the provided link to reject the transaction immediately.",
        "option_b": "Reply to the SMS with your M-Pesa PIN.",
        "option_c": "Ignore the link and check your official M-Pesa app or call customer support directly.",
        "option_d": "Forward the link to all your contacts for verification.",
        "correct_option": "C",
        "explanation": "Never click unverified links in SMS; verify balances independently through official channels."
    },
    {
        "question": "What is an IDN Homograph attack in phishing URLs?",
        "option_a": "A DDoS attack targeting university DNS servers.",
        "option_b": "Using Cyrillic or unicode characters that look visually identical to Latin alphabet characters.",
        "option_c": "Attaching encrypted ZIP files containing worms.",
        "option_d": "Injecting SQL queries into the search bar.",
        "correct_option": "B",
        "explanation": "Homograph exploits register lookalike unicode characters to trick users into believing a fake domain is legitimate."
    },
    {
        "question": "What makes Quishing (QR code phishing) dangerous to traditional network gateways?",
        "option_a": "QR codes can only be scanned on Android devices.",
        "option_b": "The malicious destination URL is embedded inside an image, bypassing standard email text filters.",
        "option_c": "QR codes disable computer firewalls automatically.",
        "option_d": "They delete the recipient's mailbox inbox.",
        "correct_option": "B",
        "explanation": "Image-based QR codes conceal malicious strings from basic text-based email security filters."
    },
    {
        "question": "What immediate action should be taken after submitting credentials to a suspicious phishing page?",
        "option_a": "Wait 48 hours to check if unauthorized charges appear.",
        "option_b": "Clear the browser cache and restart your computer.",
        "option_c": "Immediately change master passwords, revoke active login sessions, and alert IT security.",
        "option_d": "Reply to the original email asking for confirmation.",
        "correct_option": "C",
        "explanation": "Revoking session tokens and updating passwords prevents attackers from leveraging captured credentials."
    },
    {
        "question": "What security mechanism protects domain owners by instructing email servers to reject unauthenticated mail?",
        "option_a": "HTTP / TLS 1.3",
        "option_b": "DMARC (Domain-based Message Authentication, Reporting, and Conformance)",
        "option_c": "FTP over SSH",
        "option_d": "DNSSEC only",
        "correct_option": "B",
        "explanation": "DMARC allows domain owners to set policies that quarantine or reject forged sender addresses."
    },
    {
        "question": "How does an OAuth Consent Grant phishing attack operate in cloud services like Microsoft 365 or Google Workspace?",
        "option_a": "It downloads malware that exploits kernel vulnerabilities.",
        "option_b": "It tricks users into approving a third-party app with full read/write permissions to mailbox and cloud files.",
        "option_c": "It forces an operating system blue-screen error.",
        "option_d": "It alters the physical network interface card.",
        "correct_option": "B",
        "explanation": "Illicit consent grants trick users into granting permissions without ever exposing their raw password."
    },
    {
        "question": "Why is relying on password complexity alone insufficient against modern credential harvesting?",
        "option_a": "Complex passwords expire within 1 hour automatically.",
        "option_b": "If entered on a fraudulent lookalike portal, any password is captured regardless of complexity.",
        "option_c": "Complexity rules are deprecated by all standard organizations.",
        "option_d": "Complex passwords can only be typed on desktop keyboards.",
        "correct_option": "B",
        "explanation": "Phishing captures the exact characters entered by the user, making complexity alone ineffective without MFA and URL verification."
    },
    {
        "question": "Why is rapid reporting of suspicious phishing messages critical in an organization?",
        "option_a": "It immediately gives the reporting user system administrator rights.",
        "option_b": "It enables IT to purge the attack from all other employee and student inboxes before clicks occur.",
        "option_c": "It automatically files a police report within 10 seconds.",
        "option_d": "It reboots all network switches across the campus.",
        "correct_option": "B",
        "explanation": "Fast reporting triggers security orchestration to pull malicious emails from all accounts organization-wide."
    }
]

class QuizQuestionListView(APIView):
    """Fetches all quiz assessment questions, auto-seeding the 10-question pool if empty."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not QuizQuestion.objects.exists():
            for item in EXPANDED_10_QUESTIONS:
                QuizQuestion.objects.create(**item)

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