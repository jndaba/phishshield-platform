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
# 5. Assessment Quiz & Certificate Endpoints (25 Questions)
# ==============================================================================

DEFAULT_QUIZ_QUESTIONS = [
    {
        "question_text": "What is the primary psychological trigger exploited when an attacker mimics an executive requesting an urgent wire transfer?",
        "option_a": "Scarcity",
        "option_b": "Authority Impersonation",
        "option_c": "Reciprocity",
        "option_d": "Familiarity",
        "correct_option": "B",
        "explanation": "Authority impersonation exploits the human tendency to comply with requests from perceived leadership without verification."
    },
    {
        "question_text": "Which part of an email header shows the true originating IP path of the message?",
        "option_a": "Return-Path",
        "option_b": "X-Mailer",
        "option_c": "Received: from",
        "option_d": "Reply-To",
        "correct_option": "C",
        "explanation": "The 'Received: from' headers trace the exact IP hop trajectory from sender to receiver."
    },
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
        "question_text": "What is the function of SPF (Sender Policy Framework)?",
        "option_a": "Encrypts the email body",
        "option_b": "Digitally signs the email headers",
        "option_c": "Lists IP addresses authorized to send on behalf of a domain",
        "option_d": "Prevents malware execution",
        "correct_option": "C",
        "explanation": "SPF uses DNS TXT records to designate which IP addresses are authorized to send mail."
    },
    {
        "question_text": "Which email authentication protocol provides cryptographic validation that the message body was not altered in transit?",
        "option_a": "SPF",
        "option_b": "DKIM (DomainKeys Identified Mail)",
        "option_c": "SMTP STARTTLS",
        "option_d": "DNSSEC",
        "correct_option": "B",
        "explanation": "DKIM uses public-key cryptography to digitally sign email headers and bodies."
    },
    {
        "question_text": "What does a DMARC policy of 'p=reject' instruct the receiving server to do?",
        "option_a": "Reject emails that fail SPF and DKIM alignment",
        "option_b": "Forward the email to the spam folder",
        "option_c": "Reject all emails from external domains",
        "option_d": "Send an automatic reply to the sender",
        "correct_option": "A",
        "explanation": "DMARC 'reject' policy outright drops emails that fail authentication alignment."
    },
    {
        "question_text": "What is 'Smishing'?",
        "option_a": "Phishing attacks conducted via SMS text messages",
        "option_b": "Phishing over voice calls",
        "option_c": "Smashing hardware to prevent data recovery",
        "option_d": "Using small-scale malware",
        "correct_option": "A",
        "explanation": "Smishing refers specifically to SMS-based social engineering."
    },
    {
        "question_text": "Why is relying solely on the SMS 'Sender ID' (e.g., seeing 'BANK' as the sender) dangerous?",
        "option_a": "Because banks don't use SMS",
        "option_b": "Alphanumeric sender IDs can be easily spoofed by unauthorized gateways",
        "option_c": "Sender IDs are encrypted and unreadable",
        "option_d": "It requires an active data connection",
        "correct_option": "B",
        "explanation": "Offshore or unauthorized SMS gateways can inject custom alphanumeric sender IDs without verification."
    },
    {
        "question_text": "What is the primary danger of 'Quishing' (QR Code Phishing)?",
        "option_a": "QR codes contain highly contagious worms",
        "option_b": "Standard text-based email filters cannot parse the graphical payload to inspect the URL",
        "option_c": "They destroy the camera sensor",
        "option_d": "They drain the mobile device battery",
        "correct_option": "B",
        "explanation": "Because the URL is embedded in an image matrix, traditional text scanners bypass it."
    },
    {
        "question_text": "Why should users never click 'Enable Macros' on unexpected Microsoft Office documents?",
        "option_a": "It corrupts the document formatting",
        "option_b": "Macros allow embedded VBA code to execute and download malware/ransomware",
        "option_c": "It alerts the sender that the email was opened",
        "option_d": "It violates software licensing agreements",
        "correct_option": "B",
        "explanation": "Weaponized macros are a primary delivery vector for ransomware droppers."
    },
    {
        "question_text": "In an Adversary-in-the-Middle (AiTM) attack, what specific asset does the attacker steal to bypass MFA?",
        "option_a": "The user's Wi-Fi password",
        "option_b": "The active HTTP session cookie",
        "option_c": "The SMS OTP code",
        "option_d": "The router default gateway DNS IP",
        "correct_option": "B",
        "explanation": "AiTM reverse-proxies intercept the final session cookie issued after MFA is completed, granting immediate session access."
    },
    {
        "question_text": "Which authentication method completely defeats AiTM proxy attacks?",
        "option_a": "Six-digit SMS codes",
        "option_b": "Authenticator App push notifications",
        "option_c": "FIDO2 / WebAuthn Hardware Security Keys",
        "option_d": "Complex 16-character passwords",
        "correct_option": "C",
        "explanation": "FIDO2 cryptographically binds the authentication token to the exact URL, causing AiTM proxies to fail."
    },
    {
        "question_text": "What is a 'Watering Hole' attack?",
        "option_a": "Flooding a server with DDoS traffic",
        "option_b": "Compromising a specific legitimate website that a target group frequently visits to serve malware",
        "option_c": "Stealing water utility infrastructure credentials",
        "option_d": "Using a honeypot to trap hackers",
        "correct_option": "B",
        "explanation": "Attackers infect sites trusted by the target demographic to deploy drive-by downloads."
    },
    {
        "question_text": "What is 'OAuth Consent Abuse'?",
        "option_a": "Stealing a user's password via a fake login screen",
        "option_b": "Tricking a user into granting a malicious cloud app persistent API access to their data",
        "option_c": "Bypassing the firewall using a VPN",
        "option_d": "Sharing passwords with colleagues",
        "correct_option": "B",
        "explanation": "Attackers use malicious applications to request OAuth tokens, bypassing the need for passwords entirely."
    },
    {
        "question_text": "What technique do attackers use during 'Credential Stuffing'?",
        "option_a": "Guessing passwords manually",
        "option_b": "Using AI to generate new passwords",
        "option_c": "Feeding millions of leaked username/password pairs into automated login scripts",
        "option_d": "Intercepting unencrypted Wi-Fi traffic",
        "correct_option": "C",
        "explanation": "Credential stuffing exploits the human tendency to reuse passwords across multiple websites."
    },
    {
        "question_text": "If you realize you have clicked a malicious link and downloaded a file, what is the most critical first step?",
        "option_a": "Turn off the computer immediately",
        "option_b": "Run a disk defragmentation",
        "option_c": "Disconnect the device from the network (Wi-Fi/Ethernet) immediately",
        "option_d": "Forward the email to your contacts to warn them",
        "correct_option": "C",
        "explanation": "Network isolation prevents malware from communicating with command-and-control servers or moving laterally."
    },
    {
        "question_text": "Why should you NOT power off a machine suspected of a malware infection?",
        "option_a": "It deletes the operating system",
        "option_b": "It destroys forensic evidence stored in volatile RAM (like decryption keys)",
        "option_c": "It automatically pays the ransomware demand",
        "option_d": "It causes the hardware to overheat",
        "correct_option": "B",
        "explanation": "RAM memory holds vital forensic data that is lost upon power loss."
    },
    {
        "question_text": "What defines the 'Principle of Least Privilege' (PoLP)?",
        "option_a": "Users should have no privileges at all",
        "option_b": "Granting users the absolute minimum permissions necessary to perform their specific job functions",
        "option_c": "Allowing all employees administrative access to improve efficiency",
        "option_d": "Restricting internet access completely",
        "correct_option": "B",
        "explanation": "PoLP limits the blast radius of an insider threat or compromised account."
    },
    {
        "question_text": "How do AI audio deepfakes enhance Vishing attacks?",
        "option_a": "They hack the phone network",
        "option_b": "They clone the voices of trusted executives to authorize fraudulent wire transfers",
        "option_c": "They translate text to Morse code",
        "option_d": "They generate infinite SMS messages",
        "correct_option": "B",
        "explanation": "Attackers use synthetic voice cloning to bypass human vocal verification."
    },
    {
        "question_text": "What is the primary danger of an 'Evil Twin' Wi-Fi attack?",
        "option_a": "It drains your battery twice as fast",
        "option_b": "It is a rogue access point that mimics a legitimate network to intercept unencrypted traffic",
        "option_c": "It forces your device to factory reset",
        "option_d": "It physically damages the Wi-Fi card",
        "correct_option": "B",
        "explanation": "Evil Twins trick devices into connecting to attacker-controlled hardware."
    },
    {
        "question_text": "What does a Supply Chain Attack target?",
        "option_a": "Logistics and shipping trucks",
        "option_b": "A trusted third-party vendor's software updates to backdoor the primary target",
        "option_c": "The power supply of a data center",
        "option_d": "Customer credit cards at point-of-sale",
        "correct_option": "B",
        "explanation": "Attackers inject malicious code into trusted vendor software updates (e.g., SolarWinds)."
    },
    {
        "question_text": "What is the core assumption of Zero Trust Architecture (ZTA)?",
        "option_a": "The firewall is impenetrable",
        "option_b": "All employees are highly trained",
        "option_c": "The network is already compromised; never trust, always verify",
        "option_d": "Antivirus software catches 100% of threats",
        "correct_option": "C",
        "explanation": "ZTA mandates continuous identity and context verification regardless of network location."
    },
    {
        "question_text": "Why are physical 'USB Drop' attacks successful?",
        "option_a": "USB drives emit electromagnetic pulses",
        "option_b": "They exploit human curiosity, causing employees to plug infected media into secure workstations",
        "option_c": "They hack Bluetooth connections",
        "option_d": "They bypass physical security guards",
        "correct_option": "B",
        "explanation": "Dropped USBs rely on curiosity. Some act as HID devices to inject malicious keystrokes."
    },
    {
        "question_text": "What is the most effective organizational response to a reported phishing email?",
        "option_a": "Firing the employee who reported it",
        "option_b": "Ignoring it if it was caught by the spam filter",
        "option_c": "Using SOAR platforms to automatically search and purge the threat from all other inboxes",
        "option_d": "Replying to the attacker to waste their time",
        "correct_option": "C",
        "explanation": "Rapid reporting enables automated containment, purging the threat across the entire enterprise."
    },
    {
        "question_text": "Which of the following is NOT considered a valid method of verifying a suspicious email request from an executive?",
        "option_a": "Calling the executive on their known corporate phone number",
        "option_b": "Replying directly to the suspicious email to ask if it is real",
        "option_c": "Reaching out to the executive via an internal corporate messaging platform (e.g., Slack/Teams)",
        "option_d": "Walking over to their office to ask them directly",
        "correct_option": "B",
        "explanation": "Replying to the email guarantees you are only communicating with the attacker. Always use out-of-band verification."
    }
]


def seed_quiz_if_needed():
    if not QuizQuestion.objects.exists():
        for q in DEFAULT_QUIZ_QUESTIONS:
            QuizQuestion.objects.create(
                question_text=q["question_text"],
                option_a=q["option_a"],
                option_b=q["option_b"],
                option_c=q["option_c"],
                option_d=q["option_d"],
                correct_option=q["correct_option"],
                explanation=q["explanation"]
            )


class QuizQuestionListView(APIView):
    """
    Returns properly formatted Assessment questions for the Learner view.
    Translates the flat database columns into a structured 'options' dictionary.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        seed_quiz_if_needed()
        questions = QuizQuestion.objects.all().order_by('id')
        data = []
        for q in questions:
            data.append({
                'id': q.id,
                'question': q.question_text,
                'options': {
                    'A': q.option_a,
                    'B': q.option_b,
                    'C': q.option_c,
                    'D': q.option_d
                }
            })
        return Response(data, status=status.HTTP_200_OK)


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