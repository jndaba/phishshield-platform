import React, { useState, useEffect, useContext } from 'react';
import { Mail, AlertOctagon, CheckCircle, ShieldAlert, Plus, Trash2, ShieldCheck, Clock } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function MailSandbox() {
  const { user } = useContext(AuthContext);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin Modal state for creating mockups
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    difficulty: 'medium',
    is_phishing: true,
    body_html: '',
    clues: ''
  });

  const fetchEmails = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/simulation/emails/');
      setEmails(res.data);
      if (res.data.length > 0 && !selectedEmail) {
        setSelectedEmail(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load simulation emails", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleAction = async (actionType) => {
    if (!selectedEmail) return;

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/simulation/emails/${selectedEmail.id}/attempt/`, {
        action: actionType,
        time_taken: 15
      });
      setFeedback({
        isCorrect: res.data.is_correct,
        explanation: res.data.explanation
      });
    } catch (err) {
      // Offline/Local evaluation fallback
      const isCorrect = (actionType === 'phish' && selectedEmail.is_phishing) || (actionType === 'safe' && !selectedEmail.is_phishing);
      setFeedback({
        isCorrect,
        explanation: selectedEmail.clues
      });
    }
  };

  const handleCreateEmail = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/simulation/emails/', formData);
      setShowCreateModal(false);
      setFormData({
        sender_name: '',
        sender_email: '',
        subject: '',
        difficulty: 'medium',
        is_phishing: true,
        body_html: '',
        clues: ''
      });
      fetchEmails();
    } catch (err) {
      alert("Failed to create email mockup");
    }
  };

  const handleDeleteEmail = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this scenario?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/simulation/emails/${id}/`);
      fetchEmails();
      if (selectedEmail?.id === id) setSelectedEmail(null);
    } catch (err) {
      alert("Failed to delete email template");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Virtual Mail Sandbox</h2>
          <p className="text-xs text-slate-500">Inspect email headers, analyze social engineering signals, and flag threats safely[cite: 1].</p>
        </div>
        {user?.is_admin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Email Mockup
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm min-h-[550px]">
        {/* Inbox Sidebar */}
        <div className="border-r border-slate-200/80 flex flex-col bg-slate-50/60">
          <div className="p-3 border-b border-slate-200/80 flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
            <span>Simulated Inbox ({emails.length})</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => { setSelectedEmail(email); setFeedback(null); }}
                className={`p-3.5 cursor-pointer transition flex items-start justify-between ${selectedEmail?.id === email.id ? 'bg-teal-50/80 border-l-4 border-teal-600' : 'hover:bg-slate-100/70'}`}
              >
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">{email.sender_name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${email.difficulty === 'hard' ? 'bg-red-100 text-red-700' : email.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {email.difficulty}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 truncate">{email.subject}</p>
                </div>
                {user?.is_admin && (
                  <button
                    onClick={(e) => handleDeleteEmail(email.id, e)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Delete Scenario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email Reading Frame */}
        <div className="md:col-span-2 p-6 flex flex-col justify-between bg-white">
          {selectedEmail ? (
            <div>
              <div className="border-b border-slate-200/80 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{selectedEmail.subject}</h3>
                <div className="text-xs text-slate-500 space-y-1">
                  <p><span className="font-semibold text-slate-700">From:</span> {selectedEmail.sender_name} &lt;<span className="text-teal-700 font-medium">{selectedEmail.sender_email}</span>&gt;</p>
                  <p><span className="font-semibold text-slate-700">To:</span> security-trainee@phishshield.internal</p>
                </div>
              </div>

              <div
                className="text-xs text-slate-700 leading-relaxed border border-slate-100 p-5 rounded-xl bg-slate-50/40 min-h-[220px]"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Select an email from the inbox to begin analysis.
            </div>
          )}

          {/* Feedback & Actions */}
          {selectedEmail && (
            <div className="mt-6 pt-4 border-t border-slate-200/80">
              {feedback && (
                <div className={`p-4 rounded-xl border mb-4 ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {feedback.isCorrect ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertOctagon className="w-4 h-4 text-red-600" />}
                    <span className={`font-bold text-xs ${feedback.isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                      {feedback.isCorrect ? "Accurate Threat Call!" : "Vulnerability Triggered"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{feedback.explanation}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => handleAction('phish')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4" /> Report as Phishing Attack
                </button>
                <button
                  onClick={() => handleAction('safe')}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" /> Mark as Legitimate Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Scenario Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">Create New Email Mockup Scenario</h3>
            <form onSubmit={handleCreateEmail} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sender Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PayPal Security"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sender Email</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. alert@paypal-verify.net"
                    value={formData.sender_email}
                    onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Account suspended due to unusual login"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-teal-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Scenario Nature</label>
                  <select
                    value={formData.is_phishing}
                    onChange={(e) => setFormData({ ...formData, is_phishing: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-teal-500"
                  >
                    <option value="true">Phishing / Malicious</option>
                    <option value="false">Safe / Legitimate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email HTML Body</label>
                <textarea
                  rows="3"
                  required
                  placeholder="<p>Dear user, please click the link to confirm.</p>"
                  value={formData.body_html}
                  onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-teal-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clues & Learning Feedback</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Explanation of the red flags in this simulation..."
                  value={formData.clues}
                  onChange={(e) => setFormData({ ...formData, clues: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg"
                >
                  Save Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}