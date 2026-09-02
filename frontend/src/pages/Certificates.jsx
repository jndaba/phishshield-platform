import React, { useContext, useState, useEffect } from 'react';
import { Award, Download, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Certificates() {
  const { user } = useContext(AuthContext);
  const [candidateName, setCandidateName] = useState(user?.username || '');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/auth/user-stats/');
        setStats(res.data.stats);
      } catch (err) {
        console.error("Failed to load certificate eligibility", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const isEligible = stats?.completed_modules >= stats?.total_modules && (stats?.total_modules > 0);

  const handleDownload = () => {
    if (!isEligible) {
      alert(`Certificate locked. You have completed ${stats?.completed_modules || 0}/${stats?.total_modules || 14} modules.`);
      return;
    }
    window.open(
      `http://127.0.0.1:8000/api/simulation/certificate/download/?name=${encodeURIComponent(candidateName)}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Certificate & Credential Registry</h2>
        <p className="text-xs text-slate-500 mt-1">
          Official verified credentials awarded by <strong>Icons Computer School and Cyber</strong> upon 100% module completion.
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isEligible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            {isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isEligible ? 'Credential Status: Complete & Unlocked' : `Requirement: Complete all modules (${stats?.completed_modules || 0}/${stats?.total_modules || 14})`}
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Certificate of Proficiency in Cybersecurity & Phishing Defense
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Issued by <strong>Icons Computer School and Cyber</strong>. Validates threat heuristic analysis, email spoof identification, and incident containment capabilities.
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
            disabled={!isEligible}
            className={`font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm ${
              isEligible ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isEligible ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />} Download Official PDF Certificate
          </button>
        </div>

        {/* Visual Certificate Card */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isEligible ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-400'}`}>
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Icons Certified</h4>
            <p className="text-[10px] text-slate-400">Icons Computer School & Cyber</p>
          </div>
        </div>
      </div>
    </div>
  );
}