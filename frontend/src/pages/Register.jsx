import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import PocketPaiseLogo from '../components/PocketPaiseLogo';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Password must be at least 8 characters and include at least one letter and one number.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || err.response?.data?.confirm_password?.[0] || 'Registration failed. Please check your details.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5f0] flex flex-col justify-center items-center p-4 selection:bg-emerald-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 flex flex-col items-center">
          <Link to="/">
            <PocketPaiseLogo size="lg" />
          </Link>
          <h2 className="mt-4 text-2xl font-bold font-display text-stone-800">
            Create Your Sanctuary <span className="text-rose-400 font-script text-3xl">♡</span>
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Start tracking, budgeting, and reaching your financial dreams
          </p>
        </div>

        <div className="bg-white/95 rounded-3xl border border-[#ebdcd3] p-7 shadow-xl shadow-stone-200/50">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Aisha Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300/80 text-sm outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="aisha@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300/80 text-sm outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 8 characters (letters & digits)"
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

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300/80 text-sm outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-emerald-800 accent-emerald-800 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-stone-600 leading-tight select-none">
                I agree to the Terms of Service & Privacy Policy, and understand my financial data is encrypted and private.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isLoading ? 'Creating Account...' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-800 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
