import React, { useContext, useState, useEffect } from 'react';
import { Award, Download, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Certificates() {
  const { user } = useContext(AuthContext);
  const [candidateName, setCandidateName] = useState(user?.username || '');
  const [stats, setStats] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const [statsRes, quizRes] = await Promise.all([
          axios.get('/api/auth/user-stats/'),
          axios.get('/api/simulation/quiz/questions/'),
        ]);
        setStats(statsRes.data?.stats || null);
        if (quizRes.data && !Array.isArray(quizRes.data) && quizRes.data.is_certified) {
          setQuizStatus(quizRes.data);
        }
      } catch (err) {
        console.error('Failed to load certificate eligibility', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEligibility();
  }, []);

  const passedAssessment = Boolean(quizStatus?.is_certified || stats?.is_certified);
  const modulesComplete =
    (stats?.total_modules ?? 0) > 0 &&
    (stats?.completed_modules ?? 0) >= (stats?.total_modules ?? 0);
  const isEligible = passedAssessment;

  const handleDownload = async () => {
    if (!isEligible) {
      alert('Please pass the Cybersecurity Certification Assessment (70% or higher) to unlock your PDF certificate.');
      return;
    }

    setDownloading(true);
    try {
      const name = candidateName.trim() || user?.username || 'Student Learner';
      const response = await axios.get(
        `/api/simulation/certificate/download/?name=${encodeURIComponent(name)}`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `PhishShield_Certificate_${name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Certificate download failed:', err);
      alert(err.response?.data?.error || 'Unable to download PDF certificate.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold text-sm">Verifying credential eligibility...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Certificate &amp; Credential Registry</h2>
        <p className="text-xs text-slate-500 mt-1">
          Official verified credentials awarded by <strong>Icons Computer School and Cyber</strong> upon passing the certification assessment.
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isEligible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            {isEligible ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Lock className="w-3.5 h-3.5 shrink-0" />}
            <span>
              {isEligible
                ? `Credential Status: Unlocked${quizStatus?.percentage ? ` (Exam Score: ${quizStatus.percentage}%)` : ''}`
                : `Requirement: Pass Certification Assessment (Modules: ${stats?.completed_modules ?? 0}/${stats?.total_modules ?? 20})`}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Certificate of Proficiency in Cybersecurity &amp; Phishing Defense
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Issued by <strong>Icons Computer School and Cyber</strong>. Validates threat heuristic analysis, email spoof identification, and incident containment capabilities.
          </p>

          {!modulesComplete && (
            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              Curriculum progress: <strong>{stats?.completed_modules ?? 0} / {stats?.total_modules ?? 20}</strong> modules completed.
            </p>
          )}

          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Name on Official Certificate:</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter full name"
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs w-full max-w-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleDownload}
              disabled={!isEligible || downloading}
              className={`font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm ${
                isEligible
                  ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isEligible ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {downloading ? 'Generating PDF...' : 'Download Official PDF Certificate'}
            </button>

            {!isEligible && (
              <Link
                to="/assessment"
                className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5"
              >
                <span>Take Certification Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Visual Certificate Card */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isEligible ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-400'}`}>
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Icons Certified</h4>
            <p className="text-[10px] text-slate-400">Icons Computer School &amp; Cyber</p>
          </div>
        </div>
      </div>
    </div>
  );
}