import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/auth/password-reset/', { email });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true); // Don't disclose email existence
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#102A36] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">Reset Link Dispatched</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              If the email matches an active account, check your inbox (or terminal console) for your password reset link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
            <p className="text-xs text-slate-500">Enter your registered email address to receive a secure recovery URL.</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                placeholder="name@university.ac.ke"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}