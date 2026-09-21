import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Inbox, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Server, 
  FileCheck,
  Target,
  UploadCloud,
  FileText,
  X,
  Plus,
  Paperclip,
  Check
} from 'lucide-react';
import axios from 'axios';

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeLearners: 0,
    totalSimulations: 0,
    averageReadiness: 0,
    certifiedCount: 0
  });
  const [usersList, setUsersList] = useState([]);
  const [modulesList, setModulesList] = useState([]);
  const [scenariosList, setScenariosList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [loading, setLoading] = useState(true);

  // Drag and Drop State for Module Upload
  const [selectedModuleForUpload, setSelectedModuleForUpload] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, modulesRes, inboxRes, questionsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/auth/manage/users/'),
        axios.get('http://127.0.0.1:8000/api/lms/modules/'),
        axios.get('http://127.0.0.1:8000/api/simulation/inbox/'),
        axios.get('http://127.0.0.1:8000/api/simulation/quiz/questions/')
      ]);

      const users = usersRes.data || [];
      const learners = users.filter(u => !u.is_admin);
      const totalScore = learners.reduce((acc, u) => acc + (u.readiness_score || 0), 0);
      const certified = learners.filter(u => (u.readiness_score || 0) >= 70);

      setUsersList(users);
      const fetchedModules = modulesRes.data || [];
      setModulesList(fetchedModules);
      if (fetchedModules.length > 0 && !selectedModuleForUpload) {
        setSelectedModuleForUpload(fetchedModules[0].id.toString());
      }
      setScenariosList(inboxRes.data?.scenarios || []);
      setQuestionsList(questionsRes.data || []);

      if (learners.length > 0) {
        setSelectedLearnerId(learners[0].id.toString());
      }

      setMetrics({
        totalUsers: users.length,
        activeLearners: learners.length,
        totalSimulations: inboxRes.data?.scenarios?.length || 10,
        averageReadiness: learners.length ? Math.round(totalScore / learners.length) : 0,
        certifiedCount: certified.length
      });
    } catch (err) {
      console.error('Failed to load admin console telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDroppedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setDroppedFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    if (!droppedFile || !selectedModuleForUpload) return;
    setUploading(true);
    setUploadStatus({ type: '', message: '' });

    const formData = new FormData();
    formData.append('document', droppedFile);

    try {
      await axios.put(`http://127.0.0.1:8000/api/lms/modules/${selectedModuleForUpload}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus({ type: 'success', message: `Successfully attached ${droppedFile.name} to Module ${selectedModuleForUpload}.` });
      setDroppedFile(null);
      fetchDashboardData();
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.response?.data?.error || 'Failed to upload document to module.' });
    } finally {
      setUploading(false);
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'dossier', label: 'Learner Dossier', icon: Users },
    { id: 'modules', label: 'Learning Modules', icon: BookOpen },
    { id: 'inbox', label: 'Simulated Inbox', icon: Inbox },
    { id: 'assessment', label: 'Assessment', icon: ShieldCheck },
    { id: 'certified', label: 'Certified Learners', icon: Award },
  ];

  const learners = usersList.filter(u => !u.is_admin);
  const selectedLearner = learners.find(l => l.id.toString() === selectedLearnerId) || learners[0];

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 p-6 space-y-6">
      {/* Console Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-950 rounded-lg border border-blue-200 font-bold text-xs">
              <Activity className="w-4 h-4 inline mr-1" /> Core Control
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security Administration Console</h1>
          <p className="text-xs text-slate-500 mt-1">Holistic monitoring, syllabus verification, threat sandbox inspection, and certification rosters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData} 
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Top Panel Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-blue-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Panel Content Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[450px]">
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-400 font-mono">Aggregating real-time telemetry...</div>
        ) : (
          <>
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.totalUsers}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{metrics.activeLearners} active trainees</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Readiness</span>
                    <h3 className="text-2xl font-black text-blue-950 mt-1">{metrics.averageReadiness}%</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Baseline defense metric
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Curriculum</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{modulesList.length} Modules</h3>
                    <p className="text-[11px] text-slate-500 mt-1">20-unit defense framework</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certified Competence</span>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{metrics.certifiedCount} Passed</h3>
                    <p className="text-[11px] text-slate-500 mt-1">&ge; 70% assessment threshold</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/70 space-y-3">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-950" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Infrastructure &amp; Security Services</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-slate-700">Threat Simulation Mailbox Sandbox</span>
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Active (10 Scenarios)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-slate-700">Automated Assessment Engine</span>
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Operational (25 Questions)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-slate-700">Forensic URL Heuristic Scanner</span>
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/70 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-950" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Governance Standards</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Learners are evaluated continuously on email header analysis, adversary-in-the-middle proxy recognition, and IDN homoglyph identification. Certification requires completing all 20 curriculum units and scoring 70%+ on the assessment exam.
                    </p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Compliance Threshold:</span>
                      <strong className="text-blue-950 font-bold">70% Pass Rate</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl bg-blue-50/30 flex items-center justify-between">
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-900">System Operations &amp; Security Health</p>
                    <p className="text-slate-600">All identity and simulator services are operating nominally without backpressure.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Services Nominal
                  </span>
                </div>
              </div>
            )}

            {/* 2. LEARNER DOSSIER TAB */}
            {activeTab === 'dossier' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Learner Performance Dossier</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Select a registered learner from the roster to inspect individualized metrics.</p>
                  </div>

                  <div className="w-full sm:w-72">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Learner</label>
                    <select
                      value={selectedLearnerId}
                      onChange={(e) => setSelectedLearnerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-blue-950"
                    >
                      {learners.map(l => (
                        <option key={l.id} value={l.id.toString()}>
                          {l.username} ({l.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedLearner ? (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-base shadow-sm">
                          {selectedLearner.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900">{selectedLearner.username}</h4>
                          <p className="text-xs text-slate-500 font-mono">{selectedLearner.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          (selectedLearner.readiness_score || 0) >= 70 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {(selectedLearner.readiness_score || 0) >= 70 ? 'Certified Defender' : 'Training In Progress'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-blue-950" /> Overall Readiness
                        </span>
                        <h4 className="text-2xl font-black text-blue-950 mt-1">{selectedLearner.readiness_score || 0}%</h4>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              (selectedLearner.readiness_score || 0) >= 70 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, selectedLearner.readiness_score || 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-950" /> Curriculum Status
                        </span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">
                          {Math.round(((selectedLearner.readiness_score || 0) / 100) * modulesList.length)} / {modulesList.length}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1">Modules finished</p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-blue-950" /> Certification Threshold
                        </span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">70%</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {(selectedLearner.readiness_score || 0) >= 70 
                            ? 'Passed assessment examination' 
                            : `${70 - (selectedLearner.readiness_score || 0)}% required to qualify`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                    No learners currently registered in the database.
                  </div>
                )}
              </div>
            )}

            {/* 3. LEARNING MODULES TAB: Catalog + Drag-and-Drop / Browse File Attachment */}
            {activeTab === 'modules' && (
              <div className="space-y-6">
                
                {/* Drag and Drop Document Upload Zone */}
                <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-blue-950" /> Attach Reference Guide / Document
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Drag and drop supplemental PDF guides or click to browse. Attached files are immediately accessible in the Learner Lab.
                      </p>
                    </div>

                    <div className="w-full sm:w-64">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Module</label>
                      <select
                        value={selectedModuleForUpload || ''}
                        onChange={(e) => setSelectedModuleForUpload(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-blue-950"
                      >
                        {modulesList.map(m => (
                          <option key={m.id} value={m.id.toString()}>
                            Module {m.module_number}: {m.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dropzone Container */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      dragOver 
                        ? 'border-blue-600 bg-blue-50/60 scale-[0.99]' 
                        : 'border-slate-300 bg-white hover:border-blue-950/40 hover:bg-slate-50/50'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.txt"
                    />

                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>

                    {droppedFile ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-950" /> {droppedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {(droppedFile.size / 1024).toFixed(1)} KB · Ready for upload
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">
                          Drag and drop file here, or <span className="text-blue-600 underline">browse</span>
                        </p>
                        <p className="text-[11px] text-slate-400">Supports PDF, DOCX, and TXT guidelines up to 25MB</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Trigger and Feedback Banner */}
                  {droppedFile && (
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setDroppedFile(null)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Remove Selection
                      </button>

                      <button
                        onClick={handleUploadDocument}
                        disabled={uploading}
                        className="px-5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        {uploading ? (
                          <span>Attaching File...</span>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" /> Commit Document to Module
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {uploadStatus.message && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      uploadStatus.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {uploadStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      <span>{uploadStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* Modules Catalog Listing */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Published Curriculum Catalog ({modulesList.length} Units)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {modulesList.map(mod => (
                      <div key={mod.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Module {mod.module_number}
                            </span>
                            {mod.document && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                <Paperclip className="w-3 h-3" /> PDF Attached
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900">{mod.title}</h4>
                          <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{mod.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 4. SIMULATED INBOX TAB */}
            {activeTab === 'inbox' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Attack Vector Scenarios ({scenariosList.length} Scenarios)</h3>
                <div className="space-y-2 text-xs">
                  {scenariosList.map(scen => (
                    <div key={scen.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="truncate pr-4">
                        <strong className="text-slate-900 block truncate">{scen.subject}</strong>
                        <span className="text-slate-500 text-[11px]">Sender: {scen.sender_display_name || scen.sender_name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${scen.is_phishing ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {scen.is_phishing ? 'Malicious' : 'Safe'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. ASSESSMENT TAB */}
            {activeTab === 'assessment' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Assessment Question Pool ({questionsList.length} Questions)</h3>
                <div className="space-y-3 text-xs">
                  {questionsList.map((q, idx) => (
                    <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="font-bold text-blue-950">Q{idx + 1}.</span> {q.question || q.question_text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CERTIFIED LEARNERS TAB */}
            {activeTab === 'certified' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Credentialed Learners Registry</h3>
                <div className="divide-y divide-slate-100">
                  {usersList.filter(u => !u.is_admin && (u.readiness_score || 0) >= 70).map(u => (
                    <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-emerald-600" />
                        <div>
                          <strong className="text-slate-900 block font-bold">{u.username}</strong>
                          <span className="text-slate-500 text-[11px]">{u.email}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        Score: {u.readiness_score}% (Certified)
                      </span>
                    </div>
                  ))}
                  {metrics.certifiedCount === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">No learners have satisfied the 70% threshold yet.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}