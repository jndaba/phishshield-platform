import React, { useState, useEffect, useContext } from 'react';
import { 
  Sliders, 
  Users, 
  ShieldAlert, 
  HelpCircle, 
  PhoneCall, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  UserX,
  UserCheck,
  RotateCcw,
  Info,
  BookOpen,
  Inbox,
  Mail
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function MasterControlPanel() {
  const { user: currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'modules' | 'runbooks' | 'questions' | 'scenarios' | 'contacts'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Data Collections
  const [usersList, setUsersList] = useState([]);
  const [modulesList, setModulesList] = useState([]);
  const [runbooksList, setRunbooksList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [scenariosList, setScenariosList] = useState([]);
  const [contactsList, setContactsList] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'module' | 'runbook' | 'question' | 'scenario' | 'contact'
  const [editingItem, setEditingItem] = useState(null);

  // Form States
  const [moduleForm, setModuleForm] = useState({
    module_number: 1,
    title: '',
    description: '',
    category: 'Cyber Defense',
    video_url: '',
    rich_content: ''
  });

  const [runbookForm, setRunbookForm] = useState({
    title: '',
    threat_category: 'Credential Harvesting',
    severity: 'HIGH',
    summary: '',
    immediate_steps: '',
    containment_checklist: ''
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: ''
  });

  const [scenarioForm, setScenarioForm] = useState({
    scenario_number: 1,
    sender_name: '',
    sender_email: '',
    subject: '',
    is_phishing: true,
    difficulty: 'medium',
    clues: '',
    body_html: ''
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    role: 'Security Support Officer',
    phone: '',
    email: '',
    institution: 'Icons Computer School and Cyber',
    office_location: ''
  });

  // 1. Data Fetchers
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/auth/manage/users/');
      setUsersList(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/lms/modules/');
      setModulesList(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRunbooks = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/lms/incident-guides/');
      setRunbooksList(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/simulation/quiz/manage/questions/');
      setQuestionsList(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchScenarios = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/simulation/emails/');
      setScenariosList(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/auth/contact/');
      setContactsList(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCurrentTabData = async () => {
    setLoading(true);
    if (activeTab === 'users') await fetchUsers();
    if (activeTab === 'modules') await fetchModules();
    if (activeTab === 'runbooks') await fetchRunbooks();
    if (activeTab === 'questions') await fetchQuestions();
    if (activeTab === 'scenarios') await fetchScenarios();
    if (activeTab === 'contacts') await fetchContacts();
    setLoading(false);
  };

  useEffect(() => {
    loadCurrentTabData();
  }, [activeTab]);

  // 2. User & Readiness Management Actions
  const handleToggleAdmin = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      alert("Safety restriction: You cannot alter your own administrative permissions.");
      return;
    }
    try {
      await axios.patch(`http://127.0.0.1:8000/api/auth/manage/users/${targetUser.id}/`, {
        is_admin: !targetUser.is_admin
      });
      setFeedback({ type: 'success', message: `Permissions updated for ${targetUser.username}.` });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update user privileges.' });
    }
  };

  const handleResetReadiness = async (targetUser) => {
    if (!window.confirm(`Reset readiness score and completed simulation progress for "${targetUser.username}" back to 0%?`)) {
      return;
    }
    try {
      await axios.patch(`http://127.0.0.1:8000/api/auth/manage/users/${targetUser.id}/`, {
        reset_score: true
      });
      setFeedback({ type: 'success', message: `Readiness score and simulation attempts for ${targetUser.username} have been reset to 0%.` });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to reset learner score.' });
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      alert("Safety restriction: You cannot delete your own logged-in account.");
      return;
    }
    if (!window.confirm(`Permanently delete account for "${targetUser.username}"? This cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`http://127.0.0.1:8000/api/auth/manage/users/${targetUser.id}/`);
      setFeedback({ type: 'success', message: `Account "${targetUser.username}" permanently deleted.` });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete user account.' });
    }
  };

  // 3. Delete Handlers for Content
  const handleDeleteModule = async (mod) => {
    if (!window.confirm(`Delete module "${mod.title}"?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/lms/modules/${mod.id}/`);
      setFeedback({ type: 'success', message: `Module "${mod.title}" removed.` });
      fetchModules();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete module.' });
    }
  };

  const handleDeleteRunbook = async (guide) => {
    if (!window.confirm(`Delete runbook "${guide.title}"?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/lms/incident-guides/${guide.id}/`);
      setFeedback({ type: 'success', message: `Runbook "${guide.title}" removed.` });
      fetchRunbooks();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete runbook.' });
    }
  };

  const handleDeleteQuestion = async (q) => {
    if (!window.confirm(`Delete question #${q.id}?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/simulation/quiz/manage/questions/${q.id}/`);
      setFeedback({ type: 'success', message: `Question #${q.id} deleted.` });
      fetchQuestions();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete question.' });
    }
  };

  const handleDeleteScenario = async (scen) => {
    if (!window.confirm(`Delete simulation scenario "${scen.subject}"?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/simulation/emails/${scen.id}/`);
      setFeedback({ type: 'success', message: `Scenario "${scen.subject}" removed.` });
      fetchScenarios();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete simulation scenario.' });
    }
  };

  const handleDeleteContact = async (c) => {
    if (!window.confirm(`Delete contact "${c.name}"?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/auth/contact/${c.id}/`);
      setFeedback({ type: 'success', message: `Contact "${c.name}" removed.` });
      fetchContacts();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to delete contact.' });
    }
  };

  // 4. Modal Open Handlers
  const handleOpenModuleModal = (item = null) => {
    setModalType('module');
    setEditingItem(item);
    if (item) {
      setModuleForm({
        module_number: item.module_number,
        title: item.title,
        description: item.description,
        category: item.category || 'Cyber Defense',
        video_url: item.video_url || '',
        rich_content: item.rich_content || ''
      });
    } else {
      setModuleForm({
        module_number: modulesList.length + 1,
        title: '',
        description: '',
        category: 'Cyber Defense',
        video_url: '',
        rich_content: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenRunbookModal = (item = null) => {
    setModalType('runbook');
    setEditingItem(item);
    if (item) {
      setRunbookForm({
        title: item.title,
        threat_category: item.threat_category,
        severity: item.severity,
        summary: item.summary,
        immediate_steps: item.immediate_steps,
        containment_checklist: item.containment_checklist
      });
    } else {
      setRunbookForm({
        title: '',
        threat_category: 'Credential Harvesting',
        severity: 'HIGH',
        summary: '',
        immediate_steps: '',
        containment_checklist: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenQuestionModal = (item = null) => {
    setModalType('question');
    setEditingItem(item);
    if (item) {
      setQuestionForm({
        question_text: item.question_text,
        option_a: item.option_a,
        option_b: item.option_b,
        option_c: item.option_c,
        option_d: item.option_d,
        correct_option: item.correct_option,
        explanation: item.explanation || ''
      });
    } else {
      setQuestionForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        explanation: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenScenarioModal = (item = null) => {
    setModalType('scenario');
    setEditingItem(item);
    if (item) {
      setScenarioForm({
        scenario_number: item.scenario_number || scenariosList.length + 1,
        sender_name: item.sender_display_name || item.sender_name || '',
        sender_email: item.sender_email || '',
        subject: item.subject || '',
        is_phishing: item.is_phishing ?? true,
        difficulty: item.difficulty || 'medium',
        clues: item.detailed_explanation || item.clues || '',
        body_html: item.body_html || ''
      });
    } else {
      setScenarioForm({
        scenario_number: scenariosList.length + 1,
        sender_name: '',
        sender_email: '',
        subject: '',
        is_phishing: true,
        difficulty: 'medium',
        clues: '',
        body_html: '<p>Scenario email body content...</p>'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenContactModal = (item = null) => {
    setModalType('contact');
    setEditingItem(item);
    if (item) {
      setContactForm({
        name: item.name,
        role: item.role,
        phone: item.phone,
        email: item.email,
        institution: item.institution,
        office_location: item.office_location
      });
    } else {
      setContactForm({
        name: '',
        role: 'Security Support Officer',
        phone: '',
        email: '',
        institution: 'Icons Computer School and Cyber',
        office_location: ''
      });
    }
    setIsModalOpen(true);
  };

  // 5. Submit Handler
  const handleSaveModal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      if (modalType === 'module') {
        if (editingItem) {
          await axios.put(`http://127.0.0.1:8000/api/lms/modules/${editingItem.id}/`, moduleForm);
          setFeedback({ type: 'success', message: 'Learning module updated successfully.' });
        } else {
          await axios.post('http://127.0.0.1:8000/api/lms/modules/', moduleForm);
          setFeedback({ type: 'success', message: 'New learning module created.' });
        }
        fetchModules();
      } else if (modalType === 'runbook') {
        if (editingItem) {
          await axios.put(`http://127.0.0.1:8000/api/lms/incident-guides/${editingItem.id}/`, runbookForm);
          setFeedback({ type: 'success', message: 'Runbook updated successfully.' });
        } else {
          await axios.post('http://127.0.0.1:8000/api/lms/incident-guides/', runbookForm);
          setFeedback({ type: 'success', message: 'New runbook created.' });
        }
        fetchRunbooks();
      } else if (modalType === 'question') {
        if (editingItem) {
          await axios.put(`http://127.0.0.1:8000/api/simulation/quiz/manage/questions/${editingItem.id}/`, questionForm);
          setFeedback({ type: 'success', message: 'Quiz question updated.' });
        } else {
          await axios.post('http://127.0.0.1:8000/api/simulation/quiz/manage/questions/', questionForm);
          setFeedback({ type: 'success', message: 'New quiz question added.' });
        }
        fetchQuestions();
      } else if (modalType === 'scenario') {
        if (editingItem) {
          await axios.put(`http://127.0.0.1:8000/api/simulation/emails/${editingItem.id}/`, scenarioForm);
          setFeedback({ type: 'success', message: 'Simulation scenario updated.' });
        } else {
          await axios.post('http://127.0.0.1:8000/api/simulation/emails/', scenarioForm);
          setFeedback({ type: 'success', message: 'New simulation scenario added.' });
        }
        fetchScenarios();
      } else if (modalType === 'contact') {
        if (editingItem) {
          await axios.put(`http://127.0.0.1:8000/api/auth/contact/${editingItem.id}/`, contactForm);
          setFeedback({ type: 'success', message: 'Directory contact updated.' });
        } else {
          await axios.post('http://127.0.0.1:8000/api/auth/contact/', contactForm);
          setFeedback({ type: 'success', message: 'New contact saved.' });
        }
        fetchContacts();
      }
      setIsModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to save changes.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 p-4 sm:p-6 space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-blue-100/50 border border-blue-200 text-blue-950 shadow-xs">
              <Sliders className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-950 uppercase tracking-widest">
              Executive Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Master Platform Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Centralized authority to manage learner roles and reset readiness scores, author learning modules and incident recovery runbooks, curate assessment quiz questions, edit simulation attack vectors, and manage the support directory.
          </p>
        </div>

        {activeTab !== 'users' && (
          <button
            onClick={() => {
              if (activeTab === 'modules') handleOpenModuleModal();
              if (activeTab === 'runbooks') handleOpenRunbookModal();
              if (activeTab === 'questions') handleOpenQuestionModal();
              if (activeTab === 'scenarios') handleOpenScenarioModal();
              if (activeTab === 'contacts') handleOpenContactModal();
            }}
            className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === 'modules' && 'Create Module'}
              {activeTab === 'runbooks' && 'Create Runbook'}
              {activeTab === 'questions' && 'Add Question'}
              {activeTab === 'scenarios' && 'Create Scenario'}
              {activeTab === 'contacts' && 'Add Contact'}
            </span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts &amp; Readiness</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'modules'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Learning Modules</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'scenarios'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Simulated Inbox Scenarios</span>
        </button>

        <button
          onClick={() => setActiveTab('runbooks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'runbooks'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Incident Runbooks</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Assessment Questions</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact Directory</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-mono">
            Accessing database records...
          </div>
        ) : (
          <>
            {/* 1. USERS & READINESS CONTROL */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-blue-100/50 text-blue-950 border border-blue-200 rounded-lg shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <strong className="text-slate-800 font-bold block">
                      Readiness Score Governance:
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      The readiness score (0-100%) applies strictly to <strong>Learners</strong>. It measures their combined curriculum coverage and simulation accuracy to quantify defensive aptitude before examination. Administrators are excluded from readiness tracking. Admins can reset a learner's readiness score at any time to clear attempts and allow a fresh training cycle.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      User Registry &amp; Privileges
                    </h3>
                    <p className="text-xs text-slate-500">
                      Promote or demote administrators, reset learner readiness scores, or remove user accounts.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {usersList.length} Accounts
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <div key={u.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${
                          u.is_admin ? 'bg-blue-50 text-blue-950 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 font-bold">{u.username}</strong>
                            {u.is_self && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                                You
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              u.is_admin 
                                ? 'bg-blue-50 text-blue-950 border-blue-200' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {u.is_admin ? 'Administrator' : 'Learner'}
                            </span>
                          </div>
                          <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                            {u.email} &middot; Readiness:{' '}
                            {u.is_admin ? (
                              <span className="text-slate-400 font-semibold">Exempt (Admin)</span>
                            ) : (
                              <strong className="text-blue-950 font-bold">{u.readiness_score}%</strong>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!u.is_admin && (
                          <button
                            onClick={() => handleResetReadiness(u)}
                            title="Reset readiness score to 0% and clear simulation attempts"
                            className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Score</span>
                          </button>
                        )}

                        {!u.is_self && (
                          <>
                            <button
                              onClick={() => handleToggleAdmin(u)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              {u.is_admin ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-blue-950" />}
                              <span>{u.is_admin ? 'Demote to Learner' : 'Promote to Admin'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. LEARNING MODULES */}
            {activeTab === 'modules' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Educational Content &amp; Modules
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {modulesList.length} Modules
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {modulesList.map((mod) => (
                    <div key={mod.id} className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Module {mod.module_number}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{mod.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => handleOpenModuleModal(mod)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-950" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {modulesList.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">No learning modules found.</div>
                  )}
                </div>
              </div>
            )}

            {/* 3. SIMULATED INBOX SCENARIOS */}
            {activeTab === 'scenarios' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Simulated Mailbox Scenarios
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure attack vectors, header markers, body templates, and forensic indicators.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {scenariosList.length} Scenarios
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {scenariosList.map((scen) => (
                    <div key={scen.id} className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Scenario #{scen.scenario_number}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            scen.is_phishing 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {scen.is_phishing ? 'Malicious (Phishing)' : 'Legitimate (Safe)'}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {scen.difficulty || 'medium'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{scen.subject}</h4>
                        <p className="text-xs text-slate-500">
                          <strong>From:</strong> {scen.sender_display_name || scen.sender_name} &lt;{scen.sender_email}&gt;
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                          <strong>Clues:</strong> {scen.detailed_explanation || scen.clues}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => handleOpenScenarioModal(scen)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-950" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteScenario(scen)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {scenariosList.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">No simulation scenarios found.</div>
                  )}
                </div>
              </div>
            )}

            {/* 4. INCIDENT RUNBOOKS */}
            {activeTab === 'runbooks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Incident Recovery Guides
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {runbooksList.length} Runbooks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {runbooksList.map((g) => (
                    <div key={g.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            g.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {g.severity}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{g.threat_category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{g.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{g.summary}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenRunbookModal(g)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-950" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRunbook(g)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. ASSESSMENT QUESTIONS */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Assessment Examination Question Bank
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {questionsList.length} Questions
                  </span>
                </div>

                <div className="space-y-3">
                  {questionsList.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-950">Question #{idx + 1}</span>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-950 px-2 py-0.5 rounded border border-blue-200">
                            Correct: Option {q.correct_option}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{q.question_text || q.question}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 pt-1">
                          <div><strong>A:</strong> {q.option_a || q.options?.A}</div>
                          <div><strong>B:</strong> {q.option_b || q.options?.B}</div>
                          <div><strong>C:</strong> {q.option_c || q.options?.C}</div>
                          <div><strong>D:</strong> {q.option_d || q.options?.D}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => handleOpenQuestionModal(q)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-950" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CONTACT DIRECTORY */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Support Directory Personnel
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {contactsList.length} Contacts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contactsList.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100/50 border border-blue-200 text-blue-950 font-black flex items-center justify-center text-xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                            <p className="text-[11px] text-blue-950 font-semibold">{c.role}</p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200/80">
                          <p><strong>Tel:</strong> {c.phone}</p>
                          <p className="truncate"><strong>Email:</strong> {c.email}</p>
                          <p className="truncate"><strong>Office:</strong> {c.office_location}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenContactModal(c)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-950" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteContact(c)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* =========================================================================
          UNIFIED CRUD MODAL
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingItem ? 'Edit' : 'Create'}{' '}
                {modalType === 'module' && 'Learning Module'}
                {modalType === 'runbook' && 'Incident Runbook'}
                {modalType === 'question' && 'Assessment Question'}
                {modalType === 'scenario' && 'Simulated Mailbox Scenario'}
                {modalType === 'contact' && 'Support Contact'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* MODULE FORM */}
              {modalType === 'module' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Module Number</label>
                      <input
                        type="number"
                        required
                        value={moduleForm.module_number}
                        onChange={(e) => setModuleForm({ ...moduleForm, module_number: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <input
                        type="text"
                        required
                        value={moduleForm.category}
                        onChange={(e) => setModuleForm({ ...moduleForm, category: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      required
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Video Embed URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/embed/..."
                      value={moduleForm.video_url}
                      onChange={(e) => setModuleForm({ ...moduleForm, video_url: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rich HTML Content</label>
                    <textarea
                      rows={4}
                      placeholder="<p>Module content goes here...</p>"
                      value={moduleForm.rich_content}
                      onChange={(e) => setModuleForm({ ...moduleForm, rich_content: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950 font-mono text-[10px]"
                    />
                  </div>
                </>
              )}

              {/* SCENARIO FORM */}
              {modalType === 'scenario' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Scenario Number</label>
                      <input
                        type="number"
                        required
                        value={scenarioForm.scenario_number}
                        onChange={(e) => setScenarioForm({ ...scenarioForm, scenario_number: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Verdict Classification</label>
                      <select
                        value={scenarioForm.is_phishing}
                        onChange={(e) => setScenarioForm({ ...scenarioForm, is_phishing: e.target.value === 'true' })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950 font-bold"
                      >
                        <option value="true">Malicious (Phishing)</option>
                        <option value="false">Legitimate (Safe)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                      <select
                        value={scenarioForm.difficulty}
                        onChange={(e) => setScenarioForm({ ...scenarioForm, difficulty: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Sender Display Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. University ICT Helpdesk"
                        value={scenarioForm.sender_name}
                        onChange={(e) => setScenarioForm({ ...scenarioForm, sender_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Sender Email Address</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. admin@lookalike-domain.com"
                        value={scenarioForm.sender_email}
                        onChange={(e) => setScenarioForm({ ...scenarioForm, sender_email: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject Line</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. URGENT: Mandatory Password Expiry"
                      value={scenarioForm.subject}
                      onChange={(e) => setScenarioForm({ ...scenarioForm, subject: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Forensic Indicators &amp; Clues</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Explain key indicators (deceptive domain, artificial urgency, etc.)..."
                      value={scenarioForm.clues}
                      onChange={(e) => setScenarioForm({ ...scenarioForm, clues: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Body Content (HTML)</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="<p>Dear Student...</p>"
                      value={scenarioForm.body_html}
                      onChange={(e) => setScenarioForm({ ...scenarioForm, body_html: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950 font-mono text-[10px]"
                    />
                  </div>
                </>
              )}

              {/* RUNBOOK FORM */}
              {modalType === 'runbook' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={runbookForm.title}
                      onChange={(e) => setRunbookForm({ ...runbookForm, title: e.target.value })}
                      placeholder="e.g., Compromised Student Portal Credentials"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <input
                        type="text"
                        required
                        value={runbookForm.threat_category}
                        onChange={(e) => setRunbookForm({ ...runbookForm, threat_category: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Severity</label>
                      <select
                        value={runbookForm.severity}
                        onChange={(e) => setRunbookForm({ ...runbookForm, severity: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Summary</label>
                    <textarea
                      rows={2}
                      required
                      value={runbookForm.summary}
                      onChange={(e) => setRunbookForm({ ...runbookForm, summary: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Immediate Steps (Numbered)</label>
                    <textarea
                      rows={3}
                      required
                      value={runbookForm.immediate_steps}
                      onChange={(e) => setRunbookForm({ ...runbookForm, immediate_steps: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Containment Checklist (Newline separated)</label>
                    <textarea
                      rows={3}
                      required
                      value={runbookForm.containment_checklist}
                      onChange={(e) => setRunbookForm({ ...runbookForm, containment_checklist: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>
                </>
              )}

              {/* QUESTION FORM */}
              {modalType === 'question' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Question Prompt</label>
                    <textarea
                      rows={2}
                      required
                      value={questionForm.question_text}
                      onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Option A</label>
                      <input
                        type="text"
                        required
                        value={questionForm.option_a}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Option B</label>
                      <input
                        type="text"
                        required
                        value={questionForm.option_b}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Option C</label>
                      <input
                        type="text"
                        required
                        value={questionForm.option_c}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Option D</label>
                      <input
                        type="text"
                        required
                        value={questionForm.option_d}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                      <select
                        value={questionForm.correct_option}
                        onChange={(e) => setQuestionForm({ ...questionForm, correct_option: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950 font-bold"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Explanation (Optional)</label>
                      <input
                        type="text"
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CONTACT FORM */}
              {modalType === 'contact' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g., Support Officer"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Role Title</label>
                    <input
                      type="text"
                      required
                      value={contactForm.role}
                      onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Telephone</label>
                      <input
                        type="text"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="+25421952909"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Office / Lab Location</label>
                    <input
                      type="text"
                      required
                      value={contactForm.office_location}
                      onChange={(e) => setContactForm({ ...contactForm, office_location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-950"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}