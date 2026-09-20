import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Mail, 
  BookOpen, 
  Award, 
  AlertTriangle, 
  Lock, 
  Smartphone, 
  FileWarning, 
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Globe2,
  PhoneCall,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base tracking-tight block leading-tight">
                Phish<span className="text-blue-600">Shield</span>
              </span>
              <span className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">
                Icons Cyber Lab
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#about-phishing" className="hover:text-blue-600 transition">What is Phishing?</a>
            <a href="#attack-vectors" className="hover:text-blue-600 transition">Threat Vectors</a>
            <a href="#platform-features" className="hover:text-blue-600 transition">Defense Tools</a>
            <a href="#curriculum" className="hover:text-blue-600 transition">Curriculum</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-6 border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Icons Computer School &amp; Cyber Defense Portal
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
            Stop Social Engineering Attacks <br />
            <span className="text-blue-600">
              Before Credentials Are Compromised
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-xs sm:text-base text-slate-600 leading-relaxed">
            PhishShield is an interactive cybersecurity training and threat heuristic laboratory. 
            Test live URLs against machine-learning classifiers, examine deceptive email vectors across 10 simulation scenarios, 
            and earn an accredited proficiency certificate.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 pt-4">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-md shadow-blue-600/20"
            >
              Access Learner Cockpit <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#about-phishing"
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm border border-slate-300 transition"
            >
              Explore Phishing Risks
            </a>
          </div>
        </div>
      </section>

      {/* Section 1: What is Phishing & Real Risks */}
      <section id="about-phishing" className="py-16 px-6 border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
              Threat Landscape &amp; Real-World Risks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What is Phishing &amp; Why Does it Work?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Phishing is a deceptive cyber technique where adversaries impersonate legitimate institutions 
              (universities, banks, telecommunication operators, or corporate executives) to manipulate cognitive shortcuts—fear, 
              urgency, and authority—tricking users into handing over secrets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3 hover:border-blue-300 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Credential &amp; Identity Theft</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spoofed institutional portals clone login screens to capture passwords, MFA authentication codes, and active session cookies, giving attackers direct access to private internal systems.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3 hover:border-blue-300 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Financial &amp; Mobile Fraud</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smishing and voice calls spoof telecommunications networks (such as fake M-Pesa reversal alerts) to panic individuals into giving up account authorization PINs and funds.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3 hover:border-blue-300 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <FileWarning className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Malware &amp; Ransomware</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Weaponized attachments (.xlsm spreadsheets, ISO images, obfuscated PDF links) disguise dropper scripts as urgent invoices or exam schedules to bypass standard antivirus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Attack Vectors */}
      <section id="attack-vectors" className="py-16 px-6 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
              Deception Mechanics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Attack Vectors You Will Master
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Modern cybercriminals exploit multiple channels across email, mobile, and web applications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 hover:bg-white transition">
              <span className="text-blue-600 font-extrabold uppercase text-[10px]">01 &middot; Domain Lookalikes</span>
              <h4 className="text-sm font-bold text-slate-900">IDN Homograph Spoofs</h4>
              <p className="text-slate-600 leading-relaxed">
                Using Cyrillic and unicode lookalike letters (e.g. <code>xn--</code>) to build visually identical copies of legitimate institutional URLs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 hover:bg-white transition">
              <span className="text-blue-600 font-extrabold uppercase text-[10px]">02 &middot; Mobile Vectors</span>
              <h4 className="text-sm font-bold text-slate-900">Smishing &amp; Vishing</h4>
              <p className="text-slate-600 leading-relaxed">
                SMS-based social engineering creating artificial urgency to compromise mobile money wallets, banking apps, and one-time passwords.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 hover:bg-white transition">
              <span className="text-blue-600 font-extrabold uppercase text-[10px]">03 &middot; Visual Exploits</span>
              <h4 className="text-sm font-bold text-slate-900">Quishing (QR Barcodes)</h4>
              <p className="text-slate-600 leading-relaxed">
                Embedding malicious links inside matrix barcode images on posters or MFA renewal emails to bypass plain-text perimeter filters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 hover:bg-white transition">
              <span className="text-blue-600 font-extrabold uppercase text-[10px]">04 &middot; Advanced Proxies</span>
              <h4 className="text-sm font-bold text-slate-900">AiTM Session Hijacking</h4>
              <p className="text-slate-600 leading-relaxed">
                Adversary-in-the-Middle reverse proxies that capture authenticated session tokens in real time, bypassing traditional two-factor auth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Platform Features */}
      <section id="platform-features" className="py-16 px-6 border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
              Platform Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              The PhishShield Defense Ecosystem
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              An integrated, hands-on cybersecurity platform built for students, IT professionals, and corporate cohorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 shadow-xs hover:border-blue-300 transition">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Predictive URL Threat Scanner</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time Random Forest machine-learning model combined with Shannon entropy and lexical heuristic evaluation to identify malicious domain patterns instantly.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 shadow-xs hover:border-blue-300 transition">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Interactive 10-Scenario Mailbox</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  10 realistic simulation templates ranging from executive wire requests to delivery alerts, providing instant feedback and detailed explanations on why an assessment was right or wrong.
                </p>
              </div>
            </div>

            <div id="curriculum" className="p-6 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 shadow-xs hover:border-blue-300 transition">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">14-Module Learning Academy</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprehensive educational security modules complete with theoretical foundations, technical threat indicators, and emergency isolation checklists.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 shadow-xs hover:border-blue-300 transition">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Verified Certificate of Proficiency</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gated certification strictly unlocked upon passing the assessment examination, issued by Icons Computer School and Cyber with verifiable credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Build Your Human Firewall?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
            Sign in to analyze suspicious URLs, practice in the mailbox simulation sandbox, and complete the modular curriculum.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="bg-white hover:bg-slate-100 text-blue-600 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-md"
            >
              Sign In to Cockpit <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm border border-blue-500 transition"
            >
              Register New Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-8 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-700">PhishShield Platform</span>
            <span>&middot; Icons Computer School and Cyber</span>
          </div>
          <div>
            Lead Coordinator: <strong className="text-slate-800">Joel Ndaba</strong> (+25421952909)
          </div>
        </div>
      </footer>

    </div>
  );
}