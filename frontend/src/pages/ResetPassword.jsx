import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import PocketPaiseLogo from '../components/PocketPaiseLogo';
import { authAPI } from '../api/client';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must be at least 8 characters with at least one letter and one number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.resetPassword({ token, new_password: newPassword });
      setStatusMsg(res.data.message || 'Password successfully updated.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Password reset failed or token expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5f0] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 flex flex-col items-center">
          <Link to="/">
            <PocketPaiseLogo size="lg" />
          </Link>
          <h2 className="mt-4 text-2xl font-bold font-display text-stone-800">
            Set New Password
          </h2>
        </div>

        <div className="bg-white/95 rounded-3xl border border-[#ebdcd3] p-7 shadow-xl shadow-stone-200/50">
          {statusMsg ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-emerald-800">{statusMsg}</p>
              <p className="text-[11px] text-stone-400 mt-1">Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {isLoading ? 'Resetting...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
