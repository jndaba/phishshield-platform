import React, { useState, useEffect, useContext } from 'react';
import { Mail, Target, Search, Award, CheckCircle, Clock, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/auth/user-stats/');
        setStats(res.data.stats);
        setActivities(res.data.recent_activity || []);
      } catch (err) {
        console.error("Failed to load user stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  return (
    <div className="min-h-full bg-[#F1F5F9] flex flex-col">
      {/* LEARNER TOP NAVIGATION BAR */}
      <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-700">Icons Computer School & Cyber Security Portal</span>
        </div>
        <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <Link to="/chat" className="hover:text-teal-600 transition">Messages & Support</Link>
          <Link to="/recovery" className="hover:text-teal-600 transition">Incident Guide</Link>
          <a href="mailto:support@iconscomputerschool.co.ke" className="hover:text-teal-600 transition">Contact Us</a>
          <span className="text-slate-300">|</span>
          <span className="text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full text-[11px] font-bold">
            {user?.username} (Learner)
          </span>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Learner Overview Cockpit</h1>
            <p className="text-xs text-slate-500 mt-1">Track your progress toward earning your Certificate in Phishing Defense.</p>
          </div>
          <Link
            to="/scanner"
            className="bg-[#102A36] hover:bg-[#163847] text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" /> Scan a URL ↗
          </Link>
        </div>

        {/* Certificate Progress Bar Card */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-600" /> Certificate Qualification Progress
            </span>
            <span className="text-xs font-extrabold text-teal-700">{stats?.progress_percentage || 0}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats?.progress_percentage || 0}%` }}></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>Completed {stats?.completed_modules || 0} of {stats?.total_modules || 14} Core Modules</span>
            {stats?.is_certified ? (
              <span className="text-emerald-600 font-bold">Ready for Download!</span>
            ) : (
              <span>Complete all modules to unlock your certificate</span>
            )}
          </div>
        </div>

        {/* Real Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <BookOpen className="w-4 h-4 text-teal-600 mb-2" />
            <span className="text-[11px] text-slate-400 font-medium">Modules Completed</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.completed_modules || 0} / {stats?.total_modules || 14}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <Target className="w-4 h-4 text-amber-500 mb-2" />
            <span className="text-[11px] text-slate-400 font-medium">Simulation Accuracy</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.sim_accuracy || 0}%</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <Search className="w-4 h-4 text-teal-600 mb-2" />
            <span className="text-[11px] text-slate-400 font-medium">URLs Scanned</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.urls_scanned || 0}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <Award className="w-4 h-4 text-amber-500 mb-2" />
            <span className="text-[11px] text-slate-400 font-medium">Certificate Status</span>
            <p className="text-base font-bold text-slate-900 mt-2">
              {stats?.is_certified ? 'Unlocked' : 'Locked (In Progress)'}
            </p>
          </div>
        </div>

        {/* Recent Real Activity */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Your Recent Activity Trail</h3>
          {activities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activities.map((act, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{act.title}</p>
                    <p className="text-[10px] text-slate-400">{act.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">{act.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No recent activity. Start scanning URLs or practicing simulations.</p>
          )}
        </div>
      </main>
    </div>
  );
}