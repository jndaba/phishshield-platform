import React from 'react';
import { Mail, Target, Search, Award, ArrowUpRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const activities = [
    { title: "Safe URL detected", url: "https://replit.com/@joshmellow/PhishShield-Cybersecurity-Platform · 18% risk", date: "Aug 30", isSafe: true },
    { title: "Safe URL detected", url: "https://dulo.cx/ · 8% risk", date: "Aug 30", isSafe: true },
    { title: "Safe URL detected", url: "https://dulo.cx/ · 8% risk", date: "Aug 30", isSafe: true },
    { title: "Phishing simulation correct", desc: "Good instinct — you spotted the signal.", date: "Aug 30", isPhish: true },
    { title: "Phishing simulation correct", desc: "Good instinct — you spotted the signal.", date: "Aug 30", isPhish: true },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Monday, October 21</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Good morning, Alex.</h1>
          <p className="text-xs text-slate-500 mt-1">Your habits are getting sharper. Here's the signal from your last seven days.</p>
        </div>
        <Link
          to="/scanner"
          className="bg-[#0D4D4D] hover:bg-[#093838] text-white font-semibold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Search className="w-3.5 h-3.5" /> Scan a URL ↗
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <Mail className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-teal-600">📈</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Emails reviewed</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">2</p>
          <span className="text-[10px] text-slate-400">Across 12 simulations</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <Target className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-teal-600">📈</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Accuracy</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">100%</p>
          <span className="text-[10px] text-teal-600 font-medium">Up 4.8% this week</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <Search className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-teal-600">📈</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">URLs scanned</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">22</p>
          <span className="text-[10px] text-slate-400">No unsafe clicks recorded</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-teal-600">📈</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Certificates</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">1</p>
          <span className="text-[10px] text-slate-400">1 more unlocks Expert</span>
        </div>
      </div>

      {/* Middle Grid: Signal Trend & Readiness Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signal Trend</span>
              <h3 className="text-base font-bold text-slate-900">Weekly accuracy</h3>
            </div>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
              +4.8% vs last week
            </span>
          </div>

          {/* Bar signal simulation */}
          <div className="flex items-end justify-between h-40 pt-4 px-2 gap-3 border-b border-slate-100 pb-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-md transition-all ${i === 6 ? 'bg-amber-400' : 'bg-teal-500'}`}
                  style={{ height: `${[40, 65, 80, 70, 90, 95, 88][i]}%` }}
                ></div>
                <span className="text-[10px] text-slate-400 font-medium">{day}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Today's read is your strongest yet</span>
            <span className="font-bold text-slate-700">88%</span>
          </div>
        </div>

        {/* Dark Readiness Card */}
        <div className="bg-[#102A36] text-white p-6 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">Readiness</span>
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold mb-4">You're in the clear.</h3>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-white">68</span>
              <span className="text-xs text-slate-400">/ 100 overall</span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
              <div className="bg-teal-400 h-full rounded-full" style={{ width: '68%' }}></div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Complete the <span className="text-teal-300 font-semibold">Social engineering patterns</span> quiz to reach your next milestone.
            </p>
          </div>

          <Link to="/academy" className="text-xs font-semibold text-teal-300 hover:text-teal-200 inline-flex items-center gap-1 mt-4">
            Continue learning ↗
          </Link>
        </div>
      </div>

      {/* Bottom Grid: Trail & Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Trail</span>
              <h3 className="text-base font-bold text-slate-900">Recent activity</h3>
            </div>
            <span className="text-[10px] text-slate-400">Last 7 days</span>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.map((act, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    {act.isSafe ? <Search className="w-3.5 h-3.5 text-teal-600" /> : <Mail className="w-3.5 h-3.5 text-teal-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{act.title}</p>
                    <p className="text-[11px] text-slate-400">{act.url || act.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{act.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Box */}
        <div className="bg-[#E6F4F1] border border-teal-200/60 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-2">Recommended Next</span>
            <h3 className="text-base font-bold text-slate-900 mb-2">Can you spot the invoice trap?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A new payment-themed simulation is waiting. Take 90 seconds to test your instincts.
            </p>
          </div>

          <Link
            to="/sandbox"
            className="mt-6 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-4 py-2 rounded-lg text-xs border border-slate-200 text-center transition block shadow-sm"
          >
            Review simulation ↗
          </Link>
        </div>
      </div>
    </div>
  );
}