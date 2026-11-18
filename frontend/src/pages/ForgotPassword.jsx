import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import PocketPaiseLogo from '../components/PocketPaiseLogo';
import { authAPI } from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
    } catch (e) {
      // Per SRS FR-AUTH-07, always show generic success message
    } finally {
      setIsLoading(false);
      setSubmitted(true);
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
            Forgot Password
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-white/95 rounded-3xl border border-[#ebdcd3] p-7 shadow-xl shadow-stone-200/50">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">Check Your Inbox</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                If an account exists for {email}, a secure password reset link has been dispatched.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1 text-xs text-emerald-800 font-semibold hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
