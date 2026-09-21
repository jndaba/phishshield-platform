from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import LearningModule, UserProgress, IncidentGuide
from .serializers import LearningModuleSerializer, UserProgressSerializer, AdminUserManagementSerializer
from authentication.models import ActivityAudit

# ==============================================================================
# 1. Static Rich Learning Curriculum (20 Comprehensive Modules)
# ==============================================================================

RICH_20_MODULES = [
    {
        "order": 1,
        "title": "Anatomy of Phishing & Psychological Triggers",
        "category": "Foundations",
        "duration_minutes": 12,
        "description": "Deep-dive analysis into cognitive manipulation, authority exploitation, scarcity triggers, and technical indicators of credential lures.",
        "content_body": """
            <h2>1. Introduction & Theoretical Foundations</h2>
            <p>Phishing is a form of social engineering where attackers deceive individuals into disclosing confidential information or deploying malware. Unlike pure software exploits, phishing attacks capitalize on human cognitive shortcuts. Our brains are hardwired to respond to specific emotional stimuli, which attackers expertly manipulate.</p>
            
            <h3>Core Psychological Attack Vectors:</h3>
            <ul>
                <li><strong>Authority Impersonation:</strong> Cybercriminals forge messages from trusted entities (e.g., University Administration, Chief Financial Officers, Banking Officers) to create implicit compliance. When a perceived authority figure makes a request, critical evaluation drops.</li>
                <li><strong>Artificial Urgency & Scarcity:</strong> Imposing stringent deadlines (e.g., 'Account scheduled for deletion in 15 minutes') bypasses critical thinking. The amygdala takes over, prioritizing speed over security.</li>
                <li><strong>Fear & Greed:</strong> Threats of legal action, fines, or fraudulent promises of tax rebates compel victims to act against their better judgment.</li>
            </ul>

            <div class="my-4 p-4 rounded-xl bg-slate-900 border border-slate-700">
                <h4 class="text-blue-400 font-bold text-sm mb-1">Key Takeaway</h4>
                <p class="text-xs text-slate-300">Technical email defenses stop standard spam, but human cognitive awareness is the final perimeter defense against customized, emotionally charged lures.</p>
            </div>

            <h2>2. Technical Threat Indicators (Page 2)</h2>
            <p>Every deceptive message exhibits quantifiable artifacts across its delivery headers and body structure. Training your eyes to spot these is critical:</p>
            <ol>
                <li><strong>Sender Envelope vs. Friendly Display Name:</strong> Attackers configure friendly names as 'Icons Support' while the underlying RFC5322.From header routes to untrusted servers (e.g., support-icons@gmail.com).</li>
                <li><strong>Mismatched Hyperlinks:</strong> Hovering over anchor text reveals redirection to lookalike subdomains or URL shorteners. Never click without inspecting the destination URL at the bottom left of your browser.</li>
                <li><strong>Generic Salutations:</strong> Bulk campaigns utilize 'Dear Customer' instead of personalized tokens, indicating a lack of genuine database integration.</li>
            </ol>

            <h3>Defense Summary & Immediate Checklist:</h3>
            <ul class="list-disc pl-5 space-y-1 text-xs">
                <li>Verify unexpected requests out-of-band using registered telephone numbers.</li>
                <li>Inspect domain roots before submitting credentials.</li>
                <li>Report suspicious payloads to the institutional security operations center immediately.</li>
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
            <p>Spear phishing represents targeted attacks directed at specific individuals, departments, or high-value organizational roles. Attackers do not guess; they leverage Open Source Intelligence (OSINT) across institutional directories, LinkedIn, and public social profiles to construct highly convincing narratives tailored to your daily operations.</p>
            
            <h3>Phases of a Spear Phishing Campaign:</h3>
            <ul>
                <li><strong>Target Profiling:</strong> Identifying roles with payment authorization, student database access, or server infrastructure control.</li>
                <li><strong>Narrative Formulation:</strong> Mimicking vendor invoicing formats, procurement memos, or exam moderation schedules gathered from compromised inboxes or public data.</li>
                <li><strong>Weaponization:</strong> Embedding individualized credential-harvesting landing pages designed specifically for the target organization.</li>
            </ul>

            <h2>2. Business Email Compromise (BEC) Mechanics (Page 2)</h2>
            <p>In BEC attacks, adversaries compromise legitimate executive accounts or register lookalike domains to issue fraudulent wire requests or statutory payroll redirection. Because the email may actually originate from a compromised legitimate account, standard anti-spam filters will not catch it.</p>

            <div class="my-4 p-4 rounded-xl bg-slate-900 border border-slate-700">
                <h4 class="text-blue-400 font-bold text-sm mb-1">Critical Defensive Rule</h4>
                <p class="text-xs text-slate-300">Never execute changes to banking coordinates or student financial records solely based on email instructions. Dual-authorization protocols and vocal confirmations are mandatory.</p>
            </div>
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
            <p>Simple Mail Transfer Protocol (SMTP) by default does not restrict sender addresses, meaning anyone can write any address in the "From" line. Forensic analysis requires parsing RFC headers to authenticate originating hosts and trace the true path of the email.</p>
            
            <h3>Crucial Header Elements:</h3>
            <ul>
                <li><code>Received: from</code> - Identifies the exact IP hop trajectory from sender client to receiving MX gateway. Reading from bottom to top shows the chronological path.</li>
                <li><code>Authentication-Results:</code> - Records automated verdict checks for SPF, DKIM, and DMARC policies.</li>
                <li><code>Return-Path:</code> - The address where bounce reports and delivery receipts are directed. Attackers often use a different Return-Path than the Display From address.</li>
            </ul>

            <h2>2. Email Authentication Protocols (Page 2)</h2>
            <p>Three protocols form the pillar of modern domain spoofing defense. Understanding them is crucial for setting up secure infrastructure:</p>
            <ol>
                <li><strong>SPF (Sender Policy Framework):</strong> DNS TXT records listing authorized server IP addresses permitted to send on behalf of the domain.</li>
                <li><strong>DKIM (DomainKeys Identified Mail):</strong> Public-key cryptography validating that message bodies and headers were not altered in transit.</li>
                <li><strong>DMARC:</strong> Directs receiving mailboxes to quarantine or reject unaligned messages (<code>p=reject</code>), providing reporting back to the domain owner.</li>
            </ol>
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
            <p>Internationalized Domain Names (IDNs) permit non-Latin scripts in web addresses. Adversaries exploit visually identical glyphs (homoglyphs) to register fraudulent lookalikes that bypass human visual inspection.</p>
            
            <h3>Example Deceptions:</h3>
            <ul>
                <li>Replacing Latin 'a' (U+0061) with Cyrillic 'а' (U+0430). To the human eye, 'apple.com' and 'аpple.com' look identical, but they route to completely different servers.</li>
                <li>Replacing Latin 'o' (U+006F) with Greek omicron 'ο' (U+03BF).</li>
                <li><strong>Typosquatting:</strong> Registering permutations of high-value targets (e.g., <code>examp1e.com</code>, <code>safaricom-support.net</code>, or <code>faceb00k.com</code>).</li>
            </ul>

            <h2>2. Punycode & URL Verification (Page 2)</h2>
            <p>Modern web browsers combat this by converting non-ASCII characters into Punycode strings prefixed with <code>xn--</code> (e.g., <code>xn--sfaricom-t2a.com</code>).</p>

            <div class="my-4 p-4 rounded-xl bg-slate-900 border border-slate-700">
                <h4 class="text-blue-400 font-bold text-sm mb-1">Pro Tip</h4>
                <p class="text-xs text-slate-300">Always check your browser address bar for <code>xn--</code> strings before entering credentials into unfamiliar portals. If you see it unexpectedly, close the tab immediately.</p>
            </div>
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
            <p>Mobile devices blur personal and organizational perimeters. With smaller screens and hidden URLs, users are more vulnerable. Attackers target smartphones via SMS (Smishing) and voice calls (Vishing) to harvest OTPs and PINs.</p>
            
            <h3>Common Smishing Vectors:</h3>
            <ul>
                <li><strong>Mobile Money Fraud:</strong> Fabricated M-Pesa transaction cancellation SMS messages prompting victims to click external authorization links to stop a fake transfer.</li>
                <li><strong>Delivery & Courier Alerts:</strong> Unsolicited tracking updates (e.g., DHL, FedEx) requiring 'rescheduling fees' to capture credit card data.</li>
                <li><strong>Vishing Voice Prompts:</strong> Callers impersonating telecommunication customer support requesting one-time verification tokens to authorize SIM swaps.</li>
            </ul>

            <h2>2. Defense Architecture on Mobile (Page 2)</h2>
            <p>Never rely on SMS Sender IDs alone. Alphanumeric sender titles (like 'SAFARICOM' or 'BANK') can be spoofed by unauthorized, offshore SMS gateway operators.</p>

            <h3>Essential Rules:</h3>
            <ul class="list-disc pl-5 space-y-1 text-xs">
                <li>Never share M-Pesa PINs, bank OTPs, or password reset tokens over telephone calls, even if the caller ID appears legitimate.</li>
                <li>Access banking and university portals directly via official applications rather than clicking embedded SMS hyperlinks.</li>
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
            <p>Quishing (QR Code Phishing) embeds malicious URLs inside matrix barcode images. Because the payload is graphical, standard email filters and text-analyzing firewalls cannot parse the plain text URL directly, allowing it to bypass perimeter security.</p>
            
            <h3>Attack Contexts:</h3>
            <ul>
                <li><strong>Physical Placement:</strong> Pasting fraudulent QR stickers over parking meters, restaurant menus, or campus event posters to steal payment info.</li>
                <li><strong>MFA Migration Emails:</strong> Emails instructing users to scan a QR code to update their Microsoft Authenticator or Duo 2FA app, which actually hands over session tokens to the attacker.</li>
            </ul>

            <h2>2. Safe Scanning Practices (Page 2)</h2>
            <p>Mobile OS camera apps now display destination URLs before redirecting. It is critical to pause and read the popup.</p>

            <div class="my-4 p-4 rounded-xl bg-slate-900 border border-slate-700">
                <h4 class="text-blue-400 font-bold text-sm mb-1">Defense Protocol</h4>
                <p class="text-xs text-slate-300">Inspect the full domain hierarchy on your mobile prompt before confirming navigation to any QR-encoded destination. Do not use third-party QR scanner apps that auto-redirect.</p>
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
            <p>Adversaries utilize complex document formats to bypass boundary defenses, evading static antivirus signatures to deploy initial access droppers onto endpoints.</p>
            
            <h3>High-Risk File Types:</h3>
            <ul>
                <li><strong>Macro-Enabled Documents (DOCM, XLSM):</strong> Embedded VBA code that, once enabled by the user, fetches remote PowerShell scripts to download ransomware.</li>
                <li><strong>PDF Exploits:</strong> Embedded JavaScript triggering zero-day reader vulnerabilities to achieve remote code execution.</li>
                <li><strong>Disk Images (ISO, VHD):</strong> Containers used to evade gateway antivirus scanning because their contents aren't inherently extracted by the mail server.</li>
            </ul>

            <h2>2. Static & Dynamic Sandbox Analysis (Page 2)</h2>
            <p>Modern endpoint security isolates untrusted attachments within virtual sandbox environments to monitor behavior prior to user execution. If an Excel file attempts to spawn a command prompt, the sandbox kills it.</p>

            <h3>Summary:</h3>
            <p class="text-xs text-slate-300">Never click 'Enable Content' or 'Enable Macros' on unexpected documents. Ensure your institution enforces block-lists on dangerous attachment extensions.</p>
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
            <p>Adversary-in-the-Middle (AiTM) proxies (like Evilginx2) sit directly between the target victim and the genuine authentication server (e.g., Microsoft 365 or Google Workspace). This renders traditional OTP MFA useless.</p>
            
            <h3>Attack Flow:</h3>
            <ol>
                <li>The victim connects to the proxy server believing it to be the true login portal.</li>
                <li>The proxy relays user credentials to the real portal in real-time, and passes back the genuine MFA challenges to the user.</li>
                <li>Once the user completes MFA, the legitimate server issues a session cookie. The proxy intercepts this HTTP session cookie before passing it to the user.</li>
                <li>The attacker now imports the cookie into their browser, completely bypassing the need for a password or MFA token.</li>
            </ol>

            <h2>2. FIDO2 & Hardware Key Defense (Page 2)</h2>
            <p>Legacy SMS and authenticator apps do not cryptographically bind authentication to the origin URL. FIDO2 / WebAuthn standard hardware keys (like YubiKeys) cryptographically bind authentication tokens to the specific domain, defeating AiTM proxies entirely. If the domain is fake, the hardware key refuses to authenticate.</p>
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
            <p>Instead of attacking users directly via email, watering hole attacks identify websites frequently visited by a target organization or demographic. Attackers compromise the host server of that website to distribute drive-by exploit kits to unsuspecting visitors.</p>
            
            <h3>Indicators of Compromise:</h3>
            <ul>
                <li>Unprompted, full-screen browser update prompts immediately upon loading university library or cafeteria resources.</li>
                <li>Injected third-party JavaScript tracking scripts identified in the browser's developer console.</li>
                <li>Sudden redirects to external captcha pages that download compressed files.</li>
            </ul>

            <h2>2. Perimeter Hardening (Page 2)</h2>
            <p>To defend against watering hole attacks, organizations must maintain aggressive patch management on web browsers and implement DNS-layer filtering (like Cisco Umbrella) to block known malicious hosting ranges and newly registered domains (NRDs).</p>
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
            <p>Rather than stealing passwords, attackers register malicious cloud apps (often disguised as productivity tools or PDF readers) requesting delegated access tokens via OAuth. When a user clicks 'Accept', they grant the attacker persistent API access to their data.</p>
            
            <h3>Warning Signs:</h3>
            <ul>
                <li>Unverified app publisher alerts on the Microsoft or Google consent screen.</li>
                <li>Permissions requesting offline access to mailbox archives (<code>Mail.ReadWrite</code>) or global file access (<code>Files.ReadWrite.All</code>) for a simple application.</li>
            </ul>

            <h2>2. App Governance (Page 2)</h2>
            <p>Account takeover isn't just about passwords anymore. Even if you change your password, a malicious OAuth token persists. Users must regularly review and revoke authorized third-party apps from their cloud account security settings. Administrators should restrict users from granting consent to unverified publishers.</p>
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
            <p>Attackers do not brute-force passwords character-by-character. Instead, they download massive databases of leaked username/password combinations from historical breaches (like the LinkedIn or Yahoo leaks). They feed millions of these combinations into automated scripts against university or corporate systems, knowing humans frequently reuse passwords.</p>
            
            <h2>2. Passphrase Resilience (Page 2)</h2>
            <p>The only defense against credential stuffing is absolute uniqueness. Use long, unique passphrases (e.g., 'CorrectHorseBatteryStaple') paired with an encrypted password manager (like Bitwarden or 1Password) to eliminate cross-account exposure.</p>
            <p>Organizations must also implement geographic rate-limiting and compare login attempts against known compromised password databases.</p>
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
            <p>Time is the most critical factor in incident response. If you suspect you have fallen for a phishing attack or downloaded malware, follow these steps immediately:</p>
            <ol>
                <li><strong>Network Isolation:</strong> Disconnect Wi-Fi or unplug the Ethernet cable immediately. Do NOT power off the computer—rebooting can trigger ransomware encryption or destroy forensic evidence in RAM.</li>
                <li><strong>Session Revocation:</strong> From a separate, clean mobile device, access your cloud provider settings and invoke "Revoke all active sessions."</li>
                <li><strong>Password Reset:</strong> Change master credentials and invalidate all application-specific passwords.</li>
                <li><strong>Notification:</strong> Alert the ICT Security desk with exact timestamp details, providing screenshots if safely possible.</li>
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
            <p>Not all data requires the same level of security. Organizations categorize data to apply adequate encryption safeguards without impeding productivity.</p>
            <ul>
                <li><strong>Public:</strong> Press releases, course catalogs. No encryption required.</li>
                <li><strong>Internal:</strong> Staff directories, internal memos. Requires basic authentication.</li>
                <li><strong>Confidential:</strong> Financial records, unreleased exam papers. Requires strict access control and at-rest encryption.</li>
                <li><strong>Restricted:</strong> PII, medical records, social security numbers. Requires end-to-end encryption, MFA, and strict compliance auditing.</li>
            </ul>

            <h2>2. DLP Systems (Page 2)</h2>
            <p>Data Loss Prevention (DLP) systems scan outbound emails and file uploads for patterns (like credit card numbers or ID formats) and automatically block or encrypt the transmission if restricted data is detected leaving the corporate network.</p>
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
            <p>A resilient security culture relies on fast, blame-free reporting. Cyber attacks are inevitable; the goal is rapid containment.</p>
            <p>When one student reports a phishing email within 5 minutes of receipt via a Phish Alert Button, Security Orchestration, Automation, and Response (SOAR) platforms can automatically extract the malicious indicators, search all other inboxes, and purge the message campus-wide before anyone else has a chance to click it.</p>
            
            <h2>2. Blame-Free Environment (Page 2)</h2>
            <p>If users fear punishment for clicking a link, they will hide their mistake, allowing malware to spread laterally across the network. Encouraging immediate, transparent reporting is the highest ROI security investment an organization can make.</p>
        """
    },
    {
        "order": 15,
        "title": "AI-Driven Social Engineering & Deepfakes",
        "category": "Emerging Vectors",
        "duration_minutes": 12,
        "description": "Recognizing synthetic media, voice cloning (audio deepfakes), and Large Language Model (LLM) generated phishing campaigns.",
        "content_body": """
            <h2>1. The Rise of Synthetic Media</h2>
            <p>Generative AI has eliminated the grammatical errors and awkward phrasing that used to be the hallmark of phishing emails. LLMs can now draft perfectly contextual, highly persuasive emails in seconds. Beyond text, attackers are utilizing AI voice cloning to execute devastating vishing attacks.</p>
            
            <h3>Voice Cloning (Audio Deepfakes):</h3>
            <p>By scraping just 3 seconds of audio from a CEO's public YouTube speech, attackers can clone their voice. They use this synthetic voice to call finance departments, demanding urgent wire transfers. The caller ID is spoofed, and the voice sounds identical.</p>

            <h2>2. Defensive Posture against AI (Page 2)</h2>
            <p>Because our senses can no longer be trusted to verify identity over digital channels, organizations must adopt cryptographic identity verification and strict out-of-band protocols. If an executive calls demanding an urgent transfer, hang up and call them back on their internally registered, pre-approved phone number.</p>
        """
    },
    {
        "order": 16,
        "title": "Physical Security, Tailgating & USB Drops",
        "category": "Physical Defense",
        "duration_minutes": 10,
        "description": "Bridging the gap between physical facility access and digital network compromise.",
        "content_body": """
            <h2>1. Tailgating & Piggybacking</h2>
            <p>Physical access negates all digital firewalls. Tailgating occurs when an unauthorized person follows an authorized employee through a secure door without swiping their own badge. Attackers often carry heavy boxes or pretend to be on a phone call to exploit human politeness.</p>
            
            <h2>2. The USB Drop Attack (Page 2)</h2>
            <p>Attackers drop infected USB flash drives in parking lots or lobbies, labeling them "Executive Payroll Q4" or "Confidential HR". Curiosity drives an employee to plug the drive into a corporate workstation. Some drives act as HID (Human Interface Devices) and instantly execute malicious keystrokes to open reverse shells the moment they are plugged in. Never plug untrusted media into secure machines.</p>
        """
    },
    {
        "order": 17,
        "title": "Secure Remote Work & Public Wi-Fi Risks",
        "category": "Network Security",
        "duration_minutes": 11,
        "description": "Understanding the threats of rogue access points, Evil Twins, and the necessity of Virtual Private Networks (VPNs).",
        "content_body": """
            <h2>1. Rogue Access Points & Evil Twins</h2>
            <p>When working from coffee shops or airports, your device is vulnerable to Evil Twin attacks. Attackers set up a Wi-Fi hotspot with the exact same name (SSID) as the legitimate cafe network, but with a stronger signal. Your device auto-connects to the attacker's network, allowing them to intercept all unencrypted traffic and perform SSL stripping.</p>
            
            <h2>2. The Role of the VPN (Page 2)</h2>
            <p>A Virtual Private Network (VPN) creates an encrypted tunnel between your device and the corporate network. Even if you are connected to an Evil Twin, the attacker only sees encrypted gibberish. Always enforce "Always-On" VPNs for remote corporate endpoints to ensure traffic cannot be intercepted at the local network level.</p>
        """
    },
    {
        "order": 18,
        "title": "Insider Threats & Privilege Escalation",
        "category": "Advanced Threats",
        "duration_minutes": 13,
        "description": "Identifying accidental, negligent, and malicious insiders, and enforcing the Principle of Least Privilege (PoLP).",
        "content_body": """
            <h2>1. Categories of Insider Threats</h2>
            <p>Not all breaches come from external hackers. Insider threats are highly damaging because the individual already has legitimate access and bypasses the perimeter firewall.</p>
            <ul>
                <li><strong>Negligent Insiders:</strong> Employees who accidentally leak data by misconfiguring cloud storage buckets or falling for phishing.</li>
                <li><strong>Malicious Insiders:</strong> Disgruntled employees stealing intellectual property before resigning, or individuals bribed by external syndicates.</li>
            </ul>

            <h2>2. Principle of Least Privilege (PoLP) (Page 2)</h2>
            <p>The core defense against insider threats is PoLP. A user should only be granted the minimum permissions necessary to perform their job, and only for the duration needed (Just-In-Time access). This limits the blast radius if an account is compromised or turns malicious.</p>
        """
    },
    {
        "order": 19,
        "title": "Supply Chain Attacks & Vendor Risk",
        "category": "Advanced Threats",
        "duration_minutes": 15,
        "description": "Understanding how adversaries compromise trusted third-party software updates to infiltrate highly secure target networks.",
        "content_body": """
            <h2>1. The Supply Chain Vector</h2>
            <p>If an organization's defenses are too strong to breach directly, attackers will compromise a weaker third-party vendor that the target organization trusts. By injecting malware into a routine software update of an IT management tool or billing software, the attacker gains a backdoor into the target network.</p>
            
            <h2>2. Defense and Auditing (Page 2)</h2>
            <p>Supply chain attacks (like the SolarWinds breach) are incredibly difficult to detect because the malicious code is digitally signed by a trusted vendor. Defending against this requires strict network segmentation (preventing third-party servers from initiating outbound connections to unknown IP addresses) and rigorous third-party risk assessments (TPRM).</p>
        """
    },
    {
        "order": 20,
        "title": "Zero Trust Architecture (ZTA) Fundamentals",
        "category": "Enterprise Strategy",
        "duration_minutes": 14,
        "description": "Moving away from the obsolete 'castle-and-moat' perimeter model toward continuous identity verification.",
        "content_body": """
            <h2>1. The Death of the Perimeter</h2>
            <p>Historically, networks relied on a "castle-and-moat" model: everything outside the firewall was untrusted, and everything inside was trusted. With the rise of cloud computing and remote work, this perimeter has dissolved. If an attacker breaches the firewall, they have free rein to move laterally across the internal network.</p>
            
            <h2>2. Assume Breach & Verify Explicitly (Page 2)</h2>
            <p>Zero Trust Architecture (ZTA) operates on the principle of "Never Trust, Always Verify." It assumes the network is already compromised. Every single request for access must be strongly authenticated, authorized within policy constraints, and inspected for anomalies, regardless of whether the user is sitting in the headquarters or at a remote coffee shop. Contextual signals (device health, geolocation, user behavior) are evaluated continuously.</p>
        """
    }
]

# ==============================================================================
# 2. Learning Module & Progress API Views
# ==============================================================================

class ModuleListCreateView(APIView):
    """Handles fetching modules for learners and module creation for administrators."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # 1. Force seed missing modules if we have less than 20
            # We now match by title so we don't duplicate existing ones stuck at module_number=1
            if LearningModule.objects.count() < 20:
                for idx, mod in enumerate(RICH_20_MODULES):
                    module, created = LearningModule.objects.get_or_create(
                        title=mod.get("title", "Untitled Module"),
                        defaults={
                            "module_number": mod.get("order", idx + 1),
                            "description": mod.get("description", ""),
                            "rich_content": mod.get("content_body", "")
                        }
                    )
            
            # 2. AUTO-FIX: Automatically repair any modules stuck at '1' from the database migration
            all_modules = LearningModule.objects.all().order_by('id')
            for idx, mod in enumerate(all_modules):
                correct_number = idx + 1
                if mod.module_number != correct_number:
                    mod.module_number = correct_number
                    mod.save()

        except Exception as e:
            print(f"Module Seeding/Fixing Exception: {e}")

        # 3. Serve the properly ordered data to the React frontend
        modules = LearningModule.objects.all().order_by('module_number')
        data = []
        for mod in modules:
            data.append({
                'id': mod.id,
                'module_number': mod.module_number,
                'title': mod.title,
                'description': mod.description,
                'category': getattr(mod, 'category', 'Cyber Defense'),
                'video_url': getattr(mod, 'video_url', ''),
                'rich_content': getattr(mod, 'rich_content', ''),
                'document': mod.document.url if hasattr(mod, 'document') and mod.document else None,
                'estimated_read_time': getattr(mod, 'estimated_read_time', '8 mins'),
            })
            
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        is_admin = request.user.is_staff or getattr(getattr(request.user, 'profile', None), 'is_admin', False)
        if not is_admin:
            return Response({'error': 'Forbidden: Administrator privileges required.'}, status=status.HTTP_403_FORBIDDEN)
            
        mod = LearningModule.objects.create(
            module_number=request.data.get('module_number', 1),
            title=request.data.get('title', 'Untitled Module'),
            description=request.data.get('description', ''),
            rich_content=request.data.get('rich_content', '')
        )
        
        if hasattr(mod, 'category'): mod.category = request.data.get('category', 'Cyber Defense')
        if hasattr(mod, 'video_url'): mod.video_url = request.data.get('video_url', '')
        mod.save()
        
        return Response({'id': mod.id, 'title': mod.title}, status=status.HTTP_201_CREATED)

class ModuleDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        is_admin = request.user.is_staff or getattr(getattr(request.user, 'profile', None), 'is_admin', False)
        if not is_admin:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        mod = get_object_or_404(LearningModule, pk=pk)
        mod.module_number = request.data.get('module_number', mod.module_number)
        mod.title = request.data.get('title', mod.title)
        mod.description = request.data.get('description', mod.description)
        
        if hasattr(mod, 'category'): mod.category = request.data.get('category', mod.category)
        if hasattr(mod, 'video_url'): mod.video_url = request.data.get('video_url', getattr(mod, 'video_url', ''))
        if hasattr(mod, 'rich_content'): mod.rich_content = request.data.get('rich_content', getattr(mod, 'rich_content', ''))
        
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
        # Allow resolving by either module_id or string
        module = get_object_or_404(LearningModule, id=module_id)
        progress, _ = UserProgress.objects.get_or_create(user=request.user, module=module)
        progress.completed = request.data.get('completed', True)
        progress.score = request.data.get('score', 100)
        progress.save()

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
# 3. Incident Recovery Guides 
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

class IncidentGuideDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = IncidentGuide.objects.all()
    serializer_class = IncidentGuideSerializer
    permission_classes = [permissions.IsAuthenticated]