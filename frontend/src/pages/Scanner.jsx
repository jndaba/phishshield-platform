import React, { useState } from 'react';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Loader2,
  Lock,
  Cpu,
  Layers
} from 'lucide-react';
import axios from 'axios';

const SCANNER_API = 'http://127.0.0.1:8000/api/scanner/scan/';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();

    const submittedUrl = url.trim();

    if (!submittedUrl) {
      setError('Please enter a URL to scan.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(
        SCANNER_API,
        { url: submittedUrl },
        { timeout: 30000 }
      );

      if (!response.data || !response.data.prediction) {
        throw new Error('The scanner returned an invalid response.');
      }

      setResult(response.data);
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        const detail =
          data?.error ||
          data?.detail ||
          (typeof data === 'string' ? data : null);

        setError(
          detail ||
            `The server returned an error (${err.response.status}). Please try again.`
        );
      } else if (err.code === 'ECONNABORTED') {
        setError('The scan took too long. Please try again.');
      } else if (err.request) {
        setError(
          'Cannot reach the PhishShield backend. Make sure Django is running at 127.0.0.1:8000.'
        );
      } else {
        setError(err.message || 'Unable to scan this URL.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isMalicious =
    result?.prediction === 'Malicious / Phishing';

  const displayedRisk = Number(result?.phishing_probability);
  const modelRisk = Number(result?.model_phishing_probability);

  const hasDisplayedRisk = Number.isFinite(displayedRisk);
  const hasModelRisk = Number.isFinite(modelRisk);

  const probabilitiesDiffer =
    hasDisplayedRisk &&
    hasModelRisk &&
    Math.abs(displayedRisk - modelRisk) > 0.001;

  const scanDuration = result?.scan_duration_seconds;
  const hasScanDuration =
    scanDuration !== null &&
    scanDuration !== undefined &&
    Number.isFinite(Number(scanDuration));

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Heading */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-[10px] font-bold text-blue-950 uppercase tracking-widest block mb-1">
            Machine Learning Intelligence Gateway
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Predictive URL Threat Scanner
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Analyze suspicious domains and URLs using the trained Random Forest classifier
            and lexical structural warning heuristics.
          </p>
        </div>

        {/* URL Input Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <form onSubmit={handleScan} className="space-y-4">
            <label
              htmlFor="scanner-url"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Target URL / Domain
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  id="scanner-url"
                  type="text"
                  required
                  disabled={loading}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/login"
                  autoComplete="url"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-950 focus:bg-white transition disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="bg-blue-950 hover:bg-blue-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shrink-0 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing URL...</span>
                  </>
                ) : (
                  <>
                    <span>Scan URL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {loading && (
            <p className="mt-3 text-xs font-semibold text-blue-950 flex items-center gap-2" role="status">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Extracting feature vector and computing inference heuristics. Please wait...</span>
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results Card */}
        {result && (
          <div
            aria-live="polite"
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6"
          >
            {/* Classification Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`p-3 rounded-xl border shrink-0 ${
                    isMalicious
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  }`}
                >
                  {isMalicious ? (
                    <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
                  ) : (
                    <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Heuristic Verdict
                  </span>
                  <h2
                    className={`text-xl font-black ${
                      isMalicious ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {result.prediction}
                  </h2>

                  <p className="text-xs font-mono text-slate-500 break-all mt-0.5">
                    {result.url || url}
                  </p>
                </div>
              </div>

              {hasScanDuration && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700 self-start sm:self-auto shrink-0 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-950" />
                  <span>
                    Latency:{' '}
                    <strong className="text-blue-950 font-bold">
                      {Number(scanDuration).toFixed(3)} s
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Displayed Phishing Risk
                </span>

                <p
                  className={`text-2xl font-black mt-1 ${
                    isMalicious ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {hasDisplayedRisk
                    ? `${displayedRisk.toFixed(1)}%`
                    : 'Unavailable'}
                </p>

                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Adjusted risk probability score synthesized from feature weights and safeguards.
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Transport Encryption
                </span>

                <p
                  className={`text-base font-bold mt-1.5 flex items-center gap-1.5 ${
                    result.is_https ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  {result.is_https
                    ? 'HTTPS Validated'
                    : 'Insecure / Cleartext HTTP'}
                </p>

                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  HTTPS encrypts transit data, but modern phishing sites frequently provision valid SSL certificates.
                </p>
              </div>

              {probabilitiesDiffer && (
                <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl sm:col-span-2">
                  <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider block">
                    Raw Classifier Probability
                  </span>

                  <p className="text-xl font-black text-amber-900 mt-1">
                    {modelRisk.toFixed(1)}%
                  </p>

                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    This differs from the displayed risk score due to whitelist matching, known homepage checks, or domain heuristic overrides.
                  </p>
                </div>
              )}

              <div className="bg-slate-50/70 border border-slate-200 p-4 rounded-xl sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Inference Engine
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Random Forest Multi-Feature Classifier
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-950 border border-blue-200">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Detected Clues */}
            {Array.isArray(result.detected_clues) &&
              result.detected_clues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Detected Structural Indicators ({result.detected_clues.length})
                  </h3>

                  <ul className="space-y-2 text-xs">
                    {result.detected_clues.map((clue, idx) => (
                      <li
                        key={`${idx}-${clue}`}
                        className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="font-medium">{clue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {Array.isArray(result.detected_clues) &&
              result.detected_clues.length === 0 && (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                  No anomalous structural patterns or obfuscations were observed in this URL vector.
                </p>
              )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Automated inference model predictions should be paired with out-of-band verification.</span>
              <span className="font-bold text-blue-950">PhishShield Engine v2.0</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}