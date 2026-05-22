import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

/* ------- tiny password-strength helper ------- */
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-5
};

const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor  = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];

const ResetPassword = () => {
  const { token }   = useParams();
  const navigate    = useNavigate();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [showCfm,   setShowCfm]   = useState(false);
  const [status,    setStatus]    = useState('idle'); // idle | loading | success | error
  const [message,   setMessage]   = useState('');
  const [countdown, setCountdown] = useState(5);

  const strength = getStrength(password);

  // Countdown redirect after success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) { navigate('/login'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, { password });
      setStatus('success');
      setMessage(res.data.message || 'Password reset successfully!');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-indigo-500/30">
          S
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Choose a strong password to protect your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl shadow-slate-200/60 sm:rounded-2xl sm:px-10 border border-slate-100">

          {/* ── SUCCESS STATE ── */}
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Password Updated!</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
              <div className="flex items-center justify-center gap-2 p-3 bg-indigo-50 rounded-xl mb-6">
                <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
                <span className="text-sm text-indigo-700 font-medium">
                  Redirecting to login in <strong>{countdown}s</strong>…
                </span>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Go to Sign In now
              </Link>
            </div>

          ) : (
            /* ── FORM STATE ── */
            <form className="space-y-5" onSubmit={handleSubmit} id="reset-password-form">

              {/* Error Banner */}
              {status === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="new-password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-11 py-3 sm:text-sm border-slate-300 rounded-xl bg-slate-50 border outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength >= 4 ? 'text-green-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showCfm ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-11 py-3 sm:text-sm rounded-xl bg-slate-50 border outline-none transition-colors ${
                      confirm.length > 0 && confirm !== password
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                        : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCfm(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showCfm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirm.length > 0 && confirm !== password && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
                {confirm.length > 0 && confirm === password && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="reset-password-btn"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {status === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Updating password…</>
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-indigo-600 transition-colors">
                  Request a new reset link
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
