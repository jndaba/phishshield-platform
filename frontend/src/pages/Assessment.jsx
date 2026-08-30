import React, { useState, useEffect } from 'react';
import { HelpCircle, Award, CheckCircle, XCircle, Download, RotateCcw, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/simulation/quiz/questions/')
      .then(res => setQuestions(res.data))
      .catch(err => console.error("Error loading quiz questions", err));
  }, []);

  const handleSelect = (questionId, optionKey) => {
    setAnswers({ ...answers, [questionId]: optionKey });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting your assessment.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/simulation/quiz/submit/', { answers });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Error submitting assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCert = () => {
    const name = userName.trim() || "Student Learner";
    window.open(`http://127.0.0.1:8000/api/simulation/certificate/download/?name=${encodeURIComponent(name)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8 border-b border-slate-700/60 pb-4">
        <h2 className="text-3xl font-extrabold text-white mb-1">Cybersecurity Certification Assessment</h2>
        <p className="text-slate-400 text-sm">Pass with 75% or higher to earn an official verified certificate of training completion.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-[#1E293B] border border-slate-700 p-6 rounded-xl">
              <h3 className="text-base font-semibold text-white mb-4 flex items-start gap-2">
                <span className="text-sky-400 font-bold">Q{idx + 1}.</span> {q.question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(q.options).map(([key, val]) => {
                  const isSelected = answers[q.id] === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleSelect(q.id, key)}
                      className={`text-left p-3 rounded-lg border text-xs transition flex items-center gap-3 ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white font-medium'
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {key}
                      </span>
                      <span>{val}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <ShieldCheck className="w-5 h-5" /> Submit Assessment for Grading
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border text-center ${result.passed ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-red-950/20 border-red-500/40'}`}>
            <Award className={`w-16 h-16 mx-auto mb-3 ${result.passed ? 'text-emerald-400' : 'text-red-400'}`} />
            <h3 className="text-2xl font-bold text-white mb-1">
              {result.passed ? "Assessment Passed!" : "Assessment Threshold Not Met"}
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Your Score: <span className="font-bold text-white">{result.score} / {result.total}</span> ({result.percentage}%)
            </p>

            {result.passed ? (
              <div className="max-w-md mx-auto bg-slate-900/80 border border-slate-700 p-4 rounded-xl mt-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">Enter your full name for the certificate:</label>
                <input
                  type="text"
                  placeholder="e.g. Ndaba Joel Osteen"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-sky-400 mb-3"
                />
                <button
                  onClick={handleDownloadCert}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Official PDF Certificate
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setResult(null); setAnswers({}); }}
                className="mt-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition inline-flex items-center gap-2 border border-slate-600"
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