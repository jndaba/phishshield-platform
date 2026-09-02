import React, { useState, useEffect, useContext } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Trash2, 
  ShieldCheck, 
  UserX, 
  RotateCcw, 
  Search, 
  Mail, 
  BookOpen, 
  Plus, 
  FileText, 
  AlertTriangle, 
  Sliders,
  CheckCircle,
  X
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AdminDocUploader from '../components/AdminDocUploader';

export default function AdminControlPanel() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'simulations', 'modules', 'recovery'
  const [usersList, setUsersList] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [modules, setModules] = useState([]);
  const [recoveryGuides, setRecoveryGuides] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  // Modals
  const [showSimModal, setShowSimModal] = useState(false);
  const [newSimData, setNewSimData] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    difficulty: 'medium',
    is_phishing: true,
    body_html: '',
    clues: ''
  });

  const fetchEverything = async () => {
    try {
      const [uRes, sRes, mRes, rRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/auth/manage/users/'),
        axios.get('http://127.0.0.1:8000/api/simulation/emails/'),
        axios.get('http://127.0.0.1:8000/api/lms/modules/'),
        axios.get('http://127.0.0.1:8000/api/recovery/guides/')
      ]);
      setUsersList(uRes.data);
      setSimulations(sRes.data);
      setModules(mRes.data);
      setRecoveryGuides(rRes.data);
    } catch (err) {
      console.error('Failed to load system control data', err);
    }
  };

  useEffect(() => {
    fetchEverything();
  }, []);

  const notify = (msg) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(''), 4000);
  };

  // --- USER MANAGEMENT HANDLERS ---
  const handleDeleteUser = async (targetId, targetName) => {
    if (!window.confirm(`PERMANENT ACTION: Delete account '${targetName}' and all their scores, activity logs, and submissions?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/auth/manage/users/${targetId}/`);
      notify(`Account '${targetName}' permanently deleted.`);
      fetchEverything();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  const handleToggleAdminRole = async (targetId, currentIsAdmin, targetName) => {
    const actionName = currentIsAdmin ? 'demote to Learner' : 'promote to Platform Administrator';
    if (!window.confirm(`Are you sure you want to ${actionName} for '${targetName}'?`)) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/auth/manage/users/${targetId}/`, {
        is_admin: !currentIsAdmin
      });
      notify(`Role for '${targetName}' updated successfully.`);
      fetchEverything();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user role.');
    }
  };

  const handleResetUserScore = async (targetId, targetName) => {
    if (!window.confirm(`Reset training readiness score & simulation history to 0 for '${targetName}'?`)) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/auth/manage/users/${targetId}/`, {
        reset_score: true
      });
      notify(`Progress reset to 0% for '${targetName}'.`);
      fetchEverything();
    } catch (err) {
      alert('Failed to reset user statistics.');
    }
  };

  // --- SIMULATION HANDLERS ---
  const handleCreateSimulation = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/simulation/emails/', newSimData);
      setShowSimModal(false);
      setNewSimData({
        sender_name: '',
        sender_email: '',
        subject: '',
        difficulty: 'medium',
        is_phishing: true,
        body_html: '',
        clues: ''
      });
      notify('New email simulation template created.');
      fetchEverything();
    } catch (err) {
      alert('Failed to add simulation.');
    }
  };

  const handleDeleteSimulation = async (id) => {
    if (!window.confirm('Delete this simulation email scenario?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/simulation/emails/${id}/`);
      notify('Simulation scenario removed.');
      fetchEverything();
    } catch (err) {
      alert('Failed to delete simulation.');
    }
  };

  // --- MODULE HANDLERS ---
  const handleDeleteModule = async (id, title) => {
    if (!window.confirm(`Delete module '${title}' from curriculum?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/lms/modules/${id}/`);
      notify(`Module deleted.`);
      fetchEverything();
    } catch (err) {
      alert('Failed to delete module.');
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(u =>
    u.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#0B1120] text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Master Control Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-red-950/80 border border-red-800 text-red-400 rounded-lg">
                <Sliders className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                Executive Root Control
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Master Platform Admin Panel</h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete platform governance: accounts, permissions, simulation campaigns, learning content, and runbooks.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#102A36] border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="text-slate-300">Signed in as: <strong className="text-white">{user?.username}</strong> (Superuser)</span>
          </div>
        </div>

        {statusNotice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {statusNotice}
          </div>
        )}

        {/* Control Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${activeTab === 'users' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Users className="w-4 h-4" /> Manage All Users & Admins ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('simulations')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${activeTab === 'simulations' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Mail className="w-4 h-4" /> Manage Simulations ({simulations.length})
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${activeTab === 'modules' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <BookOpen className="w-4 h-4" /> Manage Curriculum Modules ({modules.length})
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${activeTab === 'recovery' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <AlertTriangle className="w-4 h-4" /> Recovery Runbooks ({recoveryGuides.length})
          </button>
        </div>

        {/* TAB 1: USERS & ADMINS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter users or admins by username / email..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-[#102A36] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
                />
              </div>
              <span className="text-xs text-slate-400">Showing {filteredUsers.length} total platform accounts</span>
            </div>

            <div className="bg-[#102A36] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0B1120]/60 text-[10px] uppercase text-slate-400">
                    <th className="p-4">Account Holder</th>
                    <th className="p-4">Role Designation</th>
                    <th className="p-4">Readiness</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          {u.username}
                          {u.is_self && <span className="text-[9px] bg-teal-900/60 text-teal-300 border border-teal-700 px-1.5 py-0.2 rounded">You</span>}
                        </p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </td>

                      <td className="p-4">
                        {u.is_admin ? (
                          <span className="bg-red-950/80 text-red-400 border border-red-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            Administrator
                          </span>
                        ) : (
                          <span className="bg-teal-950/80 text-teal-300 border border-teal-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            Learner
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-teal-400">{u.readiness_score}%</span>
                      </td>

                      <td className="p-4 text-slate-400">
                        {u.date_joined}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {/* Change Role Button */}
                        <button
                          disabled={u.is_self}
                          onClick={() => handleToggleAdminRole(u.id, u.is_admin, u.username)}
                          title={u.is_admin ? "Demote to Learner" : "Promote to Admin"}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition text-[11px]"
                        >
                          {u.is_admin ? "Demote" : "Make Admin"}
                        </button>

                        {/* Reset Score */}
                        <button
                          onClick={() => handleResetUserScore(u.id, u.username)}
                          title="Reset readiness score to 0%"
                          className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 text-amber-300 rounded-lg transition text-[11px]"
                        >
                          <RotateCcw className="w-3 h-3 inline mr-1" /> Reset
                        </button>

                        {/* Permanent Delete Button */}
                        <button
                          disabled={u.is_self}
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          title="Permanently Delete Account"
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-400 disabled:opacity-40 rounded-lg transition text-[11px]"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATIONS MANAGEMENT */}
        {activeTab === 'simulations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Interactive Sandbox Emails</h3>
                <p className="text-xs text-slate-400">Add custom institutional templates or remove legacy email lures.</p>
              </div>
              <button
                onClick={() => setShowSimModal(true)}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Email Scenario
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulations.map((s) => (
                <div key={s.id} className="bg-[#102A36] border border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase mr-2 ${s.is_phishing ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                        {s.is_phishing ? 'Phishing' : 'Legitimate'}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{s.difficulty}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSimulation(s.id)}
                      className="text-slate-400 hover:text-red-400 p-1"
                      title="Delete Scenario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{s.subject}</h4>
                    <p className="text-xs text-slate-400">{s.sender_name} &lt;{s.sender_email}&gt;</p>
                  </div>
                  <p className="text-xs text-slate-300 bg-[#0B1120] p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] line-clamp-2">
                    {s.clues}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CURRICULUM MANAGEMENT */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Curriculum & Module Deployment</h3>
              <p className="text-xs text-slate-400">Deploy additional 2-page modules with documents and videos.</p>
            </div>

            <AdminDocUploader onUploadSuccess={fetchEverything} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m) => (
                <div key={m.id} className="bg-[#102A36] border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase text-teal-400 bg-teal-950/60 border border-teal-800 px-2 py-0.5 rounded">
                        Module {m.module_number}
                      </span>
                      <button
                        onClick={() => handleDeleteModule(m.id, m.title)}
                        className="text-slate-400 hover:text-red-400 p-1"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{m.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RECOVERY RUNBOOKS */}
        {activeTab === 'recovery' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Emergency Recovery Protocols</h3>
              <p className="text-xs text-slate-400">Guides displayed to learners following suspected credential exposures.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recoveryGuides.map((rg) => (
                <div key={rg.id} className="bg-[#102A36] border border-slate-800 p-5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-teal-400 uppercase">{rg.category}</span>
                    <span className="text-[9px] font-bold text-red-400 uppercase bg-red-950 border border-red-800 px-1.5 py-0.5 rounded">
                      {rg.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{rg.title}</h4>
                  <div className="bg-[#0B1120] p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap line-clamp-4">
                    {rg.steps}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CREATE SIMULATION MODAL */}
      {showSimModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#102A36] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">Deploy Simulation Email Template</h3>
              <button onClick={() => setShowSimModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSimulation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sender Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. University Finance Office"
                  value={newSimData.sender_name}
                  onChange={(e) => setNewSimData({ ...newSimData, sender_name: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sender Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. finance@icons-internal-portal.net"
                  value={newSimData.sender_email}
                  onChange={(e) => setNewSimData({ ...newSimData, sender_email: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Action Required: Unpaid Tuition Statement"
                  value={newSimData.subject}
                  onChange={(e) => setNewSimData({ ...newSimData, subject: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Verdict Classification</label>
                  <select
                    value={newSimData.is_phishing}
                    onChange={(e) => setNewSimData({ ...newSimData, is_phishing: e.target.value === 'true' })}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="true">Phishing (Malicious)</option>
                    <option value="false">Legitimate (Safe)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                  <select
                    value={newSimData.difficulty}
                    onChange={(e) => setNewSimData({ ...newSimData, difficulty: e.target.value })}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Body (HTML supported)</label>
                <textarea
                  rows="3"
                  required
                  placeholder="<p>Dear Student, click here to authenticate...</p>"
                  value={newSimData.body_html}
                  onChange={(e) => setNewSimData({ ...newSimData, body_html: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detection Clues (Shown upon answer)</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Explain what red flags or valid headers to look for..."
                  value={newSimData.clues}
                  onChange={(e) => setNewSimData({ ...newSimData, clues: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg"
                >
                  Publish Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}