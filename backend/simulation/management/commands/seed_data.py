from django.core.management.base import BaseCommand
from simulation.models import SimulationEmail, QuizQuestion
from lms_content.models import LearningModule

class Command(BaseCommand):
    help = 'Seeds simulation emails, 14 learning modules, and assessment questions into PostgreSQL'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Seeding database...'))

        # ----------------------------------------------------
        # 1. Seed Simulation Emails
        # ----------------------------------------------------
        SimulationEmail.objects.all().delete()
        
        emails = [
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
                        <a href="http://mpesa-support-reversals.xyz/auth" target="_blank" rel="noreferrer" class="inline-block bg-emerald-600 text-white font-bold py-2 px-4 rounded text-xs">
                            Cancel Transaction Reversal
                        </a>
                    </div>
                    <p class="text-xs text-slate-400">Safaricom PLC Mobile Financial Services.</p>
                """,
                "clues": "Look at the sender domain (@safaricom-mpesa-service.net vs official safaricom.co.ke) and the artificial 15-minute countdown urgency."
            },
            {
                "sender_name": "University ICT Support",
                "sender_email": "helpdesk@dekut.ac.ke",
                "subject": "Scheduled Wi-Fi Infrastructure Maintenance",
                "difficulty": "easy",
                "is_phishing": False,
                "body_html": """
                    <p class="mb-2">Dear Campus Community,</p>
                    <p class="mb-2">Please be informed that routine Wi-Fi maintenance will occur this Saturday between 02:00 AM and 05:00 AM.</p>
                    <p class="mb-2">No action or credential validation is required on your part.</p>
                    <p class="text-xs text-slate-400">ICT Operations & Maintenance Team</p>
                """,
                "clues": "Valid institutional sender domain (@dekut.ac.ke) with no demand for passwords or external links."
            },
            {
                "sender_name": "Microsoft 365 Security",
                "sender_email": "security@account-protection-microsoft.co",
                "subject": "Action Required: 3 Quarantined Messages",
                "difficulty": "hard",
                "is_phishing": True,
                "body_html": """
                    <p class="mb-2">Your mailbox has 3 incoming messages held in quarantine due to SPF policy failures.</p>
                    <p class="mb-3">Review these messages to prevent permanent deletion from the cloud server.</p>
                    <div class="my-4">
                        <a href="http://auth-office365-quarantine.com/review" target="_blank" rel="noreferrer" class="inline-block bg-sky-600 text-white font-bold py-2 px-4 rounded text-xs">
                            Release Quarantined Messages
                        </a>
                    </div>
                    <p class="text-xs text-slate-400">Microsoft Security Operations Center</p>
                """,
                "clues": "The domain uses a deceptive lookalike syntax (.co instead of official microsoft.com) and directs to an unverified auth URL."
            },
            {
                "sender_name": "HR & Payroll Office",
                "sender_email": "payroll-update@university-internal-portal.net",
                "subject": "Important: Annual Tax Relief Adjustment (Form P9)",
                "difficulty": "medium",
                "is_phishing": True,
                "body_html": """
                    <p class="mb-2">All staff and student attachments are required to update their statutory withholding details for the current quarter.</p>
                    <p class="mb-3">Log in to verify your banking and national ID details to prevent payroll disbursement holds.</p>
                    <div class="my-4">
                        <a href="http://portal-payroll-verification.org/login" target="_blank" rel="noreferrer" class="inline-block bg-teal-600 text-white font-bold py-2 px-4 rounded text-xs">
                            Access Payroll Portal
                        </a>
                    </div>
                """,
                "clues": "Lookalike payroll portal asking for sensitive national IDs and banking credentials via an unverified domain."
            }
        ]

        for item in emails:
            SimulationEmail.objects.create(**item)
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(emails)} simulation emails.'))

        # ----------------------------------------------------
        # 2. Seed 14 Learning Modules
        # ----------------------------------------------------
        LearningModule.objects.all().delete()

        modules = [
            {
                "module_number": 1,
                "title": "Anatomy of Phishing & Psychological Triggers",
                "category": "Foundations",
                "estimated_read_time": "6 mins",
                "description": "Examine how cybercriminals exploit authority, cognitive shortcuts, and urgency.",
                "video_url": "https://www.youtube.com/embed/XBkzBrXllBo",
                "rich_content": "<h3>Understanding Deception Mechanisms</h3><p>Phishing relies on human cognitive biases rather than technical exploits alone. Attackers exploit authority bias, artificial urgency, and fear to force immediate compliance without verification.</p>"
            },
            {
                "module_number": 2,
                "title": "Spear Phishing & Executive Impersonation",
                "category": "Targeted Attacks",
                "estimated_read_time": "8 mins",
                "description": "Tactics used in customized attacks against specific university departments and staff.",
                "video_url": "https://www.youtube.com/embed/9GzF7f-38z8",
                "rich_content": "<h3>Targeted Reconnaissance</h3><p>Spear phishing uses OSINT gathered from social profiles to impersonate institutional leaders. Always verify unexpected fund or credential requests via out-of-band communication.</p>"
            },
            {
                "module_number": 3,
                "title": "Email Header Analysis & Domain Spoofing",
                "category": "Technical Defense",
                "estimated_read_time": "10 mins",
                "description": "How to inspect SPF, DKIM, and DMARC records to detect address impersonation.",
                "video_url": "https://www.youtube.com/embed/2_YnQ5iFm5Q",
                "rich_content": "<h3>Validating the Origin</h3><p>The display name can be easily forged. Inspecting raw Authentication-Results headers reveals whether the email passed cryptographic SPF and DKIM signatures.</p>"
            },
            {
                "module_number": 4,
                "title": "Homograph Attacks & Punycode Deceptions",
                "category": "Technical Defense",
                "estimated_read_time": "7 mins",
                "description": "Detecting Cyrillic and lookalike characters used in deceptive domain registrations.",
                "rich_content": "<h3>Lookalike Unicode Attacks</h3><p>Attackers register domain names using non-Latin characters visually identical to Latin letters. Modern web browsers prefix these deceptive links with <code>xn--</code>.</p>"
            },
            {
                "module_number": 5,
                "title": "Smishing, Vishing & Multi-Channel Social Engineering",
                "category": "Mobile Threats",
                "estimated_read_time": "6 mins",
                "description": "Identifying SMS-based M-Pesa fraud schemes, automated voice phishers, and WhatsApp scams.",
                "rich_content": "<h3>Attacks Outside the Mailbox</h3><p>Never enter mobile money PINs, bank OTPs, or passwords on web pages sent via unsolicited SMS messages or phone calls.</p>"
            },
            {
                "module_number": 6,
                "title": "Malicious QR Codes (Quishing)",
                "category": "Emerging Vectors",
                "estimated_read_time": "5 mins",
                "description": "How attackers use QR codes on physical posters and emails to bypass URL network filters.",
                "rich_content": "<h3>Visual Link Obfuscation</h3><p>Quishing hides malicious URLs inside image codes, bypassing standard text-based gateway scanners. Always inspect the destination domain prompt before browsing.</p>"
            },
            {
                "module_number": 7,
                "title": "Clone Phishing & Malicious Attachment Sandboxing",
                "category": "Malware Vectors",
                "estimated_read_time": "8 mins",
                "description": "Techniques for spotting weaponized PDF, DOCX, and HTML attachments.",
                "rich_content": "<h3>Attachment Exploitation</h3><p>Attackers clone genuine historical emails, replacing legitimate attachments with malware or macro-enabled documents. Never run macros on untrusted files.</p>"
            },
            {
                "module_number": 8,
                "title": "Session Hijacking & Adversary-in-the-Middle (AiTM)",
                "category": "Advanced Threats",
                "estimated_read_time": "9 mins",
                "description": "How modern reverse proxies intercept login sessions and bypass standard 2FA prompts.",
                "rich_content": "<h3>Bypassing Traditional MFA</h3><p>AiTM reverse proxies sit between you and the authentic login server to steal active session cookies. Passkeys and FIDO2 hardware tokens protect against this vector.</p>"
            },
            {
                "module_number": 9,
                "title": "Watering Hole Attacks & Compromised Portals",
                "category": "Web Security",
                "estimated_read_time": "7 mins",
                "description": "Understanding strategic website compromise targeting entire student or employee cohorts.",
                "rich_content": "<h3>Targeting Shared Resources</h3><p>Instead of attacking users directly, adversaries compromise portals frequently visited by students to distribute malware or fake prompts.</p>"
            },
            {
                "module_number": 10,
                "title": "Cloud Identity & Microsoft 365 OAuth Consent Abuse",
                "category": "Cloud Security",
                "estimated_read_time": "8 mins",
                "description": "How rogue third-party cloud apps trick users into granting permissions to emails and OneDrive files.",
                "rich_content": "<h3>Illicit Consent Grants</h3><p>Attackers request read/write permissions for cloud apps without asking for raw passwords. Verify the verified publisher status before granting consent.</p>"
            },
            {
                "module_number": 11,
                "title": "Credential Stuffing & Password Hygiene",
                "category": "Access Control",
                "estimated_read_time": "6 mins",
                "description": "Why password reuse across portals leads to compromised organizational accounts.",
                "rich_content": "<h3>Automated Account Takeover</h3><p>Leaked credentials from other sites are tested against organizational accounts automatically. Always use unique passwords managed by a secure password manager.</p>"
            },
            {
                "module_number": 12,
                "title": "Incident Containment & Emergency Isolation",
                "category": "Incident Response",
                "estimated_read_time": "7 mins",
                "description": "First responder protocol when a user clicks a malicious payload or enters credentials.",
                "rich_content": "<h3>First Steps on Compromise</h3><p>1. Disconnect device from Wi-Fi.<br/>2. Revoke active sessions.<br/>3. Change master passwords from a clean device.<br/>4. Immediately report to ICT security.</p>"
            },
            {
                "module_number": 13,
                "title": "Data Loss Prevention & Regulated Information Handling",
                "category": "Compliance",
                "estimated_read_time": "7 mins",
                "description": "Safeguarding Personally Identifiable Information (PII) and institutional records.",
                "rich_content": "<h3>Protecting Sensitive Records</h3><p>Ensure sensitive student, health, or financial documents are protected by encryption and comply with organizational Data Protection Policies.</p>"
            },
            {
                "module_number": 14,
                "title": "Building a Human Firewall: Culture & Reporting Protocols",
                "category": "Culture",
                "estimated_read_time": "6 mins",
                "description": "How fast reporting of suspected attacks prevents campus-wide breach propagation.",
                "rich_content": "<h3>Collective Protection</h3><p>Fast reporting of threats empowers automated defensive filters to purge malicious messages from all other inboxes across the campus network.</p>"
            }
        ]

        for mod in modules:
            LearningModule.objects.create(**mod)
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(modules)} learning modules.'))

        # ----------------------------------------------------
        # 3. Seed Assessment Questions
        # ----------------------------------------------------
        QuizQuestion.objects.all().delete()
        
        from simulation.views import EXPANDED_10_QUESTIONS
        for q in EXPANDED_10_QUESTIONS:
            QuizQuestion.objects.create(**q)
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded 10 assessment questions.'))