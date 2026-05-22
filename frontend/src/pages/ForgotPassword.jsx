import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState('idle'); // idle | loading | success | error
  const [message, setMessage]   = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setPreviewUrl('');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message || 'Reset link sent! Check your inbox.');
      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-200 opacity-30 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-indigo-500/30">
          S
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl shadow-slate-200/60 sm:rounded-2xl sm:px-10 border border-slate-100">

          {/* Success State */}
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Check your inbox!</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
              {previewUrl && (
                <div className="mb-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left text-sm text-slate-600">
                  <p className="font-semibold text-slate-900 mb-2">Development preview link</p>
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500">
                    Open Preview <ExternalLink size={14} />
                  </a>
                  <p className="mt-2 text-xs text-slate-400">This is only visible when using local email testing or Ethereal.</p>
                </div>
              )}
              <p className="text-xs text-slate-400 mb-6">
                Didn&apos;t receive the email?&nbsp;
                <button
                  onClick={() => { setStatus('idle'); setEmail(''); setMessage(''); setPreviewUrl(''); }}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 underline"
                >
                  Try again
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} id="forgot-password-form">

              {/* Error Banner */}
              {status === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 sm:text-sm border-slate-300 rounded-xl bg-slate-50 border outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="send-reset-link-btn"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending…</>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Back to login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Role hint */}
        <p className="mt-5 text-center text-xs text-slate-400">
          Works for <span className="font-semibold text-indigo-500">Admin</span>,&nbsp;
          <span className="font-semibold text-purple-500">Instructor</span>, and&nbsp;
          <span className="font-semibold text-blue-500">Student</span> accounts.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
