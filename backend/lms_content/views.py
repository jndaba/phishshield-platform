from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import LearningModule, UserProgress, IncidentGuide
from .serializers import LearningModuleSerializer, UserProgressSerializer, AdminUserManagementSerializer
from authentication.models import ActivityAudit


# ==============================================================================
# 1. Static Rich Learning Curriculum (14 Comprehensive Modules)
# ==============================================================================

RICH_2PAGE_MODULES = [
    {
        "order": 1,
        "title": "Anatomy of Phishing & Psychological Triggers",
        "category": "Foundations",
        "duration_minutes": 12,
        "description": "Deep-dive analysis into cognitive manipulation, authority exploitation, scarcity triggers, and technical indicators of credential lures.",
        "content_body": """
            <h2>1. Introduction & Theoretical Foundations</h2>
            <p>Phishing is a form of social engineering where attackers deceive individuals into disclosing confidential information or deploying malware. Unlike pure software exploits, phishing attacks capitalize on human cognitive shortcuts.</p>
            
            <h3>Core Psychological Attack Vectors:</h3>
            <ul>
                <li><strong>Authority Impersonation:</strong> Cybercriminals forge messages from trusted entities (e.g., University Administration, Chief Financial Officers, Banking Officers) to create implicit compliance.</li>
                <li><strong>Artificial Urgency & Scarcity:</strong> Imposing stringent deadlines (e.g., 'Account scheduled for deletion in 15 minutes') bypasses critical thinking.</li>
                <li><strong>Fear & Greed:</strong> Threats of legal action, fines, or fraudulent promises of tax rebates.</li>
            </ul>

            <div class="my-4 p-4 rounded-xl bg-slate-900 border border-slate-700">
                <h4 class="text-teal-400 font-bold text-sm mb-1">Key Takeaway</h4>
                <p class="text-xs text-slate-300">Technical email defenses stop standard spam, but human cognitive awareness is the final perimeter defense against customized lures.</p>
            </div>

            <h2>2. Technical Threat Indicators (Page 2)</h2>
            <p>Every deceptive message exhibits quantifiable artifacts across its delivery headers and body structure:</p>
            <ol>
                <li><strong>Sender Envelope vs. Friendly Display Name:</strong> Attackers configure friendly names as 'Icons Support' while the underlying RFC5322.From header routes to untrusted servers.</li>
                <li><strong>Mismatched Hyperlinks:</strong> Hovering over anchor text reveals redirection to lookalike subdomains or URL shorteners.</li>
                <li><strong>Generic Salutations:</strong> Bulk campaigns utilize 'Dear Customer' instead of personalized tokens.</li>
            </ol>

            <h3>Defense Summary & Immediate Checklist:</h3>
            <ul class="list-disc pl-5 space-y-1 text-xs">
                <li>Verify unexpected requests out-of-band using registered telephone numbers.</li>
                <li>Inspect domain roots before submitting credentials.</li>
                <li>Report suspicious payloads to the institutional security operations center.</li>
            </ul>
        """
    },
    {
        "order": 2,
        "title": "Spear Phishing & Executive Impersonation",
        "category": "Targeted Attacks",
        "duration_minutes": 14,
        "description": "Examine Open Source Intelligence (OSINT) reconnaissance tactics, spear-phishing mechanics, and business email compromise prevention.",
        "content_body": """
            <h2>1. Reconnaissance & OSINT Harvesting</h2>
            <p>Spear phishing represents targeted attacks directed at specific individuals, departments, or high-value organizational roles. Attackers leverage OSINT across institutional directories, LinkedIn, and social profiles to construct convincing narratives.</p>
            
            <h3>Phases of a Spear Phishing Campaign:</h3>
            <ul>
                <li><strong>Target Profiling:</strong> Identifying roles with payment authorization, student database access, or server infrastructure control.</li>
                <li><strong>Narrative Formulation:</strong> Mimicking vendor invoicing formats, procurement memos, or exam moderation schedules.</li>
                <li><strong>Weaponization:</strong> Embedding individualized credential-harvesting landing pages.</li>
            </ul>

            <h2>2. Business Email Compromise (BEC) Mechanics (Page 2)</h2>
            <p>In BEC attacks, adversaries compromise legitimate executive accounts or register lookalike domains to issue fraudulent wire requests or statutory payroll redirection.</p>

            <div class="my-4 p-4 rounded-xl bg-slate-900 border border-slate-700">
                <h4 class="text-teal-400 font-bold text-sm mb-1">Critical Defensive Rule</h4>
                <p class="text-xs text-slate-300">Never execute changes to banking coordinates or student financial records solely based on email instructions. Dual-authorization protocols are mandatory.</p>
            </div>

            <h3>Summary & Mitigation:</h3>
            <ul class="list-disc pl-5 space-y-1 text-xs">
                <li>Implement multi-factor authentication (MFA) across all webmail and administrative gateways.</li>
                <li>Establish telephone callbacks for fund transfers above organizational thresholds.</li>
            </ul>
        """
    },
    {
        "order": 3,
        "title": "Email Header Forensics & Cryptographic Authentication",
        "category": "Technical Defense",
        "duration_minutes": 15,
        "description": "In-depth study of SMTP transmission headers, SPF validation, DKIM cryptographic signing, and DMARC enforcement policies.",
        "content_body": """
            <h2>1. Anatomy of an SMTP Header</h2>
            <p>Simple Mail Transfer Protocol (SMTP) by default does not restrict sender addresses. Forensic analysis requires parsing RFC headers to authenticate originating hosts.</p>
            
            <h3>Crucial Header Elements:</h3>
            <ul>
                <li><code>Received: from</code> - Identifies the exact IP hop trajectory from sender client to receiving MX gateway.</li>
                <li><code>Authentication-Results:</code> - Records automated verdict checks for SPF, DKIM, and DMARC policies.</li>
                <li><code>Return-Path:</code> - The address where bounce reports and delivery receipts are directed.</li>
            </ul>

            <h2>2. Email Authentication Protocols (Page 2)</h2>
            <p>Three protocols form the pillar of modern domain spoofing defense:</p>
            <ol>
                <li><strong>SPF (Sender Policy Framework):</strong> DNS TXT records listing authorized server IP addresses permitted to send on behalf of the domain.</li>
                <li><strong>DKIM (DomainKeys Identified Mail):</strong> Public-key cryptography validating that message bodies were not altered in transit.</li>
                <li><strong>DMARC:</strong> Directs receiving mailboxes to quarantine or reject unaligned messages (<code>p=reject</code>).</li>
            </ol>

            <h3>Module Summary:</h3>
            <p class="text-xs text-slate-300">A forged display name can look authentic, but inspecting raw headers exposes the unauthenticated origin immediately.</p>
        """
    },
    {
        "order": 4,
        "title": "IDN Homograph Attacks & Lookalike Domains",
        "category": "Technical Defense",
        "duration_minutes": 11,
        "description": "Explore internationalized domain spoofing, Cyrillic character substitution, typosquatting variants, and browser Punycode protections.",
        "content_body": """
            <h2>1. Unicode vs. ASCII Spoofing</h2>
            <p>Internationalized Domain Names (IDNs) permit non-Latin scripts in web addresses. Adversaries exploit visually identical glyphs (homoglyphs) to register fraudulent lookalikes.</p>
            
            <h3>Example Deceptions:</h3>
            <ul>
                <li>Replacing Latin 'a' (U+0061) with Cyrillic 'а' (U+0430).</li>
                <li>Replacing Latin 'o' (U+006F) with Greek omicron 'ο' (U+03BF).</li>
                <li>Typosquatting permutations (e.g., <code>examp1e.com</code> or <code>safaricom-support.net</code>).</li>
            </ul>

            <h2>2. Punycode & URL Verification (Page 2)</h2>
            <p>Modern web browsers convert non-ASCII characters into Punycode strings prefixed with <code>xn--</code> (e.g., <code>xn--sfaricom-t2a.com</code>).</p>

            <div class="my-4 p-4 rounded-xl bg-slate-900 border border-slate-700">
                <h4 class="text-teal-400 font-bold text-sm mb-1">Pro Tip</h4>
                <p class="text-xs text-slate-300">Always check your browser address bar for <code>xn--</code> strings before entering credentials into unfamiliar portals.</p>
            </div>

            <h3>Summary:</h3>
            <p class="text-xs text-slate-300">Deploy automated URL heuristic scanners and inspect domain structures before entering authentication tokens.</p>
        """
    },
    {
        "order": 5,
        "title": "Smishing, Vishing & Multi-Channel Attacks",
        "category": "Mobile Security",
        "duration_minutes": 12,
        "description": "Master the indicators of SMS-based mobile money scams, voice phishing tactics, and WhatsApp social engineering attacks.",
        "content_body": """
            <h2>1. Mobile Social Engineering Ecosystem</h2>
            <p>Mobile devices blur personal and organizational perimeters. Attackers target smartphones via SMS (Smishing) and voice calls (Vishing) to harvest OTPs and PINs.</p>
            
            <h3>Common Smishing Vectors:</h3>
            <ul>
                <li><strong>Mobile Money Fraud:</strong> Fabricated transaction cancellation SMS messages prompting victims to click external authorization links.</li>
                <li><strong>Delivery & Courier Alerts:</strong> Unsolicited tracking updates requiring 'rescheduling fees'.</li>
                <li><strong>Vishing Voice Prompts:</strong> Callers impersonating telecommunication customer support requesting one-time verification tokens.</li>
            </ul>

            <h2>2. Defense Architecture on Mobile (Page 2)</h2>
            <p>Never rely on SMS Sender IDs alone, as alphanumeric sender titles can be spoofed by unauthorized SMS gateway operators.</p>

            <h3>Essential Rules:</h3>
            <ul class="list-disc pl-5 space-y-1 text-xs">
                <li>Never share M-Pesa PINs, bank OTPs, or password reset tokens over telephone calls.</li>
                <li>Access banking and university portals directly via official applications rather than embedded SMS hyperlinks.</li>
            </ul>
        """
    },
    {
        "order": 6,
        "title": "Quishing & Visual QR Code Exploits",
        "category": "Emerging Vectors",
        "duration_minutes": 10,
        "description": "Understanding how QR code encoding conceals malicious URLs from text-based email filters and physical poster attacks.",
        "content_body": """
            <h2>1. Mechanics of Quishing Attacks</h2>
            <p>Quishing (QR Code Phishing) embeds malicious URLs inside matrix barcode images. Because the payload is graphical, standard email filters cannot parse the plain text URL directly.</p>
            
            <h3>Attack Contexts:</h3>
            <ul>
                <li><strong>Physical Placement:</strong> Pasting fraudulent QR stickers over parking meters or campus event posters.</li>
                <li><strong>MFA Migration Emails:</strong> Emails instructing users to scan a QR code to update their two-factor authenticator app.</li>
            </ul>

            <h2>2. Safe Scanning Practices (Page 2)</h2>
            <p>Mobile OS camera apps now display destination URLs before redirecting.</p>

            <div class="my-4 p-4 rounded-xl bg-slate-900 border border-slate-700">
                <h4 class="text-teal-400 font-bold text-sm mb-1">Defense Protocol</h4>
                <p class="text-xs text-slate-300">Inspect the full domain hierarchy on your mobile prompt before confirming navigation to any QR-encoded destination.</p>
            </div>
        """
    },
    {
        "order": 7,
        "title": "Weaponized Attachments & Sandbox Analysis",
        "category": "Malware Vectors",
        "duration_minutes": 14,
        "description": "Techniques for spotting weaponized Office macros, obfuscated PDF javascript payloads, ISO containers, and executable droppers.",
        "content_body": """
            <h2>1. Attachment Delivery Vectors</h2>
            <p>Adversaries utilize document formats to bypass boundary defenses and deploy initial access droppers onto endpoints.</p>
            
            <h3>High-Risk File Types:</h3>
            <ul>
                <li><strong>Macro-Enabled Documents (DOCM, XLSM):</strong> Embedded VBA code that fetches remote PowerShell scripts.</li>
                <li><strong>PDF Exploits:</strong> Embedded JavaScript triggering zero-day reader vulnerabilities.</li>
                <li><strong>Disk Images (ISO, VHD):</strong> Containers used to evade gateway antivirus scanning.</li>
            </ul>

            <h2>2. Static & Dynamic Sandbox Analysis (Page 2)</h2>
            <p>Modern endpoint security isolates untrusted attachments within virtual sandbox environments to monitor behavior prior to user execution.</p>

            <h3>Summary:</h3>
            <p class="text-xs text-slate-300">Disable automatic macro execution and scan all external attachments before running on production workstations.</p>
        """
    },
    {
        "order": 8,
        "title": "Session Hijacking & Adversary-in-the-Middle (AiTM)",
        "category": "Advanced Threats",
        "duration_minutes": 15,
        "description": "How reverse-proxy toolkits intercept authenticated session tokens and bypass legacy two-factor authentication prompts.",
        "content_body": """
            <h2>1. Anatomy of AiTM Reverse Proxies</h2>
            <p>Adversary-in-the-Middle (AiTM) proxies sit between the target victim and the genuine authentication server (e.g., Microsoft 365 or Google Workspace).</p>
            
            <h3>Attack Flow:</h3>
            <ol>
                <li>The victim connects to the proxy server believing it to be the true login portal.</li>
                <li>The proxy relays user credentials to the real portal and passes back MFA challenges.</li>
                <li>Once MFA is satisfied, the proxy intercepts the active HTTP session cookie, bypassing subsequent login prompts.</li>
            </ol>

            <h2>2. FIDO2 & Hardware Key Defense (Page 2)</h2>
            <p>Legacy SMS and TOTP apps do not bind authentication to the origin URL. FIDO2 / Passkeys cryptographically bind authentication tokens to the specific domain, defeating AiTM proxies entirely.</p>
        """
    },
    {
        "order": 9,
        "title": "Watering Hole Attacks & Portal Compromise",
        "category": "Web Security",
        "duration_minutes": 12,
        "description": "Understand strategic web compromise targeting student cohorts and institutional portals.",
        "content_body": """
            <h2>1. Strategic Website Compromise</h2>
            <p>Watering hole attacks identify websites frequently visited by target organizations, compromising the host server to distribute drive-by exploit kits.</p>
            
            <h3>Indicators of Compromise:</h3>
            <ul>
                <li>Unprompted browser update prompts upon loading university resources.</li>
                <li>Injected third-party JavaScript tracking scripts.</li>
            </ul>

            <h2>2. Perimeter Hardening (Page 2)</h2>
            <p>Maintain patch management on web browsers and implement DNS-layer filtering to block known malicious hosting ranges.</p>
        """
    },
    {
        "order": 10,
        "title": "Cloud Identity & OAuth Consent Abuse",
        "category": "Cloud Security",
        "duration_minutes": 13,
        "description": "Identify malicious third-party OAuth enterprise applications requesting excessive mailbox and file permissions.",
        "content_body": """
            <h2>1. Illicit OAuth Consent Grants</h2>
            <p>Rather than stealing passwords, attackers register malicious cloud apps requesting delegated access tokens (e.g., <code>Mail.ReadWrite</code> or <code>Files.ReadWrite.All</code>).</p>
            
            <h3>Warning Signs:</h3>
            <ul>
                <li>Unverified app publisher alerts.</li>
                <li>Permissions requesting offline access to mailbox archives.</li>
            </ul>

            <h2>2. App Governance (Page 2)</h2>
            <p>Regularly review and revoke authorized third-party apps from your cloud account security settings.</p>
        """
    },
    {
        "order": 11,
        "title": "Credential Stuffing & Password Hygiene",
        "category": "Access Control",
        "duration_minutes": 11,
        "description": "Preventing automated account takeovers using breach leak lists and master passphrase management.",
        "content_body": """
            <h2>1. Mechanics of Credential Stuffing</h2>
            <p>Attackers feed millions of leaked username/password combinations into automated scripts against university systems.</p>
            
            <h2>2. Passphrase Resilience (Page 2)</h2>
            <p>Use long, unique passphrases paired with an encrypted password manager to eliminate cross-account exposure.</p>
        """
    },
    {
        "order": 12,
        "title": "Incident Containment & Emergency Isolation",
        "category": "Incident Response",
        "duration_minutes": 14,
        "description": "First responder protocol when a user clicks a malicious payload, enters credentials, or notices unauthorized account activity.",
        "content_body": """
            <h2>1. Emergency 4-Step Containment Protocol</h2>
            <ol>
                <li><strong>Network Isolation:</strong> Disconnect Wi-Fi or unplug Ethernet immediately.</li>
                <li><strong>Session Revocation:</strong> Revoke all active cloud sessions from a separate clean device.</li>
                <li><strong>Password Reset:</strong> Change master credentials and invalidate application passwords.</li>
                <li><strong>Notification:</strong> Alert the ICT Security desk with timestamp details.</li>
            </ol>
        """
    },
    {
        "order": 13,
        "title": "Data Loss Prevention & Information Classification",
        "category": "Compliance",
        "duration_minutes": 12,
        "description": "Safeguarding Personally Identifiable Information (PII), academic transcripts, and institutional secrets.",
        "content_body": """
            <h2>1. Data Classification Tiers</h2>
            <p>Learn how to categorize data into Public, Internal, Confidential, and Restricted tiers to apply adequate encryption safeguards.</p>
        """
    },
    {
        "order": 14,
        "title": "Building a Human Firewall & Reporting Culture",
        "category": "Culture",
        "duration_minutes": 10,
        "description": "How rapid reporting of suspected attacks empowers automated security orchestration to purge threats campus-wide.",
        "content_body": """
            <h2>1. Collective Defense & Threat Intelligence</h2>
            <p>A resilient security culture relies on fast reporting. When one student reports a phishing email within 5 minutes, automated systems can remove that message from all other inboxes before clicks occur.</p>
        """
    }
]


# ==============================================================================
# 2. Learning Module & Progress API Views
# ==============================================================================

class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = LearningModule.objects.all().order_by('order')
    serializer_class = LearningModuleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if not LearningModule.objects.exists():
            for mod in RICH_2PAGE_MODULES:
                LearningModule.objects.create(**mod)
        return LearningModule.objects.all().order_by('order')


class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LearningModule.objects.all()
    serializer_class = LearningModuleSerializer
    permission_classes = [permissions.AllowAny]


class UserProgressUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        module = get_object_or_404(LearningModule, id=module_id)
        progress, _ = UserProgress.objects.get_or_create(user=request.user, module=module)
        progress.completed = request.data.get('completed', True)
        progress.score = request.data.get('score', 100)
        progress.save()

        # Dynamically compute and store the new readiness score
        user = request.user
        total = LearningModule.objects.count()
        completed = UserProgress.objects.filter(user=user, completed=True).count()
        
        if hasattr(user, 'profile'):
            user.profile.readiness_score = min(100, int((completed / total) * 100)) if total > 0 else 0
            user.profile.save()
            new_score = user.profile.readiness_score
        else:
            new_score = 0

        return Response({
            'status': 'progress updated',
            'completed': progress.completed,
            'new_score': new_score
        }, status=status.HTTP_200_OK)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserManagementSerializer
    permission_classes = [permissions.AllowAny]


# ==============================================================================
# 3. Incident Recovery Guides (Integrated Views & Pre-Existing Seed Data)
# ==============================================================================

class IncidentGuideSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = IncidentGuide
        fields = [
            'id',
            'title',
            'threat_category',
            'severity',
            'summary',
            'immediate_steps',
            'containment_checklist',
            'author_name',
            'created_at',
            'updated_at',
        ]


def seed_default_guides(created_by_user=None):
    """Seed comprehensive, realistic cybersecurity incident response runbooks if empty."""
    default_guides = [
        {
            "title": "Compromised Corporate & Portal Credentials",
            "threat_category": "Credential Harvesting",
            "severity": "CRITICAL",
            "summary": "Immediate containment procedure for employees or students who entered their institutional credentials, passwords, or MFA codes into a spoofed landing page.",
            "immediate_steps": (
                "1. Immediately access the legitimate portal from a clean, known-safe device and change your master password.\n"
                "2. Terminate all active web and mobile application sessions under Security Settings.\n"
                "3. Re-enroll multi-factor authentication (MFA) tokens to invalidate any adversary sessions.\n"
                "4. Notify IT Security Operations via the Support Helpdesk triage desk with the phishing URL."
            ),
            "containment_checklist": (
                "Master password changed to a 14+ character passphrase\n"
                "All remote sessions forcibly disconnected\n"
                "MFA authenticator keys refreshed\n"
                "Account audit logs inspected for unauthorized logins"
            )
        },
        {
            "title": "Phishing Link Clicked & Suspicious File Downloaded",
            "threat_category": "Malware & Ransomware Infiltration",
            "severity": "CRITICAL",
            "summary": "Emergency triage for scenarios where an email payload or attachment (.exe, .scr, .iso, .zip, macro-enabled doc) was downloaded or executed.",
            "immediate_steps": (
                "1. Disconnect the machine from Wi-Fi and unplug the physical Ethernet cable immediately.\n"
                "2. Do NOT power off the computer—keep RAM memory intact for forensic memory analysis.\n"
                "3. Inform the incident coordinator with the exact timestamp and attachment name.\n"
                "4. Run a full offline scan using the endpoint protection / Windows Defender offline scanner."
            ),
            "containment_checklist": (
                "Physical and wireless network disconnected\n"
                "Suspicious file quarantined without opening\n"
                "Host isolation verified on network router\n"
                "Incident triage ticket dispatched to Admin"
            )
        },
        {
            "title": "M-Pesa & Mobile Money Social Engineering Incident",
            "threat_category": "Financial Fraud & Vishing",
            "severity": "HIGH",
            "summary": "Rapid response guide for individuals targeted by fake customer care callers, fake transaction reversal SMS alerts, or SIM-swap solicitations.",
            "immediate_steps": (
                "1. Never share your M-Pesa PIN, one-time passwords (OTP), or date of birth over phone or SMS.\n"
                "2. If PIN was disclosed, immediately dial the telecom customer line (*100# or *234#) on another trusted line to freeze the account.\n"
                "3. Forward fraudulent SMS messages and sender numbers to the national telecom fraud hotline (e.g., 333).\n"
                "4. Log the spoofed incident on the PhishShield directory for institutional record."
            ),
            "containment_checklist": (
                "M-Pesa / Banking PIN changed immediately\n"
                "Fraudulent number reported to telecom hotline 333\n"
                "Account statement reviewed for unauthorized withdrawals\n"
                "SIM-swap protection lock enabled with operator"
            )
        },
        {
            "title": "Session Hijacking & Cookie Theft Remediation",
            "threat_category": "Web Security",
            "severity": "MEDIUM",
            "summary": "Protocol for remediating adversary-in-the-middle (AiTM) attacks where authentication session tokens are intercepted without password disclosure.",
            "immediate_steps": (
                "1. Open your browser settings and clear all cookies, cache, and hosted app data.\n"
                "2. Navigate to your cloud provider (Google, Microsoft 365, GitHub) and click 'Sign out of all other web sessions'.\n"
                "3. Review authorized OAuth third-party applications and revoke permissions for unknown services.\n"
                "4. Verify that no unauthorized forwarding rules have been created in your mailbox settings."
            ),
            "containment_checklist": (
                "Browser cookies and cached storage purged\n"
                "Global session revocation executed\n"
                "Mail forwarding rules verified\n"
                "Third-party OAuth integrations audited"
            )
        }
    ]

    for g in default_guides:
        IncidentGuide.objects.create(
            title=g["title"],
            threat_category=g["threat_category"],
            severity=g["severity"],
            summary=g["summary"],
            immediate_steps=g["immediate_steps"],
            containment_checklist=g["containment_checklist"],
            author=created_by_user
        )


class IncidentGuideListCreateView(APIView):
    """Lists all incident guides (for learners & admins) and allows admins to publish new ones."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not IncidentGuide.objects.exists():
            seed_default_guides(created_by_user=request.user if request.user.is_staff else None)

        guides = IncidentGuide.objects.all().order_by('-created_at')
        serializer = IncidentGuideSerializer(guides, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        is_admin = request.user.is_staff or getattr(getattr(request.user, 'profile', None), 'is_admin', False)
        if not is_admin:
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = IncidentGuideSerializer(data=request.data)
        if serializer.is_valid():
            guide = serializer.save(author=request.user)
            ActivityAudit.objects.create(
                user=request.user,
                title="Incident Guide Authored",
                description=f"Created guide: {guide.title} [{guide.severity}]",
                activity_type="governance"
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IncidentGuideDetailView(APIView):
    """Allows administrators to retrieve, update (edit), or delete an existing incident guide."""
    permission_classes = [permissions.IsAuthenticated]

    def _is_admin(self, user):
        return user.is_staff or getattr(getattr(user, 'profile', None), 'is_admin', False)

    def get(self, request, guide_id):
        guide = get_object_or_404(IncidentGuide, id=guide_id)
        serializer = IncidentGuideSerializer(guide)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, guide_id):
        if not self._is_admin(request.user):
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        guide = get_object_or_404(IncidentGuide, id=guide_id)
        serializer = IncidentGuideSerializer(guide, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            ActivityAudit.objects.create(
                user=request.user,
                title="Incident Guide Updated",
                description=f"Admin modified guide #{guide.id}: {guide.title}",
                activity_type="governance"
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, guide_id):
        if not self._is_admin(request.user):
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)

        guide = get_object_or_404(IncidentGuide, id=guide_id)
        title = guide.title
        guide.delete()

        ActivityAudit.objects.create(
            user=request.user,
            title="Incident Guide Deleted",
            description=f"Permanently removed recovery guide: {title}",
            activity_type="governance",
            risk_score="CRITICAL"
        )
        return Response({'message': f'Guide "{title}" successfully removed.'}, status=status.HTTP_200_OK)