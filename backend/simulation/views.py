import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers, generics
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse

from .models import SimulationScenario, SimulationResult, QuizQuestion, QuizSubmission
from authentication.models import ActivityAudit, UserProfile


# ==============================================================================
# 1. High-Fidelity 10-Scenario Mailbox Corpus
# ==============================================================================

DEFAULT_10_SCENARIOS = [
    {
        "scenario_number": 1,
        "sender_display_name": "University ICT Helpdesk",
        "sender_email": "admin-support@dkut-ac-ke.cloud-auth.online",
        "recipient_email": "student@dkut.ac.ke",
        "subject": "ACTION REQUIRED: Mandatory Student Portal Migration & Password Expiry",
        "sent_time_display": "Today at 08:30 AM",
        "is_phishing": True,
        "threat_category": "Credential Harvesting",
        "body_html": """
            <p>Dear Student,</p>
            <p>Our centralized identity gateway will deactivate all unverified student accounts in <strong>2 hours</strong> due to an urgent server migration.</p>
            <p>To retain uninterrupted access to your examination moderation records, LMS portal, and Wi-Fi clearance, synchronize your account immediately:</p>
            <p style='text-align: center; margin: 20px 0;'>
                <a href='http://dkut-ac-ke.cloud-auth.online/login.php?client=student' style='background:#2563EB;color:#fff;padding:10px 20px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;'>Synchronize Portal Credentials</a>
            </p>
            <p>Failure to authenticate will lead to permanent deletion of pending grade submissions.</p>
            <p>Regards,<br>ICT Systems Administration</p>
        """,
        "detailed_explanation": (
            "This is a classic high-urgency credential harvesting attack. Notice three primary red flags: "
            "1) The sender address uses lookalike typosquatting 'dkut-ac-ke.cloud-auth.online' rather than the legitimate university root domain 'dkut.ac.ke'. "
            "2) An artificial 2-hour deadline designed to bypass rational cognitive checks. "
            "3) The anchor button directs to an unencrypted HTTP link on an external unauthorized domain."
        ),
        "key_indicators": (
            "Deceptive sender domain ('dkut-ac-ke.cloud-auth.online')\n"
            "Artificial 2-hour panic deadline\n"
            "Hyperlink routing to external unencrypted HTTP server"
        )
    },
    {
        "scenario_number": 2,
        "sender_display_name": "GitHub Security Sentinel",
        "sender_email": "noreply@github.com",
        "recipient_email": "developer@phishshield.org",
        "subject": "[GitHub] Personal Access Token 'PhishShield-API-Deploy' Expiring Soon",
        "sent_time_display": "Today at 09:12 AM",
        "is_phishing": False,
        "threat_category": "Legitimate System Notification",
        "body_html": """
            <p>Hi developer,</p>
            <p>Your Personal Access Token (classic) <strong>PhishShield-API-Deploy</strong> is set to expire in 7 days.</p>
            <p>If you still require this token for automated CI/CD runners or repository management, please log in to GitHub and generate a replacement token with granular scopes.</p>
            <p>You can manage your personal access tokens under your GitHub profile: <em>Settings &rarr; Developer settings &rarr; Personal access tokens</em>.</p>
            <p>GitHub Security Team</p>
        """,
        "detailed_explanation": (
            "This is a completely legitimate operational security email from GitHub. "
            "1) Sent directly from the verified domain 'noreply@github.com' with full DKIM cryptographic alignment. "
            "2) It does NOT include urgent threats or force you to click embedded login links; instead, it instructs you to navigate manually to 'Settings &rarr; Developer settings'. "
            "3) No request for credentials or passwords."
        ),
        "key_indicators": (
            "Authentic RFC sender header 'noreply@github.com'\n"
            "Instructs manual user navigation rather than demanding link clicks\n"
            "Standard informational lifecycle advisory with no artificial panic"
        )
    },
    {
        "scenario_number": 3,
        "sender_display_name": "Safaricom M-Pesa Operations",
        "sender_email": "mpesa-reversals@safaricom-support.net",
        "recipient_email": "customer@gmail.com",
        "subject": "CONFIRMATION: Erroneous Transaction Ksh 32,500 - Reverse Now",
        "sent_time_display": "Today at 10:05 AM",
        "is_phishing": True,
        "threat_category": "Financial Fraud & Vishing",
        "body_html": """
            <p>Dear Customer,</p>
            <p>We received an instant reversal request for transaction <strong>TJ49LK19M0</strong> of <strong>Ksh 32,500</strong> sent erroneously to your line.</p>
            <p>If you did not authorize this reversal or suspect fraudulent initiation, verify your M-Pesa identity within 10 minutes to protect your balance:</p>
            <p style='text-align: center; margin: 18px 0;'>
                <a href='http://192.168.1.105/mpesa/auth?token=9281' style='background:#16a34a;color:#fff;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;'>Reject Reversal & Lock Wallet</a>
            </p>
            <p>Thank you for choosing Safaricom.</p>
        """,
        "detailed_explanation": (
            "This is a targeted financial social engineering lure. "
            "1) Safaricom customer notifications originate from '@safaricom.co.ke' or direct SMS alphanumeric sender IDs, never '@safaricom-support.net'. "
            "2) The action link directs to an internal/private IP address (192.168.1.105) hosted by the adversary. "
            "3) Safaricom never prompts users to enter their M-Pesa PIN or wallet secrets on external web links."
        ),
        "key_indicators": (
            "Forged sender domain ('@safaricom-support.net')\n"
            "Action link points to raw IP address ('192.168.1.105')\n"
            "Solicitation of confidential PIN credentials via external link"
        )
    },
    {
        "scenario_number": 4,
        "sender_display_name": "Google Cloud Platform",
        "sender_email": "cloud-platform-noreply@google.com",
        "recipient_email": "lead-dev@organization.com",
        "subject": "Monthly Billing Statement Available: Project 'phishshield-prod'",
        "sent_time_display": "Yesterday at 04:30 PM",
        "is_phishing": False,
        "threat_category": "Legitimate Accounting Notice",
        "body_html": """
            <p>Hello,</p>
            <p>Your Google Cloud monthly billing statement for <strong>Project: phishshield-prod</strong> is now available in the Google Cloud Console.</p>
            <p>Total amount invoiced: <strong>$0.00 (Free Tier Utilization)</strong>.</p>
            <p>To inspect your Cloud Run container metrics or compute consumption, visit your project overview in the Google Cloud Console directly.</p>
            <p>&mdash; The Google Cloud Billing Team</p>
        """,
        "detailed_explanation": (
            "This is a legitimate Google Cloud accounting notification. "
            "1) Sent from authentic 'cloud-platform-noreply@google.com' matching published Google SPF records. "
            "2) Cites accurate internal project metadata without asking the user to update credit cards or passwords. "
            "3) No deceptive hyperlinks or coercive language."
        ),
        "key_indicators": (
            "Verified Google domain with authentic SPF/DKIM\n"
            "No unsolicited attachment or request for sensitive financial entry\n"
            "Consistent with normal cloud operations and free-tier metrics"
        )
    },
    {
        "scenario_number": 5,
        "sender_display_name": "Chief Financial Officer",
        "sender_email": "cfo-office@executive-desk-direct.com",
        "recipient_email": "accountant@university.ac.ke",
        "subject": "URGENT: Confidential Wire Transfer - Vendor Invoice #9921",
        "sent_time_display": "Today at 11:20 AM",
        "is_phishing": True,
        "threat_category": "Business Email Compromise (BEC)",
        "body_html": """
            <p>Hi,</p>
            <p>I am currently off-site in an executive council meeting with limited mobile connectivity.</p>
            <p>We need to settle pending invoice #9921 for our new lab equipment vendor before 1:00 PM today to avoid customs penalties. Please process an expedited wire transfer of <strong>Ksh 485,000</strong> to the updated coordinates in the attached invoice summary.</p>
            <p>Reply directly to this email once processed. Do not call my line as I cannot take calls right now.</p>
            <p>Best regards,<br>Executive Office</p>
        """,
        "detailed_explanation": (
            "This is a classic Business Email Compromise (BEC) attack exploiting authority and artificial isolation. "
            "1) The attacker registers a lookalike domain 'executive-desk-direct.com' rather than the internal domain. "
            "2) Specifically tells the recipient NOT to call, deliberately cutting off out-of-band verification. "
            "3) Requests a bypass of standard institutional financial checks under the guise of an executive emergency."
        ),
        "key_indicators": (
            "Authority impersonation (CFO / Executive)\n"
            "Deliberate instruction to avoid phone verification ('Do not call')\n"
            "Urgent request to alter statutory banking coordinates"
        )
    },
    {
        "scenario_number": 6,
        "sender_display_name": "DHL Express Tracking",
        "sender_email": "service-dispatch@dhl-delivery-clearance.top",
        "recipient_email": "recipient@gmail.com",
        "subject": "PARCEL HOLD: Incomplete Shipping Fee of $2.40 for Tracking #KE-8841",
        "sent_time_display": "Today at 01:15 PM",
        "is_phishing": True,
        "threat_category": "Smishing & Lure Fraud",
        "body_html": """
            <p>Dear Customer,</p>
            <p>Your incoming package <strong>#KE-8841-90</strong> has arrived at the international sorting hub but is on administrative hold due to an unpaid customs stamp fee of <strong>$2.40 USD</strong>.</p>
            <p>Please clear this balance within 24 hours to prevent the parcel from being returned to the sender in Hong Kong:</p>
            <p style='text-align: center; margin: 16px 0;'>
                <a href='http://dhl-delivery-clearance.top/pay/settle.html' style='background:#d97706;color:#fff;padding:10px 20px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;'>Pay $2.40 Outstanding Fee</a>
            </p>
            <p>DHL Logistics International</p>
        """,
        "detailed_explanation": (
            "This is a low-friction parcel delivery scam. "
            "1) Uses an untrusted, high-risk top-level domain (.top) on 'dhl-delivery-clearance.top' rather than 'dhl.com'. "
            "2) Quotes an insignificantly small fee ($2.40) to encourage victims to enter their credit card numbers without thinking. "
            "3) The landing page is designed to harvest full credit card numbers, CVVs, and billing addresses."
        ),
        "key_indicators": (
            "High-risk .top TLD used for brand impersonation\n"
            "Micro-fee ($2.40) lure to harvest credit card data\n"
            "Unsolicited tracking number with no prior ordering context"
        )
    },
    {
        "scenario_number": 7,
        "sender_display_name": "Docker Hub Hubspot",
        "sender_email": "notifications@docker.com",
        "recipient_email": "devops@phishshield.org",
        "subject": "Automated Build Succeeded: repository/phishshield-scanner:v2.1",
        "sent_time_display": "Today at 02:00 PM",
        "is_phishing": False,
        "threat_category": "Legitimate Operational Report",
        "body_html": """
            <p>Automated Build Completed Successfully</p>
            <p>Repository: <strong>repository/phishshield-scanner</strong><br>Tag: <strong>v2.1</strong><br>Duration: <strong>2m 45s</strong></p>
            <p>Image Digest: <code>sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</code></p>
            <p>This automated notification was generated according to your Docker Hub automated build triggers.</p>
        """,
        "detailed_explanation": (
            "This is a legitimate DevOps transaction notice. "
            "1) Matches expected sender 'notifications@docker.com'. "
            "2) Provides specific technical data (SHA256 digest, build duration, tag version) with no calls to action or suspicious links. "
            "3) Strictly informational status message."
        ),
        "key_indicators": (
            "Matches genuine Docker domain (@docker.com)\n"
            "Contains verifiable cryptographic digest\n"
            "No credential inputs, urgent actions, or requests for authorization"
        )
    },
    {
        "scenario_number": 8,
        "sender_display_name": "Microsoft 365 Cloud Compliance",
        "sender_email": "compliance-officer@microsoft-365-tenant-recovery.com",
        "recipient_email": "joel.ndaba@student.dkut.ac.ke",
        "subject": "SECURITY BREACH: Malicious Sign-In Detected from Moscow, Russia",
        "sent_time_display": "Today at 02:45 PM",
        "is_phishing": True,
        "threat_category": "Adversary-in-the-Middle (AiTM)",
        "body_html": """
            <p style='color:#b91c1c; font-weight:bold;'>Critical Threat Alert - Tenant Risk Level: CRITICAL</p>
            <p>An unauthorized login attempt to your Microsoft 365 Outlook account was intercepted from:</p>
            <ul>
                <li><strong>Location:</strong> Moscow, Russian Federation</li>
                <li><strong>IP Address:</strong> 185.220.101.5</li>
                <li><strong>Browser:</strong> Chrome on Linux</li>
            </ul>
            <p>To confirm your identity and prevent your mailbox from being quarantined across the university domain, tap below:</p>
            <p style='text-align: center; margin: 18px 0;'>
                <a href='http://microsoft-365-tenant-recovery.com/proxy/owa-auth' style='background:#dc2626;color:#fff;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;'>Secure My Account & Invalidate Attacker</a>
            </p>
        """,
        "detailed_explanation": (
            "This is a high-grade AiTM reverse-proxy attack vector designed to steal session cookies. "
            "1) Attackers leverage alarming geographical markers (e.g., Moscow, Russia) to induce panic. "
            "2) The sender domain 'microsoft-365-tenant-recovery.com' is an unauthorized lookalike domain registered to bypass email security gateways. "
            "3) Clicking the link forwards the user to a reverse-proxy that intercepts session tokens even if multi-factor authentication (MFA) is enabled."
        ),
        "key_indicators": (
            "Spoofed brand domain ('microsoft-365-tenant-recovery.com')\n"
            "Emotional panic trigger (unauthorized Russian IP login)\n"
            "Reverse proxy destination to intercept session tokens"
        )
    },
    {
        "scenario_number": 9,
        "sender_display_name": "Campus Library Services",
        "sender_email": "library-notices@dkut.ac.ke",
        "recipient_email": "student@dkut.ac.ke",
        "subject": "Overdue Book Courtesy Reminder: 'Computer Security Principles & Practice'",
        "sent_time_display": "Today at 03:10 PM",
        "is_phishing": False,
        "threat_category": "Legitimate University Notice",
        "body_html": """
            <p>Dear Joel,</p>
            <p>This is a routine automated reminder that the following borrowed title is due in 3 days:</p>
            <p><strong>Title:</strong> Computer Security: Principles and Practice (4th Edition)<br>
            <strong>Barcode:</strong> DKUT-LIB-44810<br>
            <strong>Due Date:</strong> September 23, 2026</p>
            <p>You may renew your borrowing period in person at the main campus circulation desk or through the library OPAC terminal on campus.</p>
            <p>Thank you,<br>University Library Desk</p>
        """,
        "detailed_explanation": (
            "This is a genuine institutional email. "
            "1) Uses the authentic internal academic domain 'library-notices@dkut.ac.ke'. "
            "2) Contains no requests for payment, banking details, or passwords. "
            "3) Suggests visiting the circulation desk or standard internal campus OPAC terminal."
        ),
        "key_indicators": (
            "Authentic academic institutional address ('@dkut.ac.ke')\n"
            "Realistic student metadata without requests for passwords\n"
            "Directs to legitimate physical or campus facilities"
        )
    },
    {
        "scenario_number": 10,
        "sender_display_name": "Human Resources & Payroll",
        "sender_email": "hr-payroll@institution-benefits-portal.com",
        "recipient_email": "staff@organization.com",
        "subject": "CONFIDENTIAL: Updated 2026 Salary Revision & Benefit Adjustment Schedule",
        "sent_time_display": "Today at 03:40 PM",
        "is_phishing": True,
        "threat_category": "Malicious Attachment & Macro Exploit",
        "body_html": """
            <p>Team,</p>
            <p>Management has completed the annual compensation benchmark for Q3/Q4 2026. The revised salary scales and health coverage changes are detailed in the document below.</p>
            <p>Download the attached file: <strong>2026_Salary_Schedule_Revision_v3.xlsm</strong></p>
            <p><em>Note: If prompted by Microsoft Excel, click 'Enable Content' and 'Enable Macros' to allow the dynamic calculator to render your department's specific grade tier.</em></p>
            <p>Human Resources & Compensation Committee</p>
        """,
        "detailed_explanation": (
            "This is a high-risk macro-enabled weaponized document attack. "
            "1) The email attaches an '.xlsm' (Excel Macro-Enabled Spreadsheet) file. "
            "2) Explicitly instructs the recipient to click 'Enable Content' and 'Enable Macros', which allows embedded VBA scripts to execute malicious PowerShell commands and drop reverse shells. "
            "3) Sent from an external third-party domain 'institution-benefits-portal.com' rather than internal corporate email."
        ),
        "key_indicators": (
            "Macro-enabled attachment extension (.xlsm)\n"
            "Direct solicitation to bypass security controls ('Enable Macros')\n"
            "Curiosity and greed cognitive triggers (salary adjustments)"
        )
    }
]


def seed_scenarios_if_needed():
    """Guarantee at least 10 high-fidelity scenarios exist in the database."""
    if SimulationScenario.objects.count() < 10:
        for item in DEFAULT_10_SCENARIOS:
            SimulationScenario.objects.update_or_create(
                scenario_number=item["scenario_number"],
                defaults={
                    "sender_display_name": item["sender_display_name"],
                    "sender_email": item["sender_email"],
                    "recipient_email": item["recipient_email"],
                    "subject": item["subject"],
                    "sent_time_display": item["sent_time_display"],
                    "is_phishing": item["is_phishing"],
                    "threat_category": item["threat_category"],
                    "body_html": item["body_html"],
                    "detailed_explanation": item["detailed_explanation"],
                    "key_indicators": item["key_indicators"],
                }
            )


# ==============================================================================
# 2. Serializers
# ==============================================================================

class SimulationScenarioSerializer(serializers.ModelSerializer):
    user_submission = serializers.SerializerMethodField()

    class Meta:
        model = SimulationScenario
        fields = [
            'id',
            'scenario_number',
            'sender_display_name',
            'sender_email',
            'recipient_email',
            'subject',
            'sent_time_display',
            'body_html',
            'is_phishing',
            'threat_category',
            'detailed_explanation',
            'key_indicators',
            'user_submission',
        ]

    def get_user_submission(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        res = SimulationResult.objects.filter(user=request.user, scenario=obj).first()
        if not res:
            return None
        return {
            'user_choice_is_phishing': res.user_choice_is_phishing,
            'is_correct': res.is_correct,
            'attempted_at': res.attempted_at.strftime('%b %d, %H:%M')
        }


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation']


# ==============================================================================
# 3. Mailbox Simulation Endpoints
# ==============================================================================

class SimulationInboxListView(APIView):
    """Lists all 10 simulation scenarios alongside the learner's previous verdicts."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        seed_scenarios_if_needed()
        scenarios = SimulationScenario.objects.all().order_by('scenario_number')
        serializer = SimulationScenarioSerializer(scenarios, many=True, context={'request': request})

        total_scenarios = scenarios.count()
        results = SimulationResult.objects.filter(user=request.user)
        completed_count = results.count()
        correct_count = results.filter(is_correct=True).count()
        accuracy = round((correct_count / completed_count * 100), 1) if completed_count > 0 else 0

        return Response({
            'scenarios': serializer.data,
            'stats': {
                'total': total_scenarios,
                'completed': completed_count,
                'correct': correct_count,
                'accuracy': accuracy
            }
        }, status=status.HTTP_200_OK)


class SubmitScenarioDecisionView(APIView):
    """Submits user verdict (Safe vs Malicious) and returns a detailed forensic breakdown."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, scenario_id):
        scenario = get_object_or_404(SimulationScenario, id=scenario_id)
        user_choice = request.data.get('is_phishing')

        if user_choice is None:
            return Response({'error': "Verdict parameter 'is_phishing' (Boolean) is required."}, status=status.HTTP_400_BAD_REQUEST)

        user_choice_bool = bool(user_choice)
        is_correct = (user_choice_bool == scenario.is_phishing)

        result, _ = SimulationResult.objects.update_or_create(
            user=request.user,
            scenario=scenario,
            defaults={
                'user_choice_is_phishing': user_choice_bool,
                'is_correct': is_correct,
                'attempted_at': timezone.now()
            }
        )

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        total_attempts = SimulationResult.objects.filter(user=request.user).count()
        profile.simulations_completed = total_attempts
        profile.save()

        verdict_str = "Malicious (Phishing)" if user_choice_bool else "Safe (Legitimate)"
        outcome_str = "CORRECT" if is_correct else "INCORRECT"
        ActivityAudit.objects.create(
            user=request.user,
            title=f"Mailbox Simulation: Scenario #{scenario.scenario_number} Evaluated",
            description=f"User selected: {verdict_str}. Result: {outcome_str}.",
            activity_type="simulation",
            risk_score="LOW" if is_correct else "HIGH"
        )

        indicators_list = [i.strip() for i in scenario.key_indicators.split('\n') if i.strip()]

        return Response({
            'scenario_id': scenario.id,
            'scenario_number': scenario.scenario_number,
            'is_correct': is_correct,
            'user_choice_is_phishing': user_choice_bool,
            'actual_is_phishing': scenario.is_phishing,
            'threat_category': scenario.threat_category,
            'detailed_explanation': scenario.detailed_explanation,
            'key_indicators': indicators_list,
            'feedback_summary': (
                f"Your assessment was spot-on! This message was {'MALICIOUS' if scenario.is_phishing else 'SAFE'}."
                if is_correct else
                f"Careful! You marked this email as {'MALICIOUS' if user_choice_bool else 'SAFE'}, but it is actually {'MALICIOUS' if scenario.is_phishing else 'SAFE'}."
            )
        }, status=status.HTTP_200_OK)


# ==============================================================================
# 4. Backward Compatibility Aliases for Legacy Simulation Email Endpoints
# ==============================================================================

class SimulationEmailListCreateView(generics.ListCreateAPIView):
    queryset = SimulationScenario.objects.all().order_by('scenario_number')
    serializer_class = SimulationScenarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        seed_scenarios_if_needed()
        return SimulationScenario.objects.all().order_by('scenario_number')


class SimulationEmailDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SimulationScenario.objects.all()
    serializer_class = SimulationScenarioSerializer
    permission_classes = [permissions.IsAuthenticated]


class RecordSimulationAttemptView(SubmitScenarioDecisionView):
    """Maps legacy `emails/<int:email_id>/attempt/` requests to `SubmitScenarioDecisionView`."""
    def post(self, request, email_id):
        return super().post(request, scenario_id=email_id)


# ==============================================================================
# 5. Assessment Quiz & Certificate Endpoints
# ==============================================================================

DEFAULT_QUIZ_QUESTIONS = [
    {
        "question_text": "What is the primary indicator of an Internationalized Domain Name (IDN) homograph attack?",
        "option_a": "A Punycode string beginning with 'xn--' in the browser address bar",
        "option_b": "A domain ending strictly in .org or .edu",
        "option_c": "An email containing an encrypted digital signature",
        "option_d": "A message routed through an authorized MX server",
        "correct_option": "A",
        "explanation": "Punycode (e.g., xn--) is used by browsers to render non-ASCII Unicode characters into ASCII representation."
    },
    {
        "question_text": "Which email authentication protocol provides cryptographic validation that the message body was not altered in transit?",
        "option_a": "SPF (Sender Policy Framework)",
        "option_b": "DKIM (DomainKeys Identified Mail)",
        "option_c": "SMTP STARTTLS",
        "option_d": "DNSSEC",
        "correct_option": "B",
        "explanation": "DKIM uses public-key cryptography to digitally sign email headers and bodies."
    },
    {
        "question_text": "In an Adversary-in-the-Middle (AiTM) phishing attack, what does the attacker reverse-proxy intercept to bypass MFA?",
        "option_a": "The user's Wi-Fi WPA2 pre-shared key",
        "option_b": "The active session cookie / bearer token",
        "option_c": "The client's CPU hardware serial identifier",
        "option_d": "The router default gateway DNS IP",
        "correct_option": "B",
        "explanation": "AiTM proxies capture session cookies after the user completes MFA, granting immediate session access without re-prompting."
    }
]


def seed_quiz_if_needed():
    if not QuizQuestion.objects.exists():
        for q in DEFAULT_QUIZ_QUESTIONS:
            QuizQuestion.objects.create(**q)


class QuizQuestionListView(generics.ListAPIView):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        seed_quiz_if_needed()
        return QuizQuestion.objects.all()


class QuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_answers = request.data.get('answers', {})
        questions = QuizQuestion.objects.all()
        total = questions.count()

        if total == 0:
            seed_quiz_if_needed()
            questions = QuizQuestion.objects.all()
            total = questions.count()

        correct = 0
        for q in questions:
            user_choice = str(user_answers.get(str(q.id), '')).strip().upper()
            if user_choice == q.correct_option.strip().upper():
                correct += 1

        percentage = round((correct / total * 100), 1) if total > 0 else 0
        passed = percentage >= 70.0

        QuizSubmission.objects.create(
            user=request.user,
            score=correct,
            total_questions=total,
            passed=passed
        )

        return Response({
            'score': correct,
            'total': total,
            'percentage': percentage,
            'passed': passed,
            'status': 'PASSED' if passed else 'FAILED'
        }, status=status.HTTP_200_OK)


class CertificateDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        passed = QuizSubmission.objects.filter(user=user, passed=True).exists()

        if not passed:
            return Response(
                {'error': 'A passing grade of 70% or higher on the Assessment Quiz is required to download your certificate.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cert_content = f"""
================================================================================
                    PHISHSHIELD CYBERSECURITY ACADEMY
                 CERTIFICATE OF PROFESSIONAL COMPETENCE
================================================================================

This is to certify that:

                        {user.get_full_name() or user.username.upper()}

has successfully completed the comprehensive threat detection curriculum,
mastered the 10 simulated mailbox scenarios, and passed the rigorous 
Social Engineering & Adversary-in-the-Middle Assessment Examination.

Verification Date: {timezone.now().strftime('%B %d, %Y')}
Credential ID: PS-{user.id:04d}-{timezone.now().strftime('%Y%m%d')}
Issued by: PhishShield Academic Governance Board

================================================================================
"""
        response = HttpResponse(cert_content, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="PhishShield_Certificate_{user.username}.txt"'
        return response


# ==============================================================================
# 6. Admin Control Panel CRUD for Assessment Questions
# ==============================================================================

class AdminQuizQuestionManageView(APIView):
    """Allows administrators to view, create, edit, or delete quiz questions."""
    permission_classes = [permissions.IsAuthenticated]

    def _is_admin(self, user):
        return user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)

    def get(self, request):
        seed_quiz_if_needed()
        questions = QuizQuestion.objects.all().order_by('id')
        data = [{
            'id': q.id,
            'question_text': q.question_text,
            'option_a': q.option_a,
            'option_b': q.option_b,
            'option_c': q.option_c,
            'option_d': q.option_d,
            'correct_option': q.correct_option,
            'explanation': q.explanation
        } for q in questions]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        if not self._is_admin(request.user):
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        q_text = request.data.get('question_text', '').strip()
        opt_a = request.data.get('option_a', '').strip()
        opt_b = request.data.get('option_b', '').strip()
        opt_c = request.data.get('option_c', '').strip()
        opt_d = request.data.get('option_d', '').strip()
        correct = request.data.get('correct_option', 'A').strip().upper()
        explanation = request.data.get('explanation', '').strip()

        if not (q_text and opt_a and opt_b and opt_c and opt_d):
            return Response({'error': 'All question fields and four options are mandatory.'}, status=status.HTTP_400_BAD_REQUEST)

        question = QuizQuestion.objects.create(
            question_text=q_text,
            option_a=opt_a,
            option_b=opt_b,
            option_c=opt_c,
            option_d=opt_d,
            correct_option=correct,
            explanation=explanation
        )

        ActivityAudit.objects.create(
            user=request.user,
            title="Assessment Question Added",
            description=f"Created question #{question.id}: {q_text[:40]}...",
            activity_type="governance"
        )

        return Response({'message': 'Question created successfully.', 'id': question.id}, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        if not self._is_admin(request.user):
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        question = get_object_or_404(QuizQuestion, id=pk)
        question.question_text = request.data.get('question_text', question.question_text)
        question.option_a = request.data.get('option_a', question.option_a)
        question.option_b = request.data.get('option_b', question.option_b)
        question.option_c = request.data.get('option_c', question.option_c)
        question.option_d = request.data.get('option_d', question.option_d)
        question.correct_option = request.data.get('correct_option', question.correct_option).upper()
        question.explanation = request.data.get('explanation', question.explanation)
        question.save()

        ActivityAudit.objects.create(
            user=request.user,
            title="Assessment Question Updated",
            description=f"Admin modified question #{question.id}",
            activity_type="governance"
        )
        return Response({'message': 'Question updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, pk=None):
        if not self._is_admin(request.user):
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        question = get_object_or_404(QuizQuestion, id=pk)
        question_id = question.id
        question.delete()

        ActivityAudit.objects.create(
            user=request.user,
            title="Assessment Question Deleted",
            description=f"Permanently removed question #{question_id}",
            activity_type="governance",
            risk_score="MEDIUM"
        )
        return Response({'message': f'Question #{question_id} deleted.'}, status=status.HTTP_200_OK)