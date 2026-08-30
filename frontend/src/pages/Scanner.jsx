import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/scanner/scan/', { url });
      setResult(response.data);
    } catch (err) {
      setResult({
        status: 'Error',
        is_malicious: true,
        confidence: 'N/A',
        indicators: ['Unable to contact detection engine. Ensure the backend server is running.']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white mb-2">Predictive Phishing URL Scanner</h2>
        <p className="text-slate-400 text-sm">Analyze suspicious links with real-time heuristic parsing and Random Forest classification.</p>
      </div>

      <form onSubmit={handleScan} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste suspicious URL here (e.g. http://secure-update-bank-login.xyz)"
            className="w-full bg-[#1E293B] border border-slate-700 pl-12 pr-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:border-sky-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
          Scan Link
        </button>
      </form>

      {result && (
        <div className={`p-6 rounded-xl border ${result.is_malicious ? 'bg-red-950/20 border-red-500/40' : 'bg-emerald-950/20 border-emerald-500/40'}`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              {result.is_malicious ? (
                <AlertTriangle className="w-7 h-7 text-red-400" />
              ) : (
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              )}
              <h3 className="text-xl font-bold text-white">{result.status}</h3>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
              Confidence: {result.confidence}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Observed Indicators:</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              {result.indicators.map((ind, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${result.is_malicious ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  {ind}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}