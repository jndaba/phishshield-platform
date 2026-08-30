from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import LearningModule, UserProgress
from .serializers import LearningModuleSerializer, UserProgressSerializer, AdminUserManagementSerializer

DEFAULT_14_MODULES = [
    {
        "module_number": 1,
        "title": "Anatomy of Phishing & Psychological Triggers",
        "category": "Foundations",
        "estimated_read_time": "6 mins",
        "description": "Examine how cybercriminals exploit authority, cognitive shortcuts, and urgency.",
        "video_url": "https://www.youtube.com/embed/XBkzBrXllBo",
        "rich_content": """
            <h3>Understanding Deception Mechanisms</h3>
            <p>Phishing is a form of social engineering that relies on cognitive biases rather than technical vulnerabilities alone. Attackers commonly exploit:</p>
            <ul>
                <li><strong>Authority Bias:</strong> Impersonating higher-ups (e.g., University Dean, Chief Financial Officer, Bank Operations).</li>
                <li><strong>Artificial Urgency:</strong> Threatening account suspension, missed deadlines, or financial fines within strict timeframes (e.g., 'within 2 hours').</li>
                <li><strong>Fear & Greed:</strong> Deceptive tax refunds, unexpected prize disbursements, or sudden password resets.</li>
            </ul>
        """
    },
    {
        "module_number": 2,
        "title": "Spear Phishing & Executive Impersonation",
        "category": "Targeted Attacks",
        "estimated_read_time": "8 mins",
        "description": "Tactics used in customized attacks against specific university departments and staff.",
        "video_url": "https://www.youtube.com/embed/9GzF7f-38z8",
        "rich_content": """
            <h3>Targeted Reconnaissance</h3>
            <p>Unlike broad spam campaigns, spear phishing uses OSINT (Open Source Intelligence) gathered from social media and portals to craft tailored messages.</p>
            <p><strong>Defense:</strong> Always confirm financial change requests or sensitive student transfers through a secondary, trusted channel.</p>
        """
    },
    {
        "module_number": 3,
        "title": "Email Header Analysis & Domain Spoofing",
        "category": "Technical Defense",
        "estimated_read_time": "10 mins",
        "description": "How to inspect SPF, DKIM, and DMARC records to detect address impersonation.",
        "video_url": "https://www.youtube.com/embed/2_YnQ5iFm5Q",
        "rich_content": """
            <h3>Validating the Origin</h3>
            <p>The display name on an email can be trivially forged. Inspecting the raw <code>Authentication-Results</code> headers reveals if the domain passed Sender Policy Framework (SPF) and DKIM cryptographic signing.</p>
        """
    },
    {
        "module_number": 4,
        "title": "Homograph Attacks & Punycode Deceptions",
        "category": "Technical Defense",
        "estimated_read_time": "7 mins",
        "description": "Detecting Cyrillic and lookalike characters used in deceptive domain registrations.",
        "rich_content": """
            <h3>Internationalized Domain Name (IDN) Spoofing</h3>
            <p>Attackers register domains with characters that look identical to ASCII letters (e.g., using Cyrillic 'а' instead of Latin 'a'). Modern browsers display these with the <code>xn--</code> Punycode prefix.</p>
        """
    },
    {
        "module_number": 5,
        "title": "Smishing, Vishing & Multi-Channel Social Engineering",
        "category": "Mobile Threats",
        "estimated_read_time": "6 mins",
        "description": "Identifying SMS-based M-Pesa fraud schemes, automated voice phishers, and WhatsApp scams.",
        "rich_content": """
            <h3>Attacks Outside the Mailbox</h3>
            <p>SMS phishing (Smishing) leverages shortcodes to claim fake transactions. Never enter OTPs or M-Pesa PINs into any page reached via an unsolicited SMS link.</p>
        """
    },
    {
        "module_number": 6,
        "title": "Malicious QR Codes (Quishing)",
        "category": "Emerging Vectors",
        "estimated_read_time": "5 mins",
        "description": "How attackers use QR codes on physical posters and emails to bypass URL network filters.",
        "rich_content": """
            <h3>Visual Link Obfuscation</h3>
            <p>Quishing embeds URLs inside QR images, evading email text inspection scanners. Always inspect the destination domain prompt before opening scanned URLs on mobile devices.</p>
        """
    },
    {
        "module_number": 7,
        "title": "Clone Phishing & Malicious Attachment Sandboxing",
        "category": "Malware Vectors",
        "estimated_read_time": "8 mins",
        "description": "Techniques for spotting weaponized PDF, DOCX, and HTML attachments.",
        "rich_content": """
            <h3>Attachment Exploits</h3>
            <p>Cloned phishing copies a genuine previously-delivered message, replacing attachments or links with malicious variants. Watch out for nested ZIP files, ISO images, or macro-enabled documents.</p>
        """
    },
    {
        "module_number": 8,
        "title": "Session Hijacking & Adversary-in-the-Middle (AiTM)",
        "category": "Advanced Threats",
        "estimated_read_time": "9 mins",
        "description": "How modern reverse proxies intercept login sessions and bypass standard 2FA prompts.",
        "rich_content": """
            <h3>Bypassing Traditional MFA</h3>
            <p>Tools like Evilginx sit between the victim and legitimate portals to intercept session tokens. FIDO2 / Passkeys and hardware security keys offer protection against AiTM proxy interception.</p>
        """
    },
    {
        "module_number": 9,
        "title": "Watering Hole Attacks & Compromised Portals",
        "category": "Web Security",
        "estimated_read_time": "7 mins",
        "description": "Understanding strategic website compromise targeting entire student or employee cohorts.",
        "rich_content": """
            <h3>Targeting Communal Resources</h3>
            <p>Instead of sending emails, attackers compromise legitimate websites frequently visited by target organizations and inject exploit kits or fake update prompts.</p>
        """
    },
    {
        "module_number": 10,
        "title": "Cloud Identity & Microsoft 365 OAuth Consent Abuse",
        "category": "Cloud Security",
        "estimated_read_time": "8 mins",
        "description": "How rogue third-party cloud apps trick users into granting permissions to emails and OneDrive files.",
        "rich_content": """
            <h3>Illicit Consent Grants</h3>
            <p>Attackers register malicious OAuth applications asking for <code>Mail.ReadWrite</code> or <code>Files.ReadWrite.All</code> permissions. Always verify the verified publisher badge before authorizing apps.</p>
        """
    },
    {
        "module_number": 11,
        "title": "Credential Stuffing & Password Hygiene",
        "category": "Access Control",
        "estimated_read_time": "6 mins",
        "description": "Why password reuse across portals leads to compromised organizational accounts.",
        "rich_content": """
            <h3>Automated Account Takeovers</h3>
            <p>Breached database leaks allow attackers to feed millions of username/password pairs into automated login scripts. Use unique passwords paired with a reputable password manager.</p>
        """
    },
    {
        "module_number": 12,
        "title": "Incident Containment & Emergency Isolation",
        "category": "Incident Response",
        "estimated_read_time": "7 mins",
        "description": "First responder protocol when a user clicks a malicious payload or enters credentials.",
        "rich_content": """
            <h3>Immediate First Steps</h3>
            <p>1. Disconnect the device from local Wi-Fi / Ethernet.<br/>2. Revoke active cloud sessions.<br/>3. Change master passwords from a clean device.<br/>4. Notify ICT Security Operations immediately.</p>
        """
    },
    {
        "module_number": 13,
        "title": "Data Loss Prevention & Regulated Information Handling",
        "category": "Compliance",
        "estimated_read_time": "7 mins",
        "description": "Safeguarding Personally Identifiable Information (PII) and institutional records.",
        "rich_content": """
            <h3>Protecting Confidential Data</h3>
            <p>Recognize sensitive data markers in attachments, enforce email encryption for external transfers, and adhere to national and university Data Protection Policies.</p>
        """
    },
    {
        "module_number": 14,
        "title": "Building a Human Firewall: Culture & Reporting Protocols",
        "category": "Culture",
        "estimated_read_time": "6 mins",
        "description": "How fast reporting of suspected attacks prevents campus-wide breach propagation.",
        "rich_content": """
            <h3>Collective Defense</h3>
            <p>A resilient security posture relies on rapid reporting. Flagging a suspicious email within minutes allows IT teams to neutralize the campaign for all users across the institution.</p>
        """
    }
]

class ModuleListCreateView(generics.ListCreateAPIView):
    serializer_class = LearningModuleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if not LearningModule.objects.exists():
            for mod in DEFAULT_14_MODULES:
                LearningModule.objects.create(**mod)
        return LearningModule.objects.all().order_by('module_number')

class UserProgressUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        module = LearningModule.objects.get(id=module_id)
        progress, _ = UserProgress.objects.get_or_create(user=request.user, module=module)
        progress.completed = request.data.get('completed', True)
        progress.score = request.data.get('score', 100)
        progress.save()
        return Response({'status': 'progress updated', 'completed': progress.completed})

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserManagementSerializer
    permission_classes = [permissions.AllowAny]