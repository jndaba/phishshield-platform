from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import LearningModule, UserProgress
from .serializers import LearningModuleSerializer, UserProgressSerializer, AdminUserManagementSerializer

RICH_2PAGE_MODULES = [
    {
        "module_number": 1,
        "title": "Anatomy of Phishing & Psychological Triggers",
        "category": "Foundations",
        "estimated_read_time": "12 mins",
        "description": "Deep-dive analysis into cognitive manipulation, authority exploitation, scarcity triggers, and technical indicators of credential lures.",
        "video_url": "https://www.youtube.com/embed/XBkzBrXllBo",
        "rich_content": """
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
        "module_number": 2,
        "title": "Spear Phishing & Executive Impersonation",
        "category": "Targeted Attacks",
        "estimated_read_time": "14 mins",
        "description": "Examine Open Source Intelligence (OSINT) reconnaissance tactics, spear-phishing mechanics, and business email compromise prevention.",
        "video_url": "https://www.youtube.com/embed/9GzF7f-38z8",
        "rich_content": """
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
        "module_number": 3,
        "title": "Email Header Forensics & Cryptographic Authentication",
        "category": "Technical Defense",
        "estimated_read_time": "15 mins",
        "description": "In-depth study of SMTP transmission headers, SPF validation, DKIM cryptographic signing, and DMARC enforcement policies.",
        "video_url": "https://www.youtube.com/embed/2_YnQ5iFm5Q",
        "rich_content": """
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
        "module_number": 4,
        "title": "IDN Homograph Attacks & Lookalike Domains",
        "category": "Technical Defense",
        "estimated_read_time": "11 mins",
        "description": "Explore internationalized domain spoofing, Cyrillic character substitution, typosquatting variants, and browser Punycode protections.",
        "rich_content": """
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
        "module_number": 5,
        "title": "Smishing, Vishing & Multi-Channel Attacks",
        "category": "Mobile Security",
        "estimated_read_time": "12 mins",
        "description": "Master the indicators of SMS-based mobile money scams, voice phishing tactics, and WhatsApp social engineering attacks.",
        "video_url": "https://www.youtube.com/embed/XBkzBrXllBo",
        "rich_content": """
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
        "module_number": 6,
        "title": "Quishing & Visual QR Code Exploits",
        "category": "Emerging Vectors",
        "estimated_read_time": "10 mins",
        "description": "Understanding how QR code encoding conceals malicious URLs from text-based email filters and physical poster attacks.",
        "rich_content": """
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
        "module_number": 7,
        "title": "Weaponized Attachments & Sandbox Analysis",
        "category": "Malware Vectors",
        "estimated_read_time": "14 mins",
        "description": "Techniques for spotting weaponized Office macros, obfuscated PDF javascript payloads, ISO containers, and executable droppers.",
        "rich_content": """
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
        "module_number": 8,
        "title": "Session Hijacking & Adversary-in-the-Middle (AiTM)",
        "category": "Advanced Threats",
        "estimated_read_time": "15 mins",
        "description": "How reverse-proxy toolkits intercept authenticated session tokens and bypass legacy two-factor authentication prompts.",
        "rich_content": """
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
        "module_number": 9,
        "title": "Watering Hole Attacks & Portal Compromise",
        "category": "Web Security",
        "estimated_read_time": "12 mins",
        "description": "Understand strategic web compromise targeting student cohorts and institutional portals.",
        "rich_content": """
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
        "module_number": 10,
        "title": "Cloud Identity & OAuth Consent Abuse",
        "category": "Cloud Security",
        "estimated_read_time": "13 mins",
        "description": "Identify malicious third-party OAuth enterprise applications requesting excessive mailbox and file permissions.",
        "rich_content": """
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
        "module_number": 11,
        "title": "Credential Stuffing & Password Hygiene",
        "category": "Access Control",
        "estimated_read_time": "11 mins",
        "description": "Preventing automated account takeovers using breach leak lists and master passphrase management.",
        "rich_content": """
            <h2>1. Mechanics of Credential Stuffing</h2>
            <p>Attackers feed millions of leaked username/password combinations into automated scripts against university systems.</p>
            
            <h2>2. Passphrase Resilience (Page 2)</h2>
            <p>Use long, unique passphrases paired with an encrypted password manager to eliminate cross-account exposure.</p>
        """
    },
    {
        "module_number": 12,
        "title": "Incident Containment & Emergency Isolation",
        "category": "Incident Response",
        "estimated_read_time": "14 mins",
        "description": "First responder protocol when a user clicks a malicious payload, enters credentials, or notices unauthorized account activity.",
        "rich_content": """
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
        "module_number": 13,
        "title": "Data Loss Prevention & Information Classification",
        "category": "Compliance",
        "estimated_read_time": "12 mins",
        "description": "Safeguarding Personally Identifiable Information (PII), academic transcripts, and institutional secrets.",
        "rich_content": """
            <h2>1. Data Classification Tiers</h2>
            <p>Learn how to categorize data into Public, Internal, Confidential, and Restricted tiers to apply adequate encryption safeguards.</p>
        """
    },
    {
        "module_number": 14,
        "title": "Building a Human Firewall & Reporting Culture",
        "category": "Culture",
        "estimated_read_time": "10 mins",
        "description": "How rapid reporting of suspected attacks empowers automated security orchestration to purge threats campus-wide.",
        "rich_content": """
            <h2>1. Collective Defense & Threat Intelligence</h2>
            <p>A resilient security culture relies on fast reporting. When one student reports a phishing email within 5 minutes, automated systems can remove that message from all other inboxes before clicks occur.</p>
        """
    }
]

class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = LearningModule.objects.all().order_by('module_number')
    serializer_class = LearningModuleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if not LearningModule.objects.exists():
            for mod in RICH_2PAGE_MODULES:
                LearningModule.objects.create(**mod)
        return LearningModule.objects.all().order_by('module_number')

class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LearningModule.objects.all()
    serializer_class = LearningModuleSerializer
    permission_classes = [permissions.AllowAny]

class UserProgressUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        module = LearningModule.objects.get(id=module_id)
        progress, _ = UserProgress.objects.get_or_create(user=request.user, module=module)
        progress.completed = request.data.get('completed', True)
        progress.score = request.data.get('score', 100)
        progress.save()

        # Update readiness
        user = request.user
        total = LearningModule.objects.count()
        completed = UserProgress.objects.filter(user=user, completed=True).count()
        user.profile.readiness_score = min(100, int((completed / total) * 100)) if total > 0 else 0
        user.profile.save()

        return Response({'status': 'progress updated', 'completed': progress.completed, 'new_score': user.profile.readiness_score})

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserManagementSerializer
    permission_classes = [permissions.AllowAny]