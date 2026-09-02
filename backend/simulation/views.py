from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from django.http import HttpResponse

from .models import SimulationEmail, SimulationResult, QuizQuestion, QuizSubmission
from .serializers import SimulationEmailSerializer, SimulationResultSerializer
from .certificate_generator import generate_certificate_pdf
from authentication.models import ActivityAudit
from lms_content.models import LearningModule, UserProgress

# ----------------------------------------------------
# 1. 10 Core Simulation Email Scenarios & Views
# ----------------------------------------------------

DEFAULT_SIMULATION_EMAILS = [
    {
        "sender_name": "M-Pesa Business Notifications",
        "sender_email": "alerts@safaricom-mpesa-service.net",
        "subject": "Transaction Reversal Request: Ksh 14,500",
        "difficulty": "medium",
        "is_phishing": True,
        "body_html": """
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
        "clues": "Look at the sender domain (@safaricom-mpesa-service.net vs official safaricom.co.ke) and the artificial 15-minute countdown urgency."
    },
    {
        "sender_name": "University ICT Support Desk",
        "sender_email": "helpdesk@iconscomputerschool.co.ke",
        "subject": "Scheduled Campus Network Infrastructure Maintenance",
        "difficulty": "easy",
        "is_phishing": False,
        "body_html": """
            <p class="mb-2">Dear Campus Community,</p>
            <p class="mb-2">Please be informed that routine Wi-Fi and portal maintenance will occur this Saturday between 02:00 AM and 05:00 AM.</p>
            <p class="mb-2">No action or credential validation is required on your part.</p>
            <p class="text-xs text-slate-400">ICT Operations & Infrastructure Team - Icons Computer School</p>
        """,
        "clues": "Sent from official institutional domain (@iconscomputerschool.co.ke) with no demand for credentials or external links."
    },
    {
        "sender_name": "Microsoft 365 Security Center",
        "sender_email": "security@account-protection-microsoft.co",
        "subject": "Action Required: 3 Incoming Messages Quarantined",
        "difficulty": "hard",
        "is_phishing": True,
        "body_html": """
            <p class="mb-2">Your institutional mailbox has 3 incoming messages held in quarantine due to SPF policy validation failures.</p>
            <p class="mb-3">Review and release these messages before they are permanently purged from the cloud storage cluster.</p>
            <div class="my-4">
                <a href="http://auth-office365-quarantine.com/review" target="_blank" rel="noreferrer" class="inline-block bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded text-xs">
                    Release Quarantined Messages
                </a>
            </div>
            <p class="text-xs text-slate-400">Microsoft Security Operations Center</p>
        """,
        "clues": "The domain uses a deceptive lookalike syntax (.co instead of official microsoft.com) and routes to an unverified auth portal."
    },
    {
        "sender_name": "Finance & Payroll Department",
        "sender_email": "payroll-update@icons-internal-portal.net",
        "subject": "Urgent: Complete Annual Withholding Verification (Form P9)",
        "difficulty": "medium",
        "is_phishing": True,
        "body_html": """
            <p class="mb-2">All staff members and attachment interns must verify their statutory withholding details for the current financial period.</p>
            <p class="mb-3">Failure to update banking and national ID credentials will result in salary disbursement suspension.</p>
            <div class="my-4">
                <a href="http://portal-payroll-verification.org/login" target="_blank" rel="noreferrer" class="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded text-xs">
                    Update Payroll Records
                </a>
            </div>
        """,
        "clues": "Lookalike external domain (@icons-internal-portal.net) attempting to harvest banking numbers and national identity cards under threat of non-payment."
    },
    {
        "sender_name": "Google Workspace Alert",
        "sender_email": "no-reply@accounts.google.com",
        "subject": "Security Alert: New Sign-in from Firefox on Linux",
        "difficulty": "easy",
        "is_phishing": False,
        "body_html": """
            <p class="mb-2">Hi Joel,</p>
            <p class="mb-2">Your Google Account was just accessed from a new device in Nairobi, Kenya.</p>
            <p class="mb-3">If this was you, you don't need to take any action. If you didn't sign in, visit your account dashboard to review your security activity.</p>
            <p class="text-xs text-slate-400">Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA</p>
        """,
        "clues": "Legitimate automated notification from @accounts.google.com without external credential-harvesting links."
    },
    {
        "sender_name": "Speedaf Express Logistics",
        "sender_email": "tracking-dispatch@speedaf-deliveries-ke.xyz",
        "subject": "Parcel Delivery Exception: Incomplete Street Address",
        "difficulty": "medium",
        "is_phishing": True,
        "body_html": """
            <p class="mb-2">Your incoming parcel <strong>#KE-9214-X8</strong> could not be routed due to an incorrect postal address index.</p>
            <p class="mb-3">Please pay the redelivery clearance fee of Ksh 180 to update your dispatch instructions.</p>
            <div class="my-4">
                <a href="http://parcel-redelivery-clearance.top/pay" target="_blank" rel="noreferrer" class="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded text-xs">
                    Confirm Delivery Address
                </a>
            </div>
        """,
        "clues": "Deceptive top-level domain (.xyz / .top) asking for payment information for an unexpected package delivery."
    },
    {
        "sender_name": "Icons IT Help Desk",
        "sender_email": "administrator@iconscomputerschool.co.ke",
        "subject": "Urgent: Mandatory Password Expiry in 24 Hours",
        "difficulty": "hard",
        "is_phishing": True,
        "body_html": """
            <p class="mb-2">Attention Student / Staff,</p>
            <p class="mb-2">Your portal passphrase will expire in 24 hours pursuant to institutional cybersecurity rotation policies.</p>
            <p class="mb-3">Retain your current password without resetting by authenticating through the synchronized identity provider below:</p>
            <div class="my-4">
                <a href="http://login-iconscomputerschool-sync.com/sso" target="_blank" rel="noreferrer" class="inline-block bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded text-xs">
                    Keep Current Password
                </a>
            </div>
        """,
        "clues": "Display spoofing with a link leading to an external domain (login-iconscomputerschool-sync.com) rather than the real institution domain."
    },
    {
        "sender_name": "GitHub Notification",
        "sender_email": "notifications@github.com",
        "subject": "[PhishShield-Lab] A personal access token has expired",
        "difficulty": "easy",
        "is_phishing": False,
        "body_html": """
            <p class="mb-2">Hi developer,</p>
            <p class="mb-2">Your personal access token <strong>dev-token-2026</strong> expired today. Tokens that are expired can no longer be used for Git or API requests.</p>
            <p class="mb-2">You can generate a new token in your Developer Settings at github.com.</p>
            <p class="text-xs text-slate-400">GitHub Inc. · Customer Security Operations</p>
        """,
        "clues": "Legitimate notification from @github.com with standard advisory text and no suspicious external redirects."
    },
    {
        "sender_name": "DocuSign Electronic Signature",
        "sender_email": "service@docusign-contracts-sign.net",
        "subject": "Please Review and Sign: Internship Agreement Letter",
        "difficulty": "hard",
        "is_phishing": True,
        "body_html": """
            <p class="mb-2"><strong>Icons Computer School Administration</strong> has sent you an electronic document to review and sign.</p>
            <p class="mb-3">Document: <em>Industrial_Attachment_Agreement_2026.pdf</em></p>
            <div class="my-4">
                <a href="http://docusign-secure-document-sign.info/doc/90214" target="_blank" rel="noreferrer" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs">
                    Review Document
                </a>
            </div>
            <p class="text-xs text-slate-400">DocuSign Secure Document Distribution Engine</p>
        """,
        "clues": "Spoofed DocuSign service using lookalike domain @docusign-contracts-sign.net redirecting to an untrusted .info domain."
    },
    {
        "sender_name": "Academic Registrar's Office",
        "sender_email": "registrar@iconscomputerschool.co.ke",
        "subject": "End of Term Examination Timetable Release",
        "difficulty": "easy",
        "is_phishing": False,
        "body_html": """
            <p class="mb-2">Dear Students,</p>
            <p class="mb-2">The provisional examination schedule for the upcoming assessment series has been published on the student portal noticeboard.</p>
            <p class="mb-2">Please inspect the noticeboard directly to verify exam room allocations.</p>
            <p class="text-xs text-slate-400">Office of the Registrar (Academic Affairs) - Icons Computer School</p>
        """,
        "clues": "Legitimate institutional email from official domain (@iconscomputerschool.co.ke) directing users to internal noticeboards with no credential forms."
    }
]

class SimulationEmailListCreateView(generics.ListCreateAPIView):
    queryset = SimulationEmail.objects.all().order_by('-created_at')
    serializer_class = SimulationEmailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Auto-seed if fewer than 10 emails exist
        if SimulationEmail.objects.count() < 10:
            SimulationEmail.objects.all().delete()
            for email in DEFAULT_SIMULATION_EMAILS:
                SimulationEmail.objects.create(**email)
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

        if request.user.is_authenticated:
            QuizSubmission.objects.create(
                user=request.user,
                score=correct_count,
                total_questions=total_questions,
                passed=passed
            )

        return Response({
            'score': correct_count,
            'total': total_questions,
            'percentage': percentage,
            'passed': passed,
            'details': detailed_results
        })

class CertificateDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        total_mods = LearningModule.objects.count()
        completed_mods = UserProgress.objects.filter(user=user, completed=True).count()

        # Strict validation: Certificate requires all modules completed
        if completed_mods < total_mods or total_mods == 0:
            return Response({
                'error': f'Certificate locked. You have completed {completed_mods}/{total_mods} modules. Complete all modules to unlock.'
            }, status=403)

        name = request.query_params.get('name') or user.username
        pdf_buffer, cert_id = generate_certificate_pdf(student_name=name)

        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="PhishShield_Certificate_{cert_id}.pdf"'
        return response