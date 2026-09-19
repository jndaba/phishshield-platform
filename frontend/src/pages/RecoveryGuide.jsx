import React, { useState, useEffect, useContext } from 'react';
import { 
  LifeBuoy, 
  ShieldAlert, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  User, 
  X, 
  Save, 
  ArrowRight,
  BookmarkCheck
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function RecoveryGuide() {
  const { user } = useContext(AuthContext);
  const isAdmin = Boolean(user?.is_admin || user?.is_staff);

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [expandedGuideId, setExpandedGuideId] = useState(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    threat_category: 'Credential Phishing',
    severity: 'HIGH',
    summary: '',
    immediate_steps: '',
    containment_checklist: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Fetch Guides
  const fetchGuides = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/lms/incident-guides/')
      .then((res) => {
        setGuides(res.data || []);
        if (res.data?.length > 0 && !expandedGuideId) {
          setExpandedGuideId(res.data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load incident guides', err);
        setNotification({ type: 'error', message: 'Could not fetch incident guides from server.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingGuide(null);
    setFormData({
      title: '',
      threat_category: 'Credential Phishing',
      severity: 'HIGH',
      summary: '',
      immediate_steps: '',
      containment_checklist: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (guide) => {
    setEditingGuide(guide);
    setFormData({
      title: guide.title,
      threat_category: guide.threat_category,
      severity: guide.severity,
      summary: guide.summary,
      immediate_steps: guide.immediate_steps,
      containment_checklist: guide.containment_checklist || '',
    });
    setIsModalOpen(true);
  };

  // Save Guide (Create or Edit)
  const handleSubmitGuide = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setNotification({ type: '', message: '' });

    try {
      if (editingGuide) {
        await axios.put(`http://127.0.0.1:8000/api/lms/incident-guides/${editingGuide.id}/`, formData);
        setNotification({ type: 'success', message: 'Incident guide updated successfully.' });
      } else {
        await axios.post('http://127.0.0.1:8000/api/lms/incident-guides/', formData);
        setNotification({ type: 'success', message: 'New incident guide published successfully.' });
      }
      setIsModalOpen(false);
      fetchGuides();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit incident guide.'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Guide
  const handleDeleteGuide = async (guideId, title) => {
    if (!window.confirm(`Are you sure you want to delete the guide: "${title}"?`)) {
      return;
    }
    try {
      await axios.delete(`http://127.0.0.1:8000/api/lms/incident-guides/${guideId}/`);
      setNotification({ type: 'success', message: `Guide "${title}" removed successfully.` });
      fetchGuides();
    } catch (err) {
      setNotification({ type: 'error', message: 'Could not delete incident guide.' });
    }
  };

  // Filtered List
  const filteredGuides = guides.filter((g) => {
    const matchesSearch = 
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.threat_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'ALL' || g.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shadow-sm">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Incident Response &amp; Containment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Security Incident Recovery Guides
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Step-by-step actionable containment runbooks to handle phishing exposures, compromised credentials, malware execution, and unauthorized access.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Incident Guide</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {notification.message && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Severity Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guides by title, category, or symptoms..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sev === 'ALL' ? 'All Priority' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Guides List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-500 font-mono">
          Loading active incident recovery guides...
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No Incident Guides Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your keyword search or active severity filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGuides.map((guide) => {
            const isExpanded = expandedGuideId === guide.id;
            const stepsList = (guide.immediate_steps || '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean);

            const checklistItems = (guide.containment_checklist || '')
              .split('\n')
              .map((c) => c.trim())
              .filter(Boolean);

            return (
              <div 
                key={guide.id}
                className={`bg-white border rounded-2xl transition shadow-sm overflow-hidden ${
                  isExpanded ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Collapsible Card Header */}
                <div 
                  onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/70 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getSeverityBadge(guide.severity)}`}>
                        {guide.severity}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        {guide.threat_category}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {guide.title}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {guide.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 mr-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditModal(guide)}
                          title="Edit Incident Guide"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGuide(guide.id, guide.title)}
                          title="Delete Guide"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Expanded Body */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-6">
                    {/* Action Steps */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                        Immediate Action Protocol (First 15 Minutes)
                      </h3>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                        {stepsList.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step.replace(/^\d+\.\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Containment Checklist */}
                    {checklistItems.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Containment &amp; Verification Checklist
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {checklistItems.map((item, idx) => (
                            <label 
                              key={idx} 
                              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 hover:border-slate-300 transition cursor-pointer"
                            >
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" 
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center gap-3">
                        {guide.author_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Authored by Admin: <strong className="text-slate-600">{guide.author_name}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last updated: {new Date(guide.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                        PhishShield Official Runbook
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add or Edit Incident Guide (Admins Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingGuide ? 'Edit Incident Recovery Guide' : 'Publish New Incident Guide'}
                </h3>
                <p className="text-xs text-slate-500">
                  Provide actionable response instructions for learners and responders.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitGuide} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guide Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Compromised Corporate & Portal Credentials"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Threat Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.threat_category}
                    onChange={(e) => setFormData({ ...formData, threat_category: e.target.value })}
                    placeholder="e.g., Credential Phishing, Malware, Fraud"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severity Priority
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Summary &amp; Symptoms
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief description of the threat scenario and observed indicators..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Immediate Action Protocol (One step per line)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.immediate_steps}
                  onChange={(e) => setFormData({ ...formData, immediate_steps: e.target.value })}
                  placeholder="1. Disconnect device from Wi-Fi immediately.&#10;2. Change master account password.&#10;3. Invalidate active sessions."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Containment Checklist (One check item per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.containment_checklist}
                  onChange={(e) => setFormData({ ...formData, containment_checklist: e.target.value })}
                  placeholder="Password changed to 14+ characters&#10;MFA tokens refreshed&#10;Incident ticket logged"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{formSubmitting ? 'Saving...' : editingGuide ? 'Update Guide' : 'Publish Guide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}