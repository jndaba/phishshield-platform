import React, { useState } from 'react';
import { Mail, AlertOctagon, CheckCircle, ShieldAlert, ChevronRight } from 'lucide-react';

const mockEmails = [
  {
    id: 1,
    senderName: "University IT Helpdesk",
    senderEmail: "support@admin-portal-verify.com",
    subject: "URGENT: Password Expiry Notice",
    date: "10:42 AM",
    isPhishing: true,
    difficulty: "Easy",
    body: `
      <p class="mb-3">Dear Student,</p>
      <p class="mb-3">Your student portal password will expire in <strong>24 hours</strong>. If you do not update your credentials immediately, you will lose access to course materials and exam registrations.</p>
      <div class="my-4">
        <a href="http://portal-auth0-update.xyz/login" target="_blank" rel="noreferrer" class="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition">
          Click Here to Retain Password
        </a>
      </div>
      <p class="text-xs text-slate-400">ICT Operations Support Center</p>
    `,
    explanation: "Notice the sender domain (@admin-portal-verify.com) differs from the official university domain. It also uses artificial urgency and an unverified external link."
  },
  {
    id: 2,
    senderName: "GitHub Notifications",
    senderEmail: "notifications@github.com",
    subject: "A personal access token has expired",
    date: "Yesterday",
    isPhishing: false,
    difficulty: "Easy",
    body: `
      <p class="mb-3">Hey there,</p>
      <p class="mb-3">Your personal access token <code>deploy_key_prod</code> expired on August 30.</p>
      <p class="mb-3">You can generate a new token or adjust token lifespan directly from your account settings.</p>
      <p class="text-xs text-slate-400">GitHub Security Team</p>
    `,
    explanation: "This is a legitimate notification from GitHub's official domain with no suspicious demands or deceptive link targets."
  }
];

export default function MailSandbox() {
  const [selectedEmail, setSelectedEmail] = useState(mockEmails[0]);
  const [feedback, setFeedback] = useState(null);

  const handleAction = (userAction) => {
    const isPhishing = selectedEmail.isPhishing;
    const isCorrect = (userAction === 'phish' && isPhishing) || (userAction === 'safe' && !isPhishing);

    setFeedback({
      isCorrect,
      explanation: selectedEmail.explanation
    });
  };

  const selectNewEmail = (email) => {
    setSelectedEmail(email);
    setFeedback(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Virtual Mail Sandbox</h2>
        <p className="text-xs text-slate-400">Inspect email headers, analyze content for social engineering cues, and decide whether each message is safe or phishing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 bg-[#1E293B] border border-slate-700/60 rounded-xl overflow-hidden min-h-[500px]">
        {/* Email Inbox Sidebar */}
        <div className="border-r border-slate-700/60 p-4 flex flex-col space-y-2 bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Simulated Inbox</span>
          {mockEmails.map((email) => (
            <button
              key={email.id}
              onClick={() => selectNewEmail(email)}
              className={`text-left p-3 rounded-lg border transition ${selectedEmail.id === email.id ? 'bg-slate-800 border-sky-400 text-white' : 'border-slate-800 text-slate-300 hover:bg-slate-800/50'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold truncate max-w-[130px]">{email.senderName}</span>
                <span className="text-[10px] text-slate-500">{email.date}</span>
              </div>
              <p className="text-xs font-medium text-slate-200 truncate">{email.subject}</p>
            </button>
          ))}
        </div>

        {/* Email Reading View */}
        <div className="md:col-span-2 p-6 flex flex-col justify-between bg-[#1E293B]">
          <div>
            <div className="border-b border-slate-700 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white mb-2">{selectedEmail.subject}</h3>
              <div className="text-xs text-slate-400 space-y-1">
                <p><span className="font-semibold text-slate-300">From:</span> {selectedEmail.senderName} &lt;{selectedEmail.senderEmail}&gt;</p>
                <p><span className="font-semibold text-slate-300">To:</span> me@target-org.ac.ke</p>
              </div>
            </div>

            <div 
              className="text-sm text-slate-200 leading-relaxed border border-slate-800/80 p-4 rounded-lg bg-slate-950/40 min-h-[180px]"
              dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
            />
          </div>

          {/* Action & Feedback Section */}
          <div className="mt-6 pt-4 border-t border-slate-700/60">
            {feedback ? (
              <div className={`p-4 rounded-xl border mb-4 ${feedback.isCorrect ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-red-950/20 border-red-500/40'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {feedback.isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertOctagon className="w-5 h-5 text-red-400" />}
                  <span className="font-bold text-sm text-white">
                    {feedback.isCorrect ? "Correct Identification!" : "Incorrect Decision"}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{feedback.explanation}</p>
              </div>
            ) : null}

            <div className="flex gap-4">
              <button
                onClick={() => handleAction('phish')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Report as Phishing
              </button>
              <button
                onClick={() => handleAction('safe')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Mark as Legitimate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}