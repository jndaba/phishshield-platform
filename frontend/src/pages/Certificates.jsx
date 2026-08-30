import React, { useContext, useState } from 'react';
import { Award, Download, ShieldCheck, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Certificates() {
  const { user } = useContext(AuthContext);
  const [candidateName, setCandidateName] = useState(user?.username || 'Ndaba Joel Osteen');

  const handleDownload = () => {
    window.open(
      `http://127.0.0.1:8000/api/simulation/certificate/download/?name=${encodeURIComponent(candidateName)}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Certificate & Credential Registry</h2>
        <p className="text-xs text-slate-500 mt-1">Official verified credentials awarded upon passing the comprehensive capstone evaluation.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Credential Status: Active & Verified
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Certificate of Competence in Cybersecurity Awareness & Phishing Defense
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Issued by Dedan Kimathi University of Technology IT Capstone. Validates threat heuristic analysis, social engineering identification, and incident containment capabilities.
          </p>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Name on Official Certificate:</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs w-full max-w-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            onClick={handleDownload}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Official PDF Certificate
          </button>
        </div>

        {/* Visual Certificate Preview Card */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">PhishShield Certified</h4>
            <p className="text-[10px] text-slate-400">ID: PS-SEC-2026-DKUT</p>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2 w-full">
            Passing Grade: <span className="font-bold text-emerald-600">$\ge 75\%$ Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}