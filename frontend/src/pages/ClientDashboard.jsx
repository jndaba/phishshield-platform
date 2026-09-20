import React, { useState, useEffect, useContext } from 'react';
import { 
  Mail, 
  Target, 
  Search, 
  Award, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen,
  Info,
  Activity,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const [statsRes, unreadRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/auth/user-stats/'),
          axios.get('http://127.0.0.1:8000/api/chat/unread-count/').catch(() => ({ data: { unread_count: 0 } }))
        ]);
        setStats(statsRes.data.stats);
        setActivities(statsRes.data.recent_activity || []);
        setUnreadCount(unreadRes.data.unread_count || 0);
      } catch (err) {
        console.error("Failed to load user stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  const readinessScore = user?.readiness_score || 0;
  const isAdmin = Boolean(user?.is_admin || user?.is_staff);

  return (
    <div className="min-h-full bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* TOP NAVIGATION BAR WITH UNREAD CHAT BADGE */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-bold text-slate-800">
            Icons Computer School &amp; Cyber Defense Portal
          </span>
        </div>
        
        <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <Link to="/chat" className="hover:text-blue-600 transition flex items-center gap-1.5 relative">
            <span>Messages &amp; Support</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-rose-600 rounded-full animate-bounce">
                +{unreadCount}
              </span>
            )}
          </Link>
          <Link to="/recovery" className="hover:text-blue-600 transition">Incident Guides</Link>
          <Link to="/contact" className="hover:text-blue-600 transition">Contact Directory</Link>
          <span className="text-slate-300">|</span>
          
          {isAdmin ? (
            <span className="text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
              {user?.username} (Administrator)
            </span>
          ) : (
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
              {user?.username} (Learner)
            </span>
          )}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header Title & Quick Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Monitor your cyber resilience metrics, complete simulation scenarios, and prepare for certification.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Live Triage</span>
              {unreadCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  +{unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/scanner"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-md shadow-blue-600/20 shrink-0"
            >
              <Search className="w-3.5 h-3.5" /> 
              <span>Scan Suspicious URL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Readiness Score Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                Cyber Resilience Readiness Score
              </h2>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Your <strong>Readiness Score</strong> is an analytical index measuring your practical ability to spot and neutralize deceptive social engineering attacks. It updates dynamically as you complete core learning modules and accurately identify threats in the 10 mailbox simulation scenarios. Maintaining a score of <strong>80%+</strong> proves high behavioral resilience and prepares you to clear the final assessment examination.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>80-100%: High Resilience</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>50-79%: Moderate Resilience</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>&lt; 50%: Vulnerable / Training Needed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 bg-slate-50 border border-slate-200 p-4 rounded-2xl shrink-0 w-full md:w-auto justify-around md:justify-start">
            <div className="text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Index
              </span>
              <span className="text-3xl font-black text-blue-600">
                {readinessScore}%
              </span>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Proficiency Tier
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                readinessScore >= 80 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : readinessScore >= 50 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {readinessScore >= 80 
                  ? 'High Resilience' 
                  : readinessScore >= 50 
                  ? 'Moderate Resilience' 
                  : 'Vulnerable'}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Progress Bar Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> 
              <span>Certificate Qualification Progress</span>
            </span>
            <span className="text-xs font-black text-blue-600">
              {stats?.progress_percentage || 0}% Completed
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stats?.progress_percentage || 0}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
            <span>
              Completed <strong>{stats?.completed_modules || 0}</strong> of <strong>{stats?.total_modules || 14}</strong> Core Modules
            </span>
            {stats?.is_certified ? (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                Accredited &amp; Ready for Download!
              </span>
            ) : (
              <span className="text-slate-400">
                Complete modules &amp; assessment quiz to unlock credential
              </span>
            )}
          </div>
        </div>

        {/* Real Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Modules Completed
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats?.completed_modules || 0} / {stats?.total_modules || 14}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Simulation Accuracy
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats?.sim_accuracy || 0}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              URLs Scanned
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats?.urls_scanned || 0}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Certificate Status
            </span>
            <p className="text-base font-black text-slate-900 mt-2 flex items-center gap-1.5">
              {stats?.is_certified ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Unlocked
                </span>
              ) : (
                <span className="text-slate-500 font-semibold text-xs">
                  In Progress
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Recent Real Activity Log */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Recent Training Activity
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Ingestion</span>
          </div>

          {activities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activities.map((act, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{act.title}</p>
                    <p className="text-[11px] text-slate-500">{act.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              No recent training activity logged. Start scanning URLs or practicing mailbox simulation scenarios.
            </p>
          )}
        </div>

      </main>
    </div>
  );
}