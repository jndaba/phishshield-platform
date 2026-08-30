import React from 'react';
import { Users, Target, BarChart2, Award, ShieldCheck, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const learners = [
    { name: "Alex Mwangi", email: "alex@phishshield.demo", readiness: 68, simulations: 2, streak: "7 days", active: "Aug 30" }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Admin Console</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Program command center</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor learner readiness, simulation performance, and the signals that need attention across your security program.</p>
        </div>
        <Link
          to="/"
          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Users className="w-3.5 h-3.5" /> Learner view ↗
        </Link>
      </div>

      {/* 4 Admin Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <Users className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-teal-600">📈</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Learners</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">1</p>
          <span className="text-[10px] text-slate-400">Active in this workspace</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <Target className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-teal-600">📈</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Avg readiness</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">68%</p>
          <span className="text-[10px] text-slate-400">Across the cohort</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <BarChart2 className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-teal-600">📈</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Simulation accuracy</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">100%</p>
          <span className="text-[10px] text-slate-400">Correct calls this period</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-teal-600">📈</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Completion rate</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">100%</p>
          <span className="text-[10px] text-slate-400">Learners with activity</span>
        </div>
      </div>

      {/* Cohort Signal & Admin Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cohort Signal</span>
              <h3 className="text-base font-bold text-slate-900">Accuracy trend</h3>
              <p className="text-[11px] text-slate-400">Average simulation accuracy over the last seven days.</p>
            </div>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              Live
            </span>
          </div>

          <div className="flex items-end justify-between h-40 pt-4 px-2 gap-3 border-b border-slate-100 pb-3">
            {[
              { day: 'Mon', val: 71 },
              { day: 'Tue', val: 78 },
              { day: 'Wed', val: 74 },
              { day: 'Thu', val: 81 },
              { day: 'Fri', val: 86 },
              { day: 'Sat', val: 88 },
              { day: 'Sun', val: 100 }
            ].map((item, i) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-slate-400 font-semibold">{item.val}%</span>
                <div
                  className={`w-full rounded-t-md ${i === 6 ? 'bg-amber-400' : 'bg-teal-500'}`}
                  style={{ height: `${item.val}%` }}
                ></div>
                <span className="text-[10px] text-slate-400 font-medium mt-1">{item.day}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Latest cohort read is 100%</span>
          </div>
        </div>

        {/* Admin Focus */}
        <div className="bg-[#102A36] text-white p-6 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">Admin Focus</span>
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Keep the signal moving.</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Use the learner table to spot low readiness, review streaks, and identify who needs a targeted practice assignment.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-xl font-bold text-white block">1</span>
                <span className="text-[10px] text-slate-400">Needs attention</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-xl font-bold text-white block">1</span>
                <span className="text-[10px] text-slate-400">On a streak</span>
              </div>
            </div>
          </div>

          <Link to="/academy" className="text-xs font-semibold text-teal-300 hover:text-teal-200 inline-flex items-center gap-1">
            Open learning lab ↗
          </Link>
        </div>
      </div>

      {/* People / Learner Table & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">People</span>
              <h3 className="text-base font-bold text-slate-900">Learner readiness</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded">1 total</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400">
                <th className="pb-2">Learner</th>
                <th className="pb-2">Readiness</th>
                <th className="pb-2">Simulations</th>
                <th className="pb-2">Streak</th>
                <th className="pb-2 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {learners.map((lr, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                        AM
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{lr.name}</p>
                        <p className="text-[10px] text-slate-400">{lr.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${lr.readiness}%` }}></div>
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">{lr.readiness}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-700">{lr.simulations}</td>
                  <td className="py-3 text-slate-700">{lr.streak}</td>
                  <td className="py-3 text-right text-slate-400">{lr.active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Trail */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Audit Trail</span>
          <h3 className="text-base font-bold text-slate-900 mb-4">Recent activity</h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-slate-100 rounded text-teal-600 mt-0.5">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">URL scan completed</p>
                <p className="text-[10px] text-slate-400">SAFE · 18% risk · https://replit.com/@joshmellow/...</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Alex Mwangi · Aug 30</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-slate-100 rounded text-teal-600 mt-0.5">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">URL scan completed</p>
                <p className="text-[10px] text-slate-400">SAFE · 8% risk · https://dulo.cx/</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Alex Mwangi · Aug 30</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}