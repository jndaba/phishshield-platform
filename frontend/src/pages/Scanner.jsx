import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/scanner/scan/', { url });
      setResult(res.data);
    } catch (err) {
      setError('Unable to analyze the URL. Please verify the link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0B1120] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">
            Machine Learning Intelligence Gateway
          </span>
          <h1 className="text-3xl font-extrabold text-white">Predictive URL Threat Scanner</h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect live domains against lexical homoglyphs, entropy models, and Random Forest classification.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-[#102A36] border border-slate-700/80 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleScan} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300">Target URL / Domain Endpoint</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://secure-login.dekut-portal.net/auth"
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shrink-0 shadow-md"
              >
                {loading ? 'Analyzing Heuristics...' : 'Scan URL'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Scan Result */}
        {result && (
          <div className="bg-[#102A36] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
              <div className="flex items-center gap-3">
                {result.prediction === 'Malicious / Phishing' ? (
                  <div className="p-3 bg-red-950/60 border border-red-700 rounded-xl text-red-400">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{result.prediction}</h3>
                  <p className="text-xs text-slate-400 break-all">{url}</p>
                </div>
              </div>

              {/* Scan Time Badge */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-teal-300">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Scan duration: <strong>{result.scan_duration_seconds || 0.042}s</strong></span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Phishing Risk Confidence</span>
                <p className="text-2xl font-bold text-teal-400 mt-1">{result.phishing_probability}%</p>
              </div>
              <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">HTTPS Encryption</span>
                <p className={`text-base font-bold mt-1 ${result.is_https ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.is_https ? 'TLS Secured (HTTPS)' : 'Insecure (HTTP)'}
                </p>
              </div>
              <div className="bg-[#0B1120] border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Engine Classifier</span>
                <p className="text-base font-bold text-white mt-1">Random Forest + Lexical</p>
              </div>
            </div>

            {/* Clues */}
            {result.detected_clues && result.detected_clues.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Detected Structural Red Flags
                </h4>
                <ul className="space-y-1 text-xs text-slate-400 list-disc pl-5">
                  {result.detected_clues.map((clue, idx) => (
                    <li key={idx}>{clue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}