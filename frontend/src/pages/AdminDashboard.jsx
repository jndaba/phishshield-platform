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
  ShieldAlert,
  Clock, 
  CheckCircle, 
  UserCheck, 
  Target, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminDocUploader from '../components/AdminDocUploader';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // Default view is now Admin Overview
  const [metrics, setMetrics] = useState(null);
  const [modules, setModules] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [mRes, modRes, simRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/auth/admin-metrics/'),
        axios.get('http://127.0.0.1:8000/api/lms/modules/'),
        axios.get('http://127.0.0.1:8000/api/simulation/emails/')
      ]);
      setMetrics(mRes.data);
      setModules(modRes.data);
      setSimulations(simRes.data);

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

  const selectedLearner = metrics?.learners?.find(
    (l) => l.id.toString() === selectedLearnerId.toString()
  );

  const filteredLearners = metrics?.learners?.filter((l) =>
    l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      {/* Top Admin Command Header Bar */}
      <header className="bg-[#102A36] text-white px-8 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Admin Command Center</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-300">Icons Computer School & Cyber Hub</span>
        </div>

        <nav className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'overview' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 inline mr-1" /> Admin Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('learners')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'learners' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1" /> Inspect Learners ({metrics?.total_learners || 0})
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'modules' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Modules ({modules.length})
          </button>
          <button
            onClick={() => setActiveTab('simulations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'simulations' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Mail className="w-3.5 h-3.5 inline mr-1" /> Simulations ({simulations.length})
          </button>
          <button
            onClick={() => setActiveTab('certified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'certified' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Award className="w-3.5 h-3.5 inline mr-1" /> Certified Registry
          </button>
          <Link
            to="/chat"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-teal-300 hover:bg-slate-700 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Chat Center
          </Link>
          <Link
            to="/admin-control-panel"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 inline mr-1" /> Master Control Panel
          </Link>
        </nav>
      </header>

      {/* Main Admin Content Container */}
      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* TAB 1: ADMIN OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">System Operations & Security Overview</h1>
              <p className="text-xs text-slate-500 mt-1">High-level institutional statistics, curriculum health, and real activity audits.</p>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <Users className="w-4 h-4 text-teal-600 mb-2" />
                <span className="text-[11px] text-slate-400 font-medium">Registered Learners</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{metrics?.total_learners || 0}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <BookOpen className="w-4 h-4 text-teal-600 mb-2" />
                <span className="text-[11px] text-slate-400 font-medium">Active Learning Modules</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{modules.length}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <Mail className="w-4 h-4 text-teal-600 mb-2" />
                <span className="text-[11px] text-slate-400 font-medium">Email Simulation Scenarios</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{simulations.length}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <Award className="w-4 h-4 text-amber-500 mb-2" />
                <span className="text-[11px] text-slate-400 font-medium">Certified Graduates</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {metrics?.learners?.filter((l) => l.is_certified).length || 0}
                </p>
              </div>
            </div>

            {/* Real Audit Trail */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Live Security Operations Audit Trail</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {metrics?.audit_trail && metrics.audit_trail.length > 0 ? (
                  metrics.audit_trail.map((a, idx) => (
                    <div key={idx} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 mr-2">{a.user}:</span>
                        <span className="text-slate-700">{a.title}</span>
                        <p className="text-[10px] text-slate-400">{a.desc}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">{a.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 py-4 text-center">No platform activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SELECT & INSPECT LEARNERS */}
        {activeTab === 'learners' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Learner Inspection & Progress Cockpit</h2>
              <p className="text-xs text-slate-500">Select any individual learner to analyze their specific training and completion metrics.</p>
            </div>

            {/* Learner Selector Bar */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search learner by username or email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <span className="text-xs font-semibold text-slate-600">Select Learner:</span>
                <select
                  value={selectedLearnerId}
                  onChange={(e) => setSelectedLearnerId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  {filteredLearners.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.username} ({l.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Learner Deep Dive */}
            {selectedLearner ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-base">
                      {selectedLearner.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedLearner.username}</h3>
                      <p className="text-xs text-slate-400">{selectedLearner.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedLearner.is_certified ? (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Icons Certified Graduate
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Training In Progress
                      </span>
                    )}
                  </div>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Curriculum Progress</span>
                    <p className="text-xl font-bold text-slate-800 mt-1">
                      {selectedLearner.completed_modules} / {selectedLearner.total_modules} Modules
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-teal-500 h-full rounded-full"
                        style={{ width: `${selectedLearner.total_modules > 0 ? (selectedLearner.completed_modules / selectedLearner.total_modules) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Readiness Score</span>
                    <p className="text-xl font-bold text-teal-700 mt-1">{selectedLearner.readiness_score}%</p>
                    <p className="text-[10px] text-slate-400 mt-1">Evaluated across simulations and exams</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Simulation Attempts</span>
                    <p className="text-xl font-bold text-slate-800 mt-1">{selectedLearner.simulations_completed} Completed</p>
                    <p className="text-[10px] text-slate-400 mt-1">Last activity: {selectedLearner.last_active}</p>
                  </div>
                </div>

                {/* Direct Action */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-600">Need to discuss this learner's performance or review inquiry history?</span>
                  <Link
                    to="/chat"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg transition"
                  >
                    Open Learner Chat Thread
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No learners found matching your criteria.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTENT MANAGEMENT */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Curriculum Content Management</h2>
              <p className="text-xs text-slate-500">Add, review, or delete educational modules.</p>
            </div>

            <AdminDocUploader onUploadSuccess={fetchAdminData} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod) => (
                <div key={mod.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        Module {mod.module_number}
                      </span>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
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

        {/* TAB 4: EMAIL SIMULATIONS */}
        {activeTab === 'simulations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Virtual Simulation Email Scenarios</h2>
                <p className="text-xs text-slate-500">Configure phishing and legitimate email templates for learner sandbox testing.</p>
              </div>
              <Link to="/sandbox" className="bg-teal-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-teal-700">
                Open Sandbox
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm">
              {simulations.map((sim) => (
                <div key={sim.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mr-2 ${sim.is_phishing ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {sim.is_phishing ? 'Phishing' : 'Legitimate'}
                    </span>
                    <strong className="text-slate-900">{sim.sender_name}</strong> &lt;{sim.sender_email}&gt; - <span className="text-slate-600">{sim.subject}</span>
                  </div>
                  <button onClick={() => handleDeleteSimulation(sim.id)} className="text-slate-400 hover:text-red-500 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CERTIFIED GRADUATES */}
        {activeTab === 'certified' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Certified Graduates Registry</h2>
              <p className="text-xs text-slate-500">Students who completed all modules and passed the comprehensive assessment.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              {metrics?.learners?.filter((l) => l.is_certified).length > 0 ? (
                <div className="space-y-3">
                  {metrics.learners.filter((l) => l.is_certified).map((c) => (
                    <div key={c.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-emerald-900">{c.username} ({c.email})</p>
                        <p className="text-[10px] text-emerald-700">100% Curriculum Completed & Verified</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                        Icons Certified
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No learners have reached 100% completion yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}