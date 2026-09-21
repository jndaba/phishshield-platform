import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  MessageSquare, 
  BookOpen, 
  PhoneCall, 
  Award, 
  Target, 
  Inbox, 
  Search, 
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    readinessScore: 0,
    modulesCompleted: 0,
    totalModules: 20,
    simulationsCompleted: 0,
    totalSimulations: 10,
    examPassed: false
  });
  const [recentModules, setRecentModules] = useState([]);

  useEffect(() => {
    fetchLearnerData();
  }, []);

  const fetchLearnerData = async () => {
    setLoading(true);
    try {
      const [modulesRes, inboxRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/lms/modules/'),
        axios.get('http://127.0.0.1:8000/api/simulation/inbox/')
      ]);

      const modules = modulesRes.data || [];
      const scenarios = inboxRes.data?.scenarios || [];
      const inboxStats = inboxRes.data?.stats || {};

      const readiness = user?.readiness_score || 0;
      const completedMods = Math.round((readiness / 100) * (modules.length || 20));

      setRecentModules(modules.slice(0, 4));
      setStats({
        readinessScore: readiness,
        modulesCompleted: completedMods,
        totalModules: modules.length || 20,
        simulationsCompleted: inboxStats.completed || 0,
        totalSimulations: scenarios.length || 10,
        examPassed: readiness >= 70
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 p-6 space-y-6">
      {/* Header Banner - Clean 'My Dashboard' without school branding */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-950 rounded-lg border border-blue-200 font-bold text-xs">
              <Activity className="w-4 h-4 inline mr-1" /> Learner Hub
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Welcome back, {user?.username}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor your defense progression, access training modules, and review triage protocols.
          </p>
        </div>

        {/* Top Quick-Access Panel: Messages & Support, Incident Runbooks, Contacts */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => navigate('/chat')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-950 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-blue-950" />
            <span>Messages &amp; Support</span>
          </button>

          <button
            onClick={() => navigate('/recovery')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-950 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-950" />
            <span>Incident Runbooks</span>
          </button>

          <button
            onClick={() => navigate('/contact')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-950 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-blue-950" />
            <span>Contacts</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Readiness */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-950" /> Overall Readiness
            </span>
            <h3 className="text-3xl font-black text-blue-950 mt-2">
              {stats.readinessScore}%
            </h3>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.readinessScore >= 70 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, stats.readinessScore)}%` }}
            />
          </div>
        </div>

        {/* Modules Progress */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-950" /> Curriculum Coverage
            </span>
            <h3 className="text-3xl font-black text-slate-900 mt-2">
              {stats.modulesCompleted} / {stats.totalModules}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Learning units completed</p>
        </div>

        {/* Simulated Inbox Triage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5 text-blue-950" /> Mailbox Simulations
            </span>
            <h3 className="text-3xl font-black text-slate-900 mt-2">
              {stats.simulationsCompleted} / {stats.totalSimulations}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Attack scenarios triaged</p>
        </div>

        {/* Certification Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-950" /> Qualification
            </span>
            <h3 className={`text-xl font-black mt-2 ${stats.examPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {stats.examPassed ? 'Certified' : 'In Training'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {stats.examPassed ? '70%+ score requirement met' : 'Requires &ge; 70% assessment score'}
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Curriculum Shortcut */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Training Curriculum
              </h3>
              <p className="text-xs text-slate-500">Pick up where you left off in your modules.</p>
            </div>
            <button
              onClick={() => navigate('/modules')}
              className="text-xs font-bold text-blue-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All Modules <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {recentModules.map((mod) => (
              <div 
                key={mod.id} 
                onClick={() => navigate('/modules')}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-950 transition flex flex-col justify-between space-y-2 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Module {mod.module_number}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {mod.estimated_read_time || '8 mins'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 leading-snug">{mod.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Defense Toolkit */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Security Actions
            </h3>

            <div className="mt-4 space-y-3">
              <div 
                onClick={() => navigate('/scanner')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-blue-950 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-950">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Inspect Suspicious Link</h4>
                    <p className="text-[11px] text-slate-500">Analyze URLs with real-time heuristic scanning</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div 
                onClick={() => navigate('/simulation')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-blue-950 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-950">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Open Simulated Inbox</h4>
                    <p className="text-[11px] text-slate-500">Examine deceptive emails in a safe sandbox</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div 
                onClick={() => navigate('/assessment')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-blue-950 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-950">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Assessment Exam</h4>
                    <p className="text-[11px] text-slate-500">Test knowledge against 25 questions to earn certificate</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-950 space-y-1">
            <span className="font-bold block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Need Help?
            </span>
            <p className="text-[11px] text-slate-600">
              Use the top panel to quickly contact a support officer or launch incident recovery runbooks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}