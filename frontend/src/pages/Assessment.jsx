import React, { useState, useEffect, useContext } from 'react';
import { Award, Download, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Assessment() {
  const { user, setUser } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [userName, setUserName] = useState(user?.username || '');
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/simulation/quiz/questions/')
      .then(res => {
        const data = res.data;
        if (data && !Array.isArray(data) && data.is_certified) {
          setResult({
            is_certified: true,
            passed: true,
            score: data.score,
            total: data.total,
            percentage: data.percentage,
          });
          setQuestions([]);
        } else {
          setQuestions(Array.isArray(data) ? data : []);
        }
      })
      .catch(err => console.error('Error loading quiz questions', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (questionId, optionKey) => {
    setAnswers({ ...answers, [questionId]: optionKey });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting your assessment.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/simulation/quiz/submit/', { answers });
      setResult(response.data);
      if (setUser && response.data?.readiness_score !== undefined) {
        setUser(prev => {
          if (!prev) return prev;
          const updated = { ...prev, readiness_score: response.data.readiness_score };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      if (err.response?.data?.is_certified) {
        setResult(err.response.data);
      } else {
        console.error(err);
        alert(err.response?.data?.error || 'Error submitting assessment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCert = async () => {
    setDownloading(true);
    try {
      const name = userName.trim() || user?.username || 'Student Learner';
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
      console.error('Certificate download error:', err);
      alert('Unable to download PDF certificate. Please ensure you have passed the assessment.');
    } finally {
      setDownloading(false);
    }
  };

  const parseOptions = (optionsData) => {
    if (!optionsData) return {};
    if (typeof optionsData === 'object') return optionsData;
    try {
      return JSON.parse(optionsData);
    } catch (e) {
      return {};
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold text-sm">Loading assessment status...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Cybersecurity Certification Assessment</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Pass with 70% or higher to earn an official verified certificate of training completion.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => {
            const parsedOptions = parseOptions(q.options);
            
            return (
              <div key={q.id} className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-xs">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-4 flex items-start gap-2">
                  <span className="text-blue-950 font-black">Q{idx + 1}.</span>
                  <span>{q.question}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(parsedOptions).map(([key, val]) => {
                    const isSelected = answers[q.id] === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => handleSelect(q.id, key)}
                        className={`text-left p-3 rounded-xl border text-xs transition flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-950 text-blue-950 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 transition-colors ${
                          isSelected ? 'bg-blue-950 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {key}
                        </span>
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitting || questions.length === 0}
            className="w-full py-3.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" /> {submitting ? 'Evaluating...' : 'Submit Assessment for Grading'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <div className={`p-6 sm:p-8 rounded-2xl border text-center shadow-sm ${result.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            {result.passed && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4">
                <CheckCircle2 className="w-4 h-4" /> Assessment Completed &amp; Certified
              </div>
            )}
            <Award className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`} />
            <h3 className={`text-2xl sm:text-3xl font-black mb-2 ${result.passed ? 'text-emerald-900' : 'text-rose-900'}`}>
              {result.passed ? 'Assessment Completed — Certified!' : 'Assessment Threshold Not Met'}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mb-6">
              Recorded Score: <span className="font-bold text-slate-900">{result.score} / {result.total}</span> ({result.percentage}%)
            </p>

            {result.passed ? (
              <div className="max-w-md mx-auto bg-white border border-slate-200 p-5 sm:p-6 rounded-xl mt-4 shadow-xs text-left">
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  You have already passed this examination. Assessment questions are locked to preserve credential integrity. Download your official certificate below:
                </p>
                <label className="block text-xs font-bold text-slate-700 mb-2">Full name to display on certificate:</label>
                <input
                  type="text"
                  placeholder="e.g. Ndaba Joel Osteen"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-950 mb-4 font-semibold"
                />
                <button
                  onClick={handleDownloadCert}
                  disabled={downloading}
                  className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? 'Generating PDF Certificate...' : 'Download Official PDF Certificate'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setResult(null); setAnswers({}); }}
                className="mt-2 px-8 py-3 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-2 shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retake Assessment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}