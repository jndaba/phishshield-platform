import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, KeyRound, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/password-reset/', { email });
      setMessage(res.data?.message || 'Password recovery link generated.');
      setResetToken(res.data?.token || '');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No account found matching that email or username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#102A36] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <CheckCircle className="w-12 h-12 text-teal-500 mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Recovery Link Ready</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
            </div>

            {resetToken && (
              <Link
                to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition inline-flex items-center justify-center gap-2 shadow-md"
              >
                <KeyRound className="w-4 h-4" /> Proceed to Reset Password
              </Link>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
            <p className="text-xs text-slate-500">Enter your registered email address or username to generate a secure recovery link.</p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email or Username</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                placeholder="name@university.ac.ke or username"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition shadow-md"
            >
              {loading ? 'Generating link...' : 'Generate Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}