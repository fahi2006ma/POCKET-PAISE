import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import PocketPaiseLogo from '../components/PocketPaiseLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf5f0] flex flex-col items-center justify-center p-6 text-center">
      <PocketPaiseLogo size="lg" />
      <span className="text-6xl mt-6">🍃</span>
      <h1 className="mt-4 text-3xl font-extrabold font-display text-stone-800">
        404 – Page Not Found
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-sm">
        The rupee or page you are looking for took another path in the garden. Let's return home safely!
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all hover:shadow cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}
