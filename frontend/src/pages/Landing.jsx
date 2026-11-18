import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, BarChart3, Target, Wallet, CheckCircle2 } from 'lucide-react';
import PocketPaiseLogo from '../components/PocketPaiseLogo';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5f0] text-slate-800 flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <PocketPaiseLogo size="md" />

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all hover:shadow hover:-translate-y-0.5"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <button
                onClick={handleDemo}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>One-Click Demo</span>
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-stone-700 hover:text-emerald-800"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all hover:shadow hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 lg:py-16 flex-1 flex flex-col items-center text-center">
        {/* Cute Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 shadow-xs text-xs font-semibold text-emerald-800 mb-6">
          <span className="text-amber-500">✨</span>
          <span>Your cozy personal finance companion in Indian Rupees (₹)</span>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-3xl text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-slate-800 leading-tight">
          Track every rupee with peace of mind.
        </h1>

        <p className="mt-4 max-w-xl text-stone-600 text-base sm:text-lg font-medium leading-relaxed">
          Record everyday income, set gentle category budgets, watch your dream savings grow, and discover your financial score in a calming pastel sanctuary.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold shadow-lg shadow-emerald-950/20 transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Live Demo Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 text-sm font-bold border border-stone-300 shadow-xs transition-all hover:shadow text-center"
          >
            Create Your Account
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          {/* Card 1 */}
          <div className="rounded-3xl bg-white/80 border border-[#eddcd2] p-6 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-800 font-display">Effortless Tracking</h3>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Log daily UPI, card, and cash expenses in seconds. Smart categorization for food, shopping, travel, and more.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl bg-white/80 border border-[#eddcd2] p-6 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-800 font-display">Budgets & Alerts</h3>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Set monthly category limits and get non-intrusive notifications when you hit 80% and 100% thresholds.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl bg-white/80 border border-[#eddcd2] p-6 shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-800 font-display">Financial Health Score</h3>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Get an instant 0–100 score based on your savings rate, budget discipline, and goals with personalized tips.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ebdcd3] py-6 text-center text-xs text-stone-500">
        <p>Pocket Paise · Personal Finance Management System · Built with React & Django</p>
      </footer>
    </div>
  );
}
