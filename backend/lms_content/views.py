from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import LearningModule, UserProgress, IncidentGuide
from .serializers import LearningModuleSerializer, UserProgressSerializer, AdminUserManagementSerializer
from authentication.models import ActivityAudit, UserProfile
from authentication.views import compute_and_sync_readiness

# ==============================================================================
# 1. Static Rich Learning Curriculum (20 Modules with Active Video URLs)
# ==============================================================================

RICH_20_MODULES = [
    {
        "order": 1,
        "title": "Anatomy of Phishing & Psychological Triggers",
        "category": "Foundations",
        "duration_minutes": 12,
        "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=TNGWIToHmrc",
        "description": "Deep-dive analysis into cognitive manipulation, authority exploitation, scarcity triggers, and technical indicators of credential lures.",
        "content_body": """
            <h2>1. Introduction & Theoretical Foundations</h2>
            <p>Phishing is a form of social engineering where attackers deceive individuals into disclosing confidential information or deploying malware. Unlike pure software exploits, phishing attacks capitalize on human cognitive shortcuts.</p>
            <h3>Core Psychological Attack Vectors:</h3>
            <ul>
                <li><strong>Authority Impersonation:</strong> Cybercriminals forge messages from trusted entities to induce implicit compliance.</li>
                <li><strong>Artificial Urgency & Scarcity:</strong> Imposing stringent deadlines bypasses critical analytical evaluation.</li>
                <li><strong>Fear & Greed:</strong> Threats of account termination or promises of bonuses compel impulsive responses.</li>
            </ul>
            <h2>2. Technical Threat Indicators</h2>
            <p>Deceptive messages exhibit distinct structural anomalies across transport headers and DOM elements:</p>
            <ol>
                <li><strong>Display Name Mismatch:</strong> Friendly headers conflicting with underlying RFC5322.From envelope routing.</li>
                <li><strong>Hyperlink Obfuscation:</strong> Subdomain nesting and redirect chains designed to deceive visual inspection.</li>
            </ol>
        """
    },
    {
        "order": 2,
        "title": "Spear Phishing & Executive Impersonation",
        "category": "Targeted Attacks",
        "duration_minutes": 14,
        "image_url": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=Jcd0Lh0nFXQ",
        "description": "Examine Open Source Intelligence (OSINT) reconnaissance tactics, spear-phishing mechanics, and business email compromise prevention.",
        "content_body": """
            <h2>1. Reconnaissance & OSINT Harvesting</h2>
            <p>Spear phishing leverages open-source data from corporate directories, press releases, and professional networks to craft high-context lures targeting specific roles with transaction or data authorization.</p>
            <h2>2. Business Email Compromise (BEC) Countermeasures</h2>
            <p>Always enforce strict out-of-band verification procedures for fund transfers or credential updates rather than relying solely on email confirmations.</p>
        """
    },
    {
        "order": 3,
        "title": "Email Header Forensics & Cryptographic Authentication",
        "category": "Technical Defense",
        "duration_minutes": 15,
        "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=B9zTp5KQeEI",
        "description": "In-depth study of SMTP transmission headers, SPF validation, DKIM cryptographic signing, and DMARC enforcement policies.",
        "content_body": """
            <h2>1. Anatomy of an SMTP Header</h2>
            <p>Trace the chronological path of an email through Received hops from origin client to final gateway.</p>
            <h2>2. The Defensive Trifecta: SPF, DKIM, DMARC</h2>
            <p>How DNS TXT records and asymmetric cryptographic keys validate sender alignment and dictate quarantine actions.</p>
        """
    },
    {
        "order": 4,
        "title": "IDN Homograph Attacks & Lookalike Domains",
        "category": "Technical Defense",
        "duration_minutes": 11,
        "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=TNGWIToHmrc",
        "description": "Explore internationalized domain spoofing, Cyrillic character substitution, typosquatting variants, and browser Punycode protections.",
        "content_body": """
            <h2>1. Unicode Character Substitution</h2>
            <p>Adversaries replace standard ASCII characters with visually indistinguishable Cyrillic or Greek glyphs.</p>
            <h2>2. Punycode Translation Protections</h2>
            <p>Inspecting how web browsers translate homoglyphs into 'xn--' prefixed ASCII strings.</p>
        """
    },
    {
        "order": 5,
        "title": "Smishing, Vishing & Multi-Channel Attacks",
        "category": "Mobile Security",
        "duration_minutes": 12,
        "image_url": "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=Jcd0Lh0nFXQ",
        "description": "Master the indicators of SMS-based mobile money scams, voice phishing tactics, and WhatsApp social engineering attacks.",
        "content_body": """
            <h2>1. Mobile Social Engineering Channels</h2>
            <p>Analysis of fraudulent alphanumeric sender ID spoofing, urgency SMS lures, and phone-based OTP social engineering.</p>
        """
    },
    {
        "order": 6,
        "title": "Quishing & Visual QR Code Exploits",
        "category": "Emerging Vectors",
        "duration_minutes": 10,
        "image_url": "https://images.unsplash.com/photo-1595079672139-54718cd7afbc?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=UqUXCQRnemk",
        "description": "Understanding how QR code encoding conceals malicious URLs from text-based email filters and physical poster attacks.",
        "content_body": """
            <h2>1. Mechanics of Graphic Payload Obfuscation</h2>
            <p>How QR matrix barcodes bypass static text scanning and safe preview verification practices on mobile scanners.</p>
        """
    },
    {
        "order": 7,
        "title": "Weaponized Attachments & Sandbox Analysis",
        "category": "Malware Vectors",
        "duration_minutes": 14,
        "image_url": "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=TNGWIToHmrc",
        "description": "Techniques for spotting weaponized Office macros, obfuscated PDF javascript payloads, ISO containers, and executable droppers.",
        "content_body": """
            <h2>1. Delivery Vectors & Dropper Payloads</h2>
            <p>Execution sequences of macro-enabled documents, PDF reader exploits, and containerized ISO archives.</p>
        """
    },
    {
        "order": 8,
        "title": "Session Hijacking & Adversary-in-the-Middle (AiTM)",
        "category": "Advanced Threats",
        "duration_minutes": 15,
        "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=B9zTp5KQeEI",
        "description": "How reverse-proxy toolkits intercept authenticated session tokens and bypass legacy two-factor authentication prompts.",
        "content_body": """
            <h2>1. Reverse Proxies & Session Stealing</h2>
            <p>How tools like Evilginx proxy real credentials and steal active session cookies to bypass standard OTP MFA.</p>
        """
    },
    {
        "order": 9,
        "title": "Watering Hole Attacks & Portal Compromise",
        "category": "Web Security",
        "duration_minutes": 12,
        "image_url": "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=TNGWIToHmrc",
        "description": "Understand strategic web compromise targeting student cohorts and institutional portals.",
        "content_body": """
            <h2>1. Third-Party Web Injections</h2>
            <p>Identifying compromised legitimate websites used as staging grounds for drive-by download operations.</p>
        """
    },
    {
        "order": 10,
        "title": "Cloud Identity & OAuth Consent Abuse",
        "category": "Cloud Security",
        "duration_minutes": 13,
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=Jcd0Lh0nFXQ",
        "description": "Identify malicious third-party OAuth enterprise applications requesting excessive mailbox and file permissions.",
        "content_body": """
            <h2>1. Illicit OAuth Apps</h2>
            <p>How malicious consent prompts maintain persistent cloud mailbox access even across account password resets.</p>
        """
    },
    {
        "order": 11,
        "title": "Credential Stuffing & Password Hygiene",
        "category": "Access Control",
        "duration_minutes": 11,
        "image_url": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=TNGWIToHmrc",
        "description": "Preventing automated account takeovers using breach leak lists and master passphrase management.",
        "content_body": """
            <h2>1. Automated Attack Pipelines</h2>
            <p>Credential dumps, password reuse vulnerabilities, and the enforcement of zero-knowledge password managers.</p>
        """
    },
    {
        "order": 12,
        "title": "Incident Containment & Emergency Isolation",
        "category": "Incident Response",
        "duration_minutes": 14,
        "image_url": "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=Jcd0Lh0nFXQ",
        "description": "First responder protocol when a user clicks a malicious payload, enters credentials, or notices unauthorized account activity.",
        "content_body": """
            <h2>1. Immediate 4-Step Triage</h2>
            <p>Hardware disconnect, global session revocation, master password reset, and technical security team escalation.</p>
        """
    },
    {
        "order": 13,
        "title": "Data Loss Prevention & Information Classification",
        "category": "Compliance",
        "duration_minutes": 12,
        "image_url": "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=B9zTp5KQeEI",
        "description": "Safeguarding Personally Identifiable Information (PII), academic transcripts, and institutional secrets.",
        "content_body": """
            <h2>1. Data Classification Tiers</h2>
            <p>Categorizing institutional data into Public, Internal, Confidential, and Restricted tiers.</p>
        """
    },
    {
        "order": 14,
        "title": "Building a Human Firewall & Reporting Culture",
        "category": "Culture",
        "duration_minutes": 10,
        "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=TNGWIToHmrc",
        "description": "How rapid reporting of suspected attacks empowers automated security orchestration to purge threats campus-wide.",
        "content_body": """
            <h2>1. Automated Defense Loops</h2>
            <p>The operational mechanics of Phish Alert reporting buttons and automated mailbox quarantine sweeps.</p>
        """
    },
    {
        "order": 15,
        "title": "AI-Driven Social Engineering & Deepfakes",
        "category": "Emerging Vectors",
        "duration_minutes": 12,
        "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=Jcd0Lh0nFXQ",
        "description": "Recognizing synthetic media, voice cloning (audio deepfakes), and Large Language Model (LLM) generated phishing campaigns.",
        "content_body": """
            <h2>1. Synthetic Audio and Text</h2>
            <p>Evaluating AI-generated spear phishing and establishing strict verbal challenge-handshake protocols.</p>
        """
    },
    {
        "order": 16,
        "title": "Physical Security, Tailgating & USB Drops",
        "category": "Physical Defense",
        "duration_minutes": 10,
        "image_url": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=TNGWIToHmrc",
        "description": "Bridging the gap between physical facility access and digital network compromise.",
        "content_body": """
            <h2>1. Physical Vector Interception</h2>
            <p>Tailgating prevention, HID Rubber Ducky hardware attacks, and USB hygiene policies.</p>
        """
    },
    {
        "order": 17,
        "title": "Secure Remote Work & Public Wi-Fi Risks",
        "category": "Network Security",
        "duration_minutes": 11,
        "image_url": "https://images.unsplash.com/photo-1528310263766-d7e1f72cf39e?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=B9zTp5KQeEI",
        "description": "Understanding the threats of rogue access points, Evil Twins, and the necessity of Virtual Private Networks (VPNs).",
        "content_body": """
            <h2>1. Untrusted Hotspots</h2>
            <p>Rogue access points, SSL stripping, and enforcing corporate VPN encryption tunnels.</p>
        """
    },
    {
        "order": 18,
        "title": "Insider Threats & Privilege Escalation",
        "category": "Advanced Threats",
        "duration_minutes": 13,
        "image_url": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=Jcd0Lh0nFXQ",
        "description": "Identifying accidental, negligent, and malicious insiders, and enforcing the Principle of Least Privilege (PoLP).",
        "content_body": """
            <h2>1. Zero Privilege Creep</h2>
            <p>Enforcing Role-Based Access Control (RBAC), audit logs, and just-in-time access windows.</p>
        """
    },
    {
        "order": 19,
        "title": "Supply Chain Attacks & Vendor Risk",
        "category": "Advanced Threats",
        "duration_minutes": 15,
        "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=B9zTp5KQeEI",
        "description": "Understanding how adversaries compromise trusted third-party software updates to infiltrate highly secure target networks.",
        "content_body": """
            <h2>1. Upstream Dependencies</h2>
            <p>Lessons from SolarWinds and 3CX: signing key security and third-party risk management (TPRM).</p>
        """
    },
    {
        "order": 20,
        "title": "Zero Trust Architecture (ZTA) Fundamentals",
        "category": "Enterprise Strategy",
        "duration_minutes": 14,
        "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        "video_url": "https://www.youtube.com/watch?v=B9zTp5KQeEI",
        "description": "Moving away from the obsolete 'castle-and-moat' perimeter model toward continuous identity verification.",
        "content_body": """
            <h2>1. The Zero Trust Paradigm</h2>
            <p>Assume breach, verify explicitly, and compute real-time risk scores for every session request.</p>
        """
    }
]

# ==============================================================================
# 2. Default Incident Recovery Guides
# ==============================================================================

DEFAULT_RUNBOOKS = [
    {
        "title": "Compromised Portal or SSO Credentials",
        "threat_category": "Credential Harvesting",
        "severity": "CRITICAL",
        "summary": "Immediate response protocol when an employee inadvertently enters domain/SSO credentials on a harvested landing page.",
        "immediate_steps": (
            "1. Revoke all active user sessions across cloud IdPs and SSO gateways.\n"
            "2. Force an immediate administrative password reset through the directory management console.\n"
            "3. Audit registered MFA methods to verify no rogue secondary authenticators were bound.\n"
            "4. Check tenant sign-in logs for anomalous foreign IP addresses and token replay attempts."
        ),
        "containment_checklist": (
            "Invalidate active OAuth refresh tokens and session cookies\n"
            "Reset SSO password and invalidate previous cached hashes\n"
            "Verify secondary MFA phone numbers and authenticator bindings\n"
            "Review mailbox forwarding rules for illicit external routing\n"
            "Quarantine and sweep recipient inboxes across the domain"
        )
    },
    {
        "title": "Adversary-in-the-Middle (AiTM) MFA Bypass",
        "threat_category": "Session Token Hijacking",
        "severity": "CRITICAL",
        "summary": "Containment runbook for reverse-proxy attacks that intercepted both authentication credentials and active session cookies in real time.",
        "immediate_steps": (
            "1. Immediately revoke all issued browser session cookies and active OAuth tokens for the affected account.\n"
            "2. Inspect Conditional Access and IdP logs for the reverse-proxy IP address that completed authentication.\n"
            "3. Enforce FIDO2 WebAuthn authentication requirements for privileged and targeted user groups.\n"
            "4. Block identified proxy domains and upstream IP blocks at the enterprise perimeter firewall and DNS resolver."
        ),
        "containment_checklist": (
            "Execute administrative session termination across all SaaS apps\n"
            "Audit cloud audit logs for illicit API keys generated during session hijacking\n"
            "Block malicious reverse-proxy domains at gateway DNS level\n"
            "Check for unauthorized changes to delegate access permissions"
        )
    },
    {
        "title": "Weaponized Office Macro or Malicious Attachment Execution",
        "threat_category": "Malware & Droppers",
        "severity": "HIGH",
        "summary": "Containment and triage procedures when an end-user executes a macro-enabled file (.xlsm, .docm) or compressed archive (.iso, .zip).",
        "immediate_steps": (
            "1. Disconnect the affected endpoint from the local network immediately.\n"
            "2. DO NOT power off the computer; keep it on to preserve volatile RAM memory for forensic analysis.\n"
            "3. Identify the originating email subject, sender domain, and attachment hash (SHA-256).\n"
            "4. Search enterprise mail filters and purge all identical attachments from company mailboxes."
        ),
        "containment_checklist": (
            "Isolate workstation from physical and wireless networks\n"
            "Capture volatile RAM image prior to system shutdown\n"
            "Extract attachment hash and query Threat Intel endpoints\n"
            "Purge attachment across all tenant mailboxes\n"
            "Initiate endpoint EDR deep scan and process tree analysis"
        )
    },
    {
        "title": "CEO Fraud / Business Email Compromise (BEC) Wire Lure",
        "threat_category": "Executive Impersonation",
        "severity": "HIGH",
        "summary": "Triage steps for urgency-driven financial redirection, vendor invoice tampering, or gift card solicitation spoofing leadership.",
        "immediate_steps": (
            "1. If funds were initiated, immediately contact the originating bank's fraud desk to request an urgent recall/wire freeze.\n"
            "2. Verify the payment request via out-of-band communication.\n"
            "3. Inspect the email headers to determine if the message was sent via external domain lookalike spoofing or an internal mailbox compromise.\n"
            "4. If originating from an internal account, quarantine the account and follow the Compromised Credentials runbook."
        ),
        "containment_checklist": (
            "Notify corporate finance and issuing bank fraud departments\n"
            "Perform out-of-band verification with purported requestor\n"
            "Block lookalike domain and external IP at the mail filter\n"
            "Inspect mail gateway logs for targeted spear-phishing distribution"
        )
    },
    {
        "title": "Mobile Smishing & Rogue M-Pesa / SMS Gateway Interception",
        "threat_category": "SMS Social Engineering",
        "severity": "MEDIUM",
        "summary": "Procedures for handling alphanumeric sender ID spoofing, fraudulent reversal notifications, and SMS credential harvesting links.",
        "immediate_steps": (
            "1. Advise the user to immediately change mobile banking and wallet PINs through authorized USSD codes or official apps.\n"
            "2. Report the fraudulent sender ID, callback number, and embedded links to telecommunications providers.\n"
            "3. Submit the malicious phishing URL to the enterprise URL scanner and global threat intelligence feeds.\n"
            "4. Issue a company-wide security advisory if multiple staff receive identical smishing lures."
        ),
        "containment_checklist": (
            "Update wallet/banking PINs via verified direct channels\n"
            "Submit rogue URL to internal URL scanner and blocklists\n"
            "Flag alphanumeric sender ID with local carrier fraud desks\n"
            "Distribute awareness advisory to staff regarding current campaign"
        )
    }
]

def seed_runbooks_if_needed():
    try:
        if IncidentGuide.objects.count() == 0:
            for item in DEFAULT_RUNBOOKS:
                IncidentGuide.objects.create(
                    title=item["title"],
                    threat_category=item["threat_category"],
                    severity=item["severity"],
                    summary=item["summary"],
                    immediate_steps=item["immediate_steps"],
                    containment_checklist=item["containment_checklist"]
                )
    except Exception as e:
        print(f"Runbook Seeding Exception: {e}")

# ==============================================================================
# 3. Learning Module & Progress API Views
# ==============================================================================

class ModuleListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            for idx, mod in enumerate(RICH_20_MODULES):
                obj, created = LearningModule.objects.get_or_create(
                    title=mod.get("title"),
                    defaults={
                        "module_number": mod.get("order", idx + 1),
                        "category": mod.get("category", "Foundations"),
                        "description": mod.get("description", ""),
                        "rich_content": mod.get("content_body", ""),
                        "image_url": mod.get("image_url", ""),
                        "video_url": mod.get("video_url", ""),
                        "estimated_read_time": f"{mod.get('duration_minutes', 12)} mins"
                    }
                )
                if not created:
                    updated = False
                    if obj.video_url != mod.get("video_url"):
                        obj.video_url = mod.get("video_url")
                        updated = True
                    if not obj.image_url and mod.get("image_url"):
                        obj.image_url = mod.get("image_url")
                        updated = True
                    if updated:
                        obj.save()

            all_modules = LearningModule.objects.all().order_by('id')
            for idx, mod in enumerate(all_modules):
                correct_number = idx + 1
                if mod.module_number != correct_number:
                    mod.module_number = correct_number
                    mod.save()

        except Exception as e:
            print(f"Module Sync Exception: {e}")

        completed_ids = set(
            UserProgress.objects.filter(user=request.user, completed=True).values_list('module_id', flat=True)
        )

        modules = LearningModule.objects.all().order_by('module_number')
        data = []
        for mod in modules:
            data.append({
                'id': mod.id,
                'module_number': mod.module_number,
                'title': mod.title,
                'description': mod.description,
                'category': mod.category,
                'video_url': mod.video_url or '',
                'image_url': mod.image_url or '',
                'rich_content': mod.rich_content or '',
                'document': mod.document.url if hasattr(mod, 'document') and mod.document else None,
                'estimated_read_time': mod.estimated_read_time or '12 mins',
                'is_completed': mod.id in completed_ids,
                'completed': mod.id in completed_ids,
            })
            
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        is_admin = request.user.is_staff or getattr(getattr(request.user, 'profile', None), 'is_admin', False)
        if not is_admin:
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)
            
        mod = LearningModule.objects.create(
            module_number=request.data.get('module_number', LearningModule.objects.count() + 1),
            title=request.data.get('title', 'Untitled Module'),
            category=request.data.get('category', 'Foundations'),
            description=request.data.get('description', ''),
            rich_content=request.data.get('rich_content', ''),
            image_url=request.data.get('image_url', ''),
            video_url=request.data.get('video_url', ''),
            estimated_read_time=request.data.get('estimated_read_time', '12 mins')
        )
        
        if 'document' in request.FILES:
            mod.document = request.FILES['document']
            mod.save()
            
        return Response({'id': mod.id, 'title': mod.title}, status=status.HTTP_201_CREATED)


class ModuleDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        mod = get_object_or_404(LearningModule, pk=pk)
        is_done = UserProgress.objects.filter(user=request.user, module=mod, completed=True).exists()
        return Response({
            'id': mod.id,
            'module_number': mod.module_number,
            'title': mod.title,
            'category': mod.category,
            'description': mod.description,
            'video_url': mod.video_url,
            'image_url': mod.image_url,
            'rich_content': mod.rich_content,
            'document': mod.document.url if mod.document else None,
            'estimated_read_time': mod.estimated_read_time,
            'is_completed': is_done,
            'completed': is_done,
        }, status=status.HTTP_200_OK)

    def put(self, request, pk):
        is_admin = request.user.is_staff or getattr(getattr(request.user, 'profile', None), 'is_admin', False)
        if not is_admin:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        mod = get_object_or_404(LearningModule, pk=pk)
        if 'module_number' in request.data:
            mod.module_number = request.data.get('module_number', mod.module_number)
        if 'title' in request.data:
            mod.title = request.data.get('title', mod.title)
        if 'category' in request.data:
            mod.category = request.data.get('category', mod.category)
        if 'description' in request.data:
            mod.description = request.data.get('description', mod.description)
        if 'video_url' in request.data:
            mod.video_url = request.data.get('video_url', mod.video_url)
        if 'image_url' in request.data:
            mod.image_url = request.data.get('image_url', mod.image_url)
        if 'rich_content' in request.data:
            mod.rich_content = request.data.get('rich_content', mod.rich_content)
        if 'estimated_read_time' in request.data:
            mod.estimated_read_time = request.data.get('estimated_read_time', mod.estimated_read_time)
            
        if 'document' in request.FILES:
            mod.document = request.FILES['document']
        
        mod.save()
        return Response({'message': 'Updated successfully'}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        is_admin = request.user.is_staff or getattr(getattr(request.user, 'profile', None), 'is_admin', False)
        if not is_admin:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        mod = get_object_or_404(LearningModule, pk=pk)
        mod.delete()
        return Response({'message': 'Deleted'}, status=status.HTTP_200_OK)


class UserProgressUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        module = get_object_or_404(LearningModule, id=module_id)
        progress, _ = UserProgress.objects.get_or_create(user=request.user, module=module)
        was_completed = progress.completed
        progress.completed = request.data.get('completed', True)
        progress.score = request.data.get('score', 100)
        progress.save()

        user = request.user
        total = LearningModule.objects.count()
        completed = UserProgress.objects.filter(user=user, completed=True).count()
        progress_pct = round((completed / total) * 100, 1) if total > 0 else 0

        if progress.completed and not was_completed:
            ActivityAudit.objects.create(
                user=user,
                title=f"Completed Module {module.module_number}",
                description=f"Completed '{module.title}' ({completed}/{total} modules)",
                activity_type="lms"
            )

        profile, _ = UserProfile.objects.get_or_create(user=user)
        new_score = compute_and_sync_readiness(user, profile)

        return Response({
            'status': 'progress updated',
            'module_id': module.id,
            'completed': progress.completed,
            'completed_modules': completed,
            'total_modules': total,
            'progress_percentage': progress_pct,
            'new_score': new_score
        }, status=status.HTTP_200_OK)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserManagementSerializer
    permission_classes = [permissions.AllowAny]


# ==============================================================================
# 4. Incident Recovery Guides
# ==============================================================================

class IncidentGuideSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = IncidentGuide
        fields = '__all__'


class IncidentGuideListCreateView(generics.ListCreateAPIView):
    queryset = IncidentGuide.objects.all().order_by('-created_at')
    serializer_class = IncidentGuideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        seed_runbooks_if_needed()
        return super().get(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class IncidentGuideDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = IncidentGuide.objects.all()
    serializer_class = IncidentGuideSerializer
    permission_classes = [permissions.IsAuthenticated]