import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import PocketPaiseLogo from '../components/PocketPaiseLogo';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setIsLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to log in with demo credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5f0] flex flex-col justify-center items-center p-4 selection:bg-emerald-200">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/">
            <PocketPaiseLogo size="lg" />
          </Link>
          <h2 className="mt-4 text-2xl font-bold font-display text-stone-800">
            Welcome back, Dreamer! <span className="text-rose-400 font-script text-3xl">♡</span>
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Sign in to check your balances, budgets, and savings
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 rounded-3xl border border-[#ebdcd3] p-7 shadow-xl shadow-stone-200/50">
          {/* Quick Demo Pill */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={isLoading}
            className="w-full mb-5 py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Instant Login with Demo Data (Dreamer)</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200" />
            <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-medium">Or with your account</span>
            <div className="flex-grow border-t border-stone-200" />
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300/80 text-sm outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-600">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-emerald-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-stone-50 border border-stone-300/80 text-sm outline-none focus:bg-white focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Pocket Paise'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-emerald-800 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
