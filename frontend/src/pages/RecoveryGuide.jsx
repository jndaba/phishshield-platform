import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Smartphone, CheckSquare, ExternalLink } from 'lucide-react';

export default function RecoveryGuide() {
  const [activePlatform, setActivePlatform] = useState('google');

  const recoverySteps = {
    google: [
      { step: 1, title: "Isolate & Terminate Active Sessions", desc: "Navigate to your Google Security dashboard and revoke access from any unfamiliar devices.", actionUrl: "https://myaccount.google.com/device-activity" },
      { step: 2, title: "Reset Primary Passwords", desc: "Create a unique, 16+ character password that is not shared with any other platform." },
      { step: 3, title: "Audit Two-Factor Authentication (2FA)", desc: "Ensure your phone number and authenticator app backup codes haven't been altered." },
      { step: 4, title: "Review Connected Apps & Mail Forwarding", desc: "Check Gmail settings to make sure no unauthorized forwarding filters were silently injected by attackers." }
    ],
    bank: [
      { step: 1, title: "Immediately Freeze Mobile Money & Cards", desc: "Contact customer support or use USSD shortcodes immediately to freeze transactions." },
      { step: 2, title: "Report Unauthorized Activity", desc: "Document the fraudulent transaction IDs, sender details, and timestamps for dispute investigations." },
      { step: 3, title: "Reset Banking Application PINs", desc: "Do not use common numbers such as your year of birth or predictable digit sequences." }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white mb-2">Account Compromise Incident Recovery</h2>
        <p className="text-slate-400 text-sm">Visual step-by-step procedures to regain control of compromised accounts and prevent data leaks.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-700/60 pb-3">
        <button
          onClick={() => setActivePlatform('google')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activePlatform === 'google' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          Google & Email
        </button>
        <button
          onClick={() => setActivePlatform('bank')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activePlatform === 'bank' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
        >
          Mobile Money & Banking
        </button>
      </div>

      <div className="space-y-4">
        {recoverySteps[activePlatform].map((step, idx) => (
          <div key={idx} className="bg-[#1E293B] border border-slate-700 p-5 rounded-xl flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
              {step.step}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-slate-400 mb-2">{step.desc}</p>
              {step.actionUrl && (
                <a
                  href={step.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline font-medium"
                >
                  Direct Recovery Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}