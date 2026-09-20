import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  User, 
  Clock, 
  Tag, 
  HelpCircle, 
  Sparkles,
  RefreshCw,
  Mail
} from 'lucide-react';
import axios from 'axios';

export default function SimulationInbox() {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [stats, setStats] = useState({ total: 10, completed: 0, correct: 0, accuracy: 0 });
  const [loading, setLoading] = useState(true);

  // Verdict submission state
  const [submitting, setSubmitting] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/simulation/inbox/');
      const data = res.data?.scenarios || [];
      setScenarios(data);
      setStats(res.data?.stats || { total: 10, completed: 0, correct: 0, accuracy: 0 });

      if (data.length > 0 && !activeScenario) {
        setActiveScenario(data[0]);
        if (data[0].user_submission) {
          prepareExistingFeedback(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load simulated inbox scenarios', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const prepareExistingFeedback = (scenario) => {
    if (!scenario.user_submission) {
      setFeedbackData(null);
      return;
    }
    const isCorrect = scenario.user_submission.is_correct;
    const userChoice = scenario.user_submission.user_choice_is_phishing;
    const actual = scenario.is_phishing;

    setFeedbackData({
      is_correct: isCorrect,
      user_choice_is_phishing: userChoice,
      actual_is_phishing: actual,
      threat_category: scenario.threat_category,
      detailed_explanation: scenario.detailed_explanation,
      key_indicators: (scenario.key_indicators || '').split('\n').filter(Boolean),
      feedback_summary: isCorrect
        ? `Spot-on! This message was indeed ${actual ? 'MALICIOUS (Phishing)' : 'SAFE (Legitimate)'}.`
        : `Careful! You marked this email as ${userChoice ? 'MALICIOUS' : 'SAFE'}, but it is actually ${actual ? 'MALICIOUS' : 'SAFE'}.`
    });
  };

  const handleSelectScenario = (scenario) => {
    setActiveScenario(scenario);
    if (scenario.user_submission) {
      prepareExistingFeedback(scenario);
    } else {
      setFeedbackData(null);
    }
  };

  const handleDecision = async (isPhishingVerdict) => {
    if (!activeScenario || submitting) return;
    setSubmitting(true);

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/simulation/inbox/${activeScenario.id}/verdict/`,
        { is_phishing: isPhishingVerdict }
      );

      setFeedbackData(res.data);

      // Update state locally
      setScenarios((prev) =>
        prev.map((s) => {
          if (s.id === activeScenario.id) {
            return {
              ...s,
              user_submission: {
                user_choice_is_phishing: isPhishingVerdict,
                is_correct: res.data.is_correct,
                attempted_at: 'Just now'
              }
            };
          }
          return s;
        })
      );

      // Re-fetch aggregate stats
      const statsRes = await axios.get('http://127.0.0.1:8000/api/simulation/inbox/');
      setStats(statsRes.data?.stats || stats);
    } catch (err) {
      console.error('Failed to submit scenario decision', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] bg-slate-50 text-slate-900 p-4 sm:p-6 flex flex-col space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
              <Inbox className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Live Threat Sandbox
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Simulated Phishing Inbox (10 Scenarios)
          </h1>
          <p className="text-xs text-slate-500">
            Inspect the headers, sender domains, and body payloads. Decide whether each scenario is safe or malicious to receive detailed forensic feedback.
          </p>
        </div>

        {/* Aggregate Stats Card */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
          <div className="text-center px-2">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Completed</span>
            <strong className="text-xs font-black text-slate-800">{stats.completed} / {stats.total}</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
            <strong className="text-xs font-black text-blue-600">{stats.accuracy}%</strong>
          </div>
        </div>
      </div>

      {/* Main Mailbox Frame */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
        
        {/* Scenario List (Left: 4 Cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col min-h-0">
          <div className="pb-2.5 mb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-600" />
              Inbox Queue (10 Scenarios)
            </span>
            <button
              onClick={fetchInbox}
              title="Reload Scenarios"
              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                Loading simulation sandbox...
              </div>
            ) : (
              scenarios.map((scen) => {
                const isSelected = activeScenario?.id === scen.id;
                const isCompleted = Boolean(scen.user_submission);
                const isPassed = scen.user_submission?.is_correct;

                return (
                  <div
                    key={scen.id}
                    onClick={() => handleSelectScenario(scen)}
                    className={`p-3 rounded-xl border transition flex flex-col space-y-1.5 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 shadow-xs ring-1 ring-blue-100'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        #{scen.scenario_number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isCompleted ? (
                          isPassed ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              <XCircle className="w-3 h-3" /> Incorrect
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">Pending</span>
                        )}
                      </div>
                    </div>

                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                      {scen.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span className="truncate max-w-[170px]">{scen.sender_display_name}</span>
                      <span className="font-mono">{scen.sent_time_display}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Email Viewer & Decision Workspace (Right: 8 Cols) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col min-h-0 overflow-hidden">
          {activeScenario ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {/* Email Headers Inspection Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {activeScenario.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        {activeScenario.threat_category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Scenario #{activeScenario.scenario_number} of 10
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 w-12">From:</span>
                    <strong className="text-slate-800">{activeScenario.sender_display_name}</strong>
                    <span className="text-slate-500 font-mono text-[11px]">&lt;{activeScenario.sender_email}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 w-12">To:</span>
                    <span className="text-slate-700 font-mono text-[11px]">{activeScenario.recipient_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 w-12">Date:</span>
                    <span className="text-slate-500">{activeScenario.sent_time_display}</span>
                  </div>
                </div>
              </div>

              {/* Email Body Payload */}
              <div className="p-6 flex-1 bg-white">
                <div 
                  className="prose prose-sm max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: activeScenario.body_html }}
                />
              </div>

              {/* Detailed Decision / Explanation Section */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4 shrink-0">
                {/* Decision Trigger Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-900 block font-bold">Your Security Verdict:</strong>
                    <span>Does this email exhibit signs of social engineering or deception?</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={() => handleDecision(false)}
                      disabled={submitting}
                      className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        activeScenario.user_submission?.user_choice_is_phishing === false
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Legitimate (Safe)</span>
                    </button>

                    <button
                      onClick={() => handleDecision(true)}
                      disabled={submitting}
                      className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        activeScenario.user_submission?.user_choice_is_phishing === true
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Phishing (Malicious)</span>
                    </button>
                  </div>
                </div>

                {/* Detailed Feedback & Forensic Explanation Box */}
                {feedbackData && (
                  <div className={`p-4 rounded-xl border text-xs space-y-3 animate-in fade-in duration-300 ${
                    feedbackData.is_correct 
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                      : 'bg-red-50/70 border-red-200 text-red-950'
                  }`}>
                    {/* Verdict Result Header */}
                    <div className="flex items-center gap-2 font-black text-sm">
                      {feedbackData.is_correct ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="text-emerald-700">Correct Assessment</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-red-700">Incorrect Assessment</span>
                        </>
                      )}
                    </div>

                    <p className="font-semibold text-xs leading-relaxed">
                      {feedbackData.feedback_summary}
                    </p>

                    {/* Detailed Technical Explanation */}
                    <div className="bg-white/90 p-3.5 rounded-lg border border-current/10 space-y-2 text-slate-800">
                      <strong className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                        Forensic Explanation &amp; Attack Breakdown:
                      </strong>
                      <p className="text-xs leading-relaxed">
                        {feedbackData.detailed_explanation}
                      </p>
                    </div>

                    {/* Key Indicators Checklist */}
                    {feedbackData.key_indicators && feedbackData.key_indicators.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <strong className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                          Identified Artifacts:
                        </strong>
                        <ul className="space-y-1">
                          {feedbackData.key_indicators.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-blue-600 font-bold">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <Mail className="w-10 h-10 text-slate-300" />
              <p className="text-xs">Select an email from the inbox queue to begin inspection.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}