import React, { useState, useEffect, useContext } from 'react';
import { ShieldAlert, AlertTriangle, FileWarning, Plus, Trash2, CheckCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function RecoveryGuide() {
  const { user } = useContext(AuthContext);
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State for Admin
  const [formData, setFormData] = useState({
    title: '',
    category: 'identity',
    severity: 'HIGH',
    steps: '',
    icon_name: 'ShieldAlert'
  });

  const fetchGuides = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/recovery/guides/');
      setGuides(res.data);
      if (res.data.length > 0 && !selectedGuide) {
        setSelectedGuide(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load recovery guides", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleCreateGuide = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/recovery/guides/', formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'identity',
        severity: 'HIGH',
        steps: '',
        icon_name: 'ShieldAlert'
      });
      fetchGuides();
    } catch (err) {
      alert("Failed to create recovery guide.");
    }
  };

  const handleDeleteGuide = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this recovery protocol?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/recovery/guides/${id}/`);
      fetchGuides();
      if (selectedGuide?.id === id) setSelectedGuide(null);
    } catch (err) {
      alert("Failed to delete protocol.");
    }
  };

  return (
    <div className="min-h-full bg-[#0B1120] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">
              Incident Response & Containment
            </span>
            <h1 className="text-3xl font-extrabold text-white">Emergency Recovery Protocols</h1>
            <p className="text-xs text-slate-400 mt-1">
              Immediate containment steps and mitigation runbooks for compromised accounts and devices.
            </p>
          </div>

          {user?.is_admin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Recovery Guide
            </button>
          )}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Guide Selector List */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Threat Scenarios ({guides.length})
            </span>
            <div className="space-y-2">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                    selectedGuide?.id === guide.id
                      ? 'bg-[#102A36] border-teal-500 shadow-md'
                      : 'bg-[#102A36]/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          guide.severity === 'CRITICAL'
                            ? 'bg-red-950/80 text-red-400 border border-red-800'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {guide.severity}
                      </span>
                      <span className="text-[10px] text-teal-400 uppercase font-semibold">{guide.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{guide.title}</h4>
                  </div>

                  {user?.is_admin && (
                    <button
                      onClick={(e) => handleDeleteGuide(guide.id, e)}
                      className="text-slate-400 hover:text-red-400 p-1 transition"
                      title="Delete Protocol"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Guide Viewer */}
          <div className="md:col-span-2">
            {selectedGuide ? (
              <div className="bg-[#102A36] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="border-b border-slate-700/80 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                      Protocol #{selectedGuide.id} · {selectedGuide.category}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[10px] font-bold text-red-400 uppercase">
                      Severity: {selectedGuide.severity}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedGuide.title}</h2>
                </div>

                {/* Steps Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400" /> Containment Steps
                  </h4>
                  <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 space-y-3">
                    {selectedGuide.steps.split('\n').map((step, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                        <span className="text-teal-400 font-bold shrink-0">{idx + 1}.</span>
                        <span>{step.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-teal-950/30 border border-teal-800/40 rounded-xl flex items-center justify-between text-xs text-slate-300">
                  <span>Need live guidance with this containment step?</span>
                  <a
                    href="/chat"
                    className="text-teal-400 hover:text-teal-300 font-bold inline-flex items-center gap-1"
                  >
                    Open Incident Chat <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-[#102A36] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                Select a threat protocol from the list to review containment steps.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Add Protocol Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#102A36] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white">Add Incident Recovery Protocol</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGuide} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scenario Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compromised Student Portal Credentials"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="identity">Identity & Access</option>
                    <option value="financial">Financial & Mobile</option>
                    <option value="malware">Malware / Endpoint</option>
                    <option value="cloud">Cloud Accounts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Sequential Steps (Enter each step on a new line)
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="1. Disconnect device from internet.\n2. Revoke cloud sessions.\n3. Change passwords."
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition"
                >
                  Save Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}