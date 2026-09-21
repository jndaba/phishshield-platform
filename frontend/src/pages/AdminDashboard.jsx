import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Mail, 
  Award, 
  MessageSquare, 
  Search, 
  Trash2, 
  ShieldCheck, 
  RotateCcw,
  Sliders,
  Activity,
  Info,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminDocUploader from '../components/AdminDocUploader';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [modules, setModules] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [mRes, modRes, simRes, unreadRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/auth/admin-metrics/'),
        axios.get('http://127.0.0.1:8000/api/lms/modules/'),
        axios.get('http://127.0.0.1:8000/api/simulation/inbox/'),
        axios.get('http://127.0.0.1:8000/api/chat/unread-count/').catch(() => ({ data: { unread_count: 0 } }))
      ]);
      
      setMetrics(mRes.data);
      setModules(modRes.data);
      setSimulations(simRes.data?.scenarios || simRes.data || []);
      
      const unread = unreadRes.data?.unread_count ?? mRes.data?.unread_messages_count ?? 0;
      setUnreadChatCount(unread);

      if (mRes.data?.learners?.length > 0 && !selectedLearnerId) {
        setSelectedLearnerId(mRes.data.learners[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to load admin metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Delete this module from the curriculum?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/lms/modules/${id}/`);
      fetchAdminData();
    } catch (err) {
      alert("Failed to delete module.");
    }
  };

  const handleDeleteSimulation = async (id) => {
    if (!window.confirm("Delete this mock email scenario?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/simulation/emails/${id}/`);
      fetchAdminData();
    } catch (err) {
      alert("Failed to delete simulation email.");
    }
  };

  const handleResetLearnerReadiness = async (learner) => {
    if (!learner) return;
    if (!window.confirm(`Reset readiness score and simulation history for "${learner.username}" back to 0%?`)) {
      return;
    }
    setResetting(true);
    try {
      await axios.patch(`http://127.0.0.1:8000/api/auth/manage/users/${learner.id}/`, {
        reset_score: true
      });
      alert(`Readiness score and progress for ${learner.username} reset to 0%.`);
      fetchAdminData();
    } catch (err) {
      alert("Failed to reset learner readiness score.");
    } finally {
      setResetting(false);
    }
  };

  const filteredLearners = (metrics?.learners || []).filter((l) =>
    l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLearner = filteredLearners.find(
    (l) => l.id.toString() === selectedLearnerId.toString()
  ) || filteredLearners[0];

  return (
    <div className="min-h-full bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* =========================================================================
          TOP COMMAND BAR: MIDNIGHT BLUE
         ========================================================================= */}
      <header className="bg-blue-950 border-b border-blue-900 px-6 sm:px-8 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-900 border border-blue-800 text-white flex items-center justify-center font-black shadow-xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black text-white uppercase tracking-tight block">
                Governance Cockpit
              </span>
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
                Icons Cyber Lab &middot; Executive Console
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-blue-900 text-white shadow-xs border border-blue-800' 
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> 
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('learners')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'learners' 
                  ? 'bg-blue-900 text-white shadow-xs border border-blue-800' 
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> 
              <span>Learner Dossier ({metrics?.total_learners ?? filteredLearners.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('modules')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'modules' 
                  ? 'bg-blue-900 text-white shadow-xs border border-blue-800' 
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> 
              <span>Curriculum ({modules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('simulations')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'simulations' 
                  ? 'bg-blue-900 text-white shadow-xs border border-blue-800' 
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> 
              <span>Simulations ({simulations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('certified')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'certified' 
                  ? 'bg-blue-900 text-white shadow-xs border border-blue-800' 
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> 
              <span>Certificates</span>
            </button>

            <Link
              to="/chat"
              className="px-3 py-1.5 rounded-xl font-bold bg-blue-900 border border-blue-800 text-blue-100 hover:bg-blue-800 transition flex items-center gap-1.5 relative"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-300" />
              <span>Triage Chat</span>
              {unreadChatCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-blue-950 bg-white rounded-full animate-bounce">
                  +{unreadChatCount}
                </span>
              )}
            </Link>

            <Link
              to="/admin/control-panel"
              className="px-3 py-1.5 rounded-xl font-bold bg-blue-900 border border-blue-800 text-blue-100 hover:bg-blue-800 transition flex items-center gap-1.5 shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-300" />
              <span>Master Control Panel</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Admin Workspace Container */}
      <main className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">

        {/* =========================================================================
            PERSISTENT TOP-BAR LEARNER SELECTOR & OVERVIEW RIBBON
           ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Learner Dropdown Selector */}
            <div className="flex-1 w-full lg:max-w-md space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Inspect Targeted Learner Performance:
              </label>
              <div className="relative">
                <select
                  value={selectedLearnerId || (selectedLearner ? selectedLearner.id : '')}
                  onChange={(e) => setSelectedLearnerId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-950 focus:bg-white transition cursor-pointer pr-10"
                >
                  {filteredLearners.length > 0 ? (
                    filteredLearners.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.username} &mdash; ({l.completed_modules}/{l.total_modules} Modules | {l.readiness_score}% Readiness)
                      </option>
                    ))
                  ) : (
                    <option value="">No enrolled learners registered</option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Quick Metrics Counter (Excluding Admins) */}
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Learners</span>
                <span className="text-base font-black text-slate-900">
                  {metrics?.total_learners ?? filteredLearners.length}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Curriculum</span>
                <span className="text-base font-black text-slate-900">{modules.length}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Certified</span>
                <span className="text-base font-black text-blue-950">
                  {metrics?.learners?.filter((l) => l.is_certified).length ?? 0}
                </span>
              </div>
            </div>

          </div>

          {/* Targeted Learner Header Summary */}
          {selectedLearner && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/50 border border-blue-200 text-blue-950 font-black flex items-center justify-center text-sm">
                  {selectedLearner.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-bold">{selectedLearner.username}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">({selectedLearner.email})</span>
                    {selectedLearner.is_certified ? (
                      <span className="text-[10px] font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Accredited
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Training
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Readiness: <strong className="text-blue-950 font-bold">{selectedLearner.readiness_score}%</strong> &middot; 
                    Completed {selectedLearner.completed_modules}/{selectedLearner.total_modules} Modules &middot; 
                    {selectedLearner.simulations_completed} Simulations Attempted
                  </p>
                </div>
              </div>

              {/* Reset Readiness Score Action */}
              <button
                onClick={() => handleResetLearnerReadiness(selectedLearner)}
                disabled={resetting}
                className="px-3.5 py-2 rounded-xl border border-blue-950/20 bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>Reset Learner Readiness (0%)</span>
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            TAB 1: ADMIN OVERVIEW
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                System Operations &amp; Security Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                High-level institutional statistics, curriculum health, and real-time security audit feeds.
              </p>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
                <div className="w-8 h-8 rounded-xl bg-blue-100/50 text-blue-950 flex items-center justify-center mb-3">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Registered Learners
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {metrics?.total_learners ?? filteredLearners.length}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Strictly excludes administrators</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
                <div className="w-8 h-8 rounded-xl bg-blue-100/50 text-blue-950 flex items-center justify-center mb-3">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Active Modules
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">{modules.length}</p>
                <span className="text-[10px] text-slate-400 block mt-1">Core security modules</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
                <div className="w-8 h-8 rounded-xl bg-blue-100/50 text-blue-950 flex items-center justify-center mb-3">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Mailbox Scenarios
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">{simulations.length}</p>
                <span className="text-[10px] text-slate-400 block mt-1">Active sandbox emails</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
                <div className="w-8 h-8 rounded-xl bg-blue-100/50 text-blue-950 flex items-center justify-center mb-3">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Certified Graduates
                </span>
                <p className="text-2xl font-black text-blue-950 mt-1">
                  {metrics?.learners?.filter((l) => l.is_certified).length || 0}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">100% finished &amp; passed</span>
              </div>
            </div>

            {/* Educational Readiness Score Context & Explanation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
              <div className="p-2.5 bg-blue-100/50 text-blue-950 border border-blue-200 rounded-xl shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <strong className="text-sm font-bold text-slate-900 block">
                  About the Learner Readiness Score (0-100%)
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  The <strong>Readiness Score</strong> is an active resilience metric tracked exclusively for enrolled students. It quantifies their defense readiness by weighing curriculum module progression against mailbox simulation accuracy. <strong>System administrators are exempt from readiness tracking</strong>.
                </p>
                <p className="text-slate-500 leading-relaxed pt-0.5">
                  If a student requires a fresh baseline or retraining after failing multiple scenarios, administrators can click <strong>Reset Score</strong> in the top bar selector or Dossier tab to reset their readiness to 0% and clear prior simulation records.
                </p>
              </div>
            </div>

            {/* Live Audit Trail */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-950" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Live Security Operations Audit Trail
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Real-time Stream</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {metrics?.audit_trail && metrics.audit_trail.length > 0 ? (
                  metrics.audit_trail.map((a, idx) => (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                      <div>
                        <span className="font-bold text-slate-900 mr-2">{a.user}:</span>
                        <span className="text-slate-700">{a.title}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{a.desc}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{a.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 py-6 text-center text-xs">No platform activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: LEARNER DOSSIER DEEP DIVE
           ========================================================================= */}
        {activeTab === 'learners' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Learner Dossier &amp; Competence Analysis
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Detailed metrics evaluating completion velocity, simulation accuracy, and readiness resets.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search learner by username or email..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-950 shadow-2xs"
              />
            </div>

            {selectedLearner ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100/50 border border-blue-200 flex items-center justify-center text-blue-950 font-black text-base">
                      {selectedLearner.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{selectedLearner.username}</h3>
                      <p className="text-xs text-slate-500 font-mono">{selectedLearner.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedLearner.is_certified ? (
                      <span className="bg-blue-50 text-blue-950 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-950" /> Icons Certified Graduate
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1 rounded-full">
                        Training In Progress
                      </span>
                    )}

                    <button
                      onClick={() => handleResetLearnerReadiness(selectedLearner)}
                      disabled={resetting}
                      className="px-3 py-1 rounded-full border border-blue-950/20 bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
                      <span>Reset Score</span>
                    </button>
                  </div>
                </div>

                {/* Performance Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Curriculum Progress</span>
                    <p className="text-xl font-black text-slate-900">
                      {selectedLearner.completed_modules} / {selectedLearner.total_modules} Modules
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-blue-950 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedLearner.total_modules > 0 ? (selectedLearner.completed_modules / selectedLearner.total_modules) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Readiness Score</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        selectedLearner.readiness_score >= 80 
                          ? 'bg-blue-50 text-blue-950' 
                          : selectedLearner.readiness_score >= 50 
                          ? 'bg-slate-100 text-slate-700' 
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {selectedLearner.readiness_score >= 80 ? 'High' : selectedLearner.readiness_score >= 50 ? 'Moderate' : 'Low'}
                      </span>
                    </div>
                    <p className="text-xl font-black text-blue-950">{selectedLearner.readiness_score}%</p>
                    <p className="text-[10px] text-slate-500">
                      Curriculum progress &plus; simulation accuracy index.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Simulation Attempts</span>
                    <p className="text-xl font-black text-slate-900">{selectedLearner.simulations_completed} Completed</p>
                    <p className="text-[10px] text-slate-500">Last activity: {selectedLearner.last_active}</p>
                  </div>
                </div>

                {/* Direct Action */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-600">
                    Need to provide targeted guidance or review triage messages with this learner?
                  </span>
                  <Link
                    to="/chat"
                    className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-xl transition shadow-xs shrink-0"
                  >
                    Open Triage Thread
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No learners found matching your filter criteria.
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: CURRICULUM MANAGEMENT
           ========================================================================= */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Curriculum Content Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Upload new training materials, review educational objectives, or delete modules.
              </p>
            </div>

            <AdminDocUploader onUploadSuccess={fetchAdminData} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod) => (
                <div key={mod.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase text-blue-950 bg-blue-100/50 border border-blue-200 px-2 py-0.5 rounded">
                        Module {mod.module_number}
                      </span>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{mod.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{mod.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: MAILBOX SIMULATION SCENARIOS
           ========================================================================= */}
        {activeTab === 'simulations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Mailbox Simulation Scenarios
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Inspect the 10 sandbox phishing and legitimate email payloads configured for learners.
                </p>
              </div>
              <Link to="/simulation" className="bg-blue-950 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-900 transition shadow-xs">
                Launch Mailbox Sandbox
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-xs overflow-hidden">
              {simulations.map((sim) => (
                <div key={sim.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                      sim.is_phishing 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {sim.is_phishing ? 'Phishing' : 'Legitimate'}
                    </span>
                    <strong className="text-slate-900">{sim.sender_display_name || sim.sender_name}</strong> 
                    <span className="text-slate-400 font-mono">&lt;{sim.sender_email}&gt;</span>
                    <span className="text-slate-400">&mdash;</span>
                    <span className="text-slate-700 font-semibold">{sim.subject}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteSimulation(sim.id)} 
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition"
                    title="Delete Scenario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CERTIFIED GRADUATES REGISTRY
           ========================================================================= */}
        {activeTab === 'certified' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Certified Graduates Registry
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Learners who completed 100% of curriculum modules and passed the comprehensive assessment.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              {metrics?.learners?.filter((l) => l.is_certified).length > 0 ? (
                <div className="space-y-3">
                  {metrics.learners.filter((l) => l.is_certified).map((c) => (
                    <div key={c.id} className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-blue-950">{c.username} ({c.email})</p>
                        <p className="text-[10px] text-blue-800 mt-0.5">100% Curriculum Completed &amp; Verified</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-950 bg-white px-3 py-1 rounded-lg border border-blue-300 shadow-2xs">
                        Icons Accredited
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">
                  No learners have achieved 100% completion and passed the assessment examination yet.
                </p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}