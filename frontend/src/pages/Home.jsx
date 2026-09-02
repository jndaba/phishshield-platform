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
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col selection:bg-teal-500 selection:text-slate-950 font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-[#102A36]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-xl text-slate-950 shadow-md">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wide block leading-tight">PhishShield</span>
              <span className="text-[10px] text-teal-400 font-semibold tracking-widest uppercase">Icons Cyber Lab</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#about-phishing" className="hover:text-teal-400 transition">What is Phishing?</a>
            <a href="#attack-vectors" className="hover:text-teal-400 transition">Attack Vectors</a>
            <a href="#platform-features" className="hover:text-teal-400 transition">Platform Tools</a>
            <a href="#curriculum" className="hover:text-teal-400 transition">Curriculum</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-teal-300 hover:text-white px-3.5 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/30 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800 text-teal-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Icons Computer School & Cyber Defense Portal
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Stop Social Engineering Attacks <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
              Before Credentials Are Lost
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
            PhishShield is an interactive cybersecurity training and threat heuristic laboratory. 
            Test live URLs against machine-learning classifiers, examine deceptive email vectors in a secure sandbox, 
            and earn an accredited proficiency certificate.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <Link
              to="/login"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-teal-500/10"
            >
              Access Learner Cockpit <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#about-phishing"
              className="bg-[#102A36] hover:bg-[#163847] text-slate-300 font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm border border-slate-700 transition"
            >
              Explore Phishing Risks
            </a>
          </div>
        </div>
      </section>

      {/* Section 1: What is Phishing & Real Risks */}
      <section id="about-phishing" className="py-20 px-6 border-b border-slate-800 bg-[#0B1120]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
              Threat Landscape & Education
            </span>
            <h2 className="text-3xl font-extrabold text-white">What is Phishing?</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Phishing is a form of cyber deception where adversaries impersonate legitimate institutions 
              (banks, telecommunication operators, universities, or executives) to coerce users into exposing credentials, 
              transferring money, or downloading weaponized payloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#102A36] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Credential & Identity Theft</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Spoofed institutional portals capture login passwords, multi-factor tokens, and student/employee account controls, allowing adversaries to access restricted networks.
              </p>
            </div>

            <div className="bg-[#102A36] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Financial & Mobile Fraud</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smishing lures impersonate mobile money platforms like M-Pesa or corporate payroll units, issuing fake transaction reversal alerts to steal session PINs and funds.
              </p>
            </div>

            <div className="bg-[#102A36] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center">
                <FileWarning className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Ransomware Infiltration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adversaries disguise malware droppers as official invoices, exam timetables, or administrative notices, locking systems and extorting data from institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Attack Vectors */}
      <section id="attack-vectors" className="py-20 px-6 border-b border-slate-800 bg-[#0E1726]/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
              Deception Mechanisms
            </span>
            <h2 className="text-3xl font-extrabold text-white">Common Vectors Addressed in Training</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-[#102A36] border border-slate-800 space-y-2">
              <span className="text-teal-400 font-bold uppercase text-[10px]">01 · Domain Lookalikes</span>
              <h4 className="text-sm font-bold text-white">IDN Homograph Attacks</h4>
              <p className="text-slate-400 leading-relaxed">
                Using Cyrillic and unicode lookalike letters (e.g. <code>xn--</code>) to build spoofed copies of legitimate URLs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#102A36] border border-slate-800 space-y-2">
              <span className="text-teal-400 font-bold uppercase text-[10px]">02 · Mobile Vector</span>
              <h4 className="text-sm font-bold text-white">Smishing & Vishing</h4>
              <p className="text-slate-400 leading-relaxed">
                SMS-based social engineering creating artificial urgency to compromise M-Pesa balances and banking apps.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#102A36] border border-slate-800 space-y-2">
              <span className="text-teal-400 font-bold uppercase text-[10px]">03 · Emerging Threat</span>
              <h4 className="text-sm font-bold text-white">Quishing (QR Codes)</h4>
              <p className="text-slate-400 leading-relaxed">
                Embedding malicious links within image barcodes to bypass text-based perimeter email scanners.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#102A36] border border-slate-800 space-y-2">
              <span className="text-teal-400 font-bold uppercase text-[10px]">04 · Advanced Proxy</span>
              <h4 className="text-sm font-bold text-white">AiTM Session Hijacking</h4>
              <p className="text-slate-400 leading-relaxed">
                Reverse-proxy tools like Evilginx that intercept active session cookies to bypass traditional 2FA security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Platform Features */}
      <section id="platform-features" className="py-20 px-6 border-b border-slate-800 bg-[#0B1120]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-white">The PhishShield Defense Ecosystem</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              An integrated, hands-on cybersecurity platform built for students, IT professionals, and corporate cohorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#102A36] border border-slate-800 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-teal-950/80 border border-teal-800 text-teal-400 rounded-xl shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Predictive URL Threat Scanner</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time Random Forest machine-learning model combined with Shannon entropy and lexical heuristic evaluation to identify malicious domain patterns with scan timer benchmarks.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#102A36] border border-slate-800 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-teal-950/80 border border-teal-800 text-teal-400 rounded-xl shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Interactive Email Sandbox</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  10 realistic simulation templates ranging from easy administrative notices to sophisticated executive impersonations, providing instant behavioral feedback on learner actions.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#102A36] border border-slate-800 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-teal-950/80 border border-teal-800 text-teal-400 rounded-xl shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">2-Page Modular Learning Center</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  14 comprehensive educational security modules complete with detailed threat analysis, embedded instructional videos, key takeaways, and containment protocols.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#102A36] border border-slate-800 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-teal-950/80 border border-teal-800 text-teal-400 rounded-xl shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Verified Certificate of Proficiency</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gated certification strictly unlocked upon 100% curriculum completion and assessment evaluation, issued by Icons Computer School and Cyber with unique verification serials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#102A36] to-[#0B1120] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Ready to Harden Your Security Posture?</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to start analyzing suspicious links, practicing with email simulations, and advancing through the training modules.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg"
            >
              Sign In to Your Account <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="bg-[#0B1120] hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm border border-slate-700 transition"
            >
              Register as New Learner
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-6 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-300">PhishShield Platform</span>
            <span>· Authorized by Icons Computer School and Cyber</span>
          </div>
          <div>
            Lead Coordinator: <strong className="text-slate-400">Joel Ndaba</strong> (+254721952909)
          </div>
        </div>
      </footer>
    </div>
  );
}