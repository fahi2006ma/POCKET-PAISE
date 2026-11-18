import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function CozyBanner({ onQuickAdd }) {
  const { user } = useAuth();
  const displayName = user?.full_name || 'Dreamer';

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-[#fbf4ee] via-[#f7eae2] to-[#eddcd2] border border-[#ebd6c8]/60 p-6 md:p-8 overflow-hidden shadow-sm">
      {/* Subtle background ambient sparkles and gradients */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-100/30 to-transparent pointer-events-none" />
      <div className="absolute -top-10 -left-10 w-44 h-44 bg-rose-200/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Greeting & Status */}
        <div className="max-w-md">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight">
              Hello, <span className="font-script font-semibold text-emerald-900 text-4xl md:text-5xl">{displayName}!</span>
            </h1>
            <span className="text-rose-400 text-2xl font-script animate-pulse">♡</span>
          </div>

          <p className="mt-2 text-stone-600 text-sm md:text-base font-medium flex items-center gap-1.5">
            Your financial journey is on track
            <span className="text-amber-500 inline-block">✨</span>
            <span className="text-xs bg-emerald-100/80 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300/40">
              ₹ INR
            </span>
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onQuickAdd}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Record New Paise</span>
            </button>
            <span className="text-stone-400 text-xs hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-stone-200/70 border border-stone-300 rounded text-[10px] text-stone-700">Ctrl + K</kbd> to search</span>
          </div>
        </div>

        {/* Right: Cozy Illustration & Aesthetic Quote */}
        <div className="flex items-center gap-5 w-full md:w-auto justify-end">
          <div className="hidden lg:block text-right">
            <p className="font-script text-2xl text-stone-700 font-medium">
              + Plan today...
            </p>
            <p className="font-script text-2xl text-emerald-900 font-semibold">
              Live the life you love ♡
            </p>
          </div>

          {/* Cozy Cat & Window Illustration */}
          <div className="relative w-44 h-28 md:w-56 md:h-32 flex-shrink-0 rounded-2xl bg-gradient-to-b from-[#32454b] via-[#24353a] to-[#1a272b] p-2.5 overflow-hidden shadow-inner border border-stone-400/30">
            {/* Hanging ivy leaves */}
            <div className="absolute top-0 left-3 flex gap-1 z-20">
              <span className="text-emerald-400/90 text-sm">🌿</span>
              <span className="text-emerald-300/70 text-xs">🍃</span>
            </div>

            {/* Window with crescent moon & stars */}
            <div className="absolute top-2 right-4 w-12 h-12 rounded-full bg-slate-900/40 border border-amber-200/20 flex items-center justify-center">
              <span className="text-amber-200 text-sm select-none">🌙</span>
              <div className="absolute top-1 left-2 w-1 h-1 bg-amber-100 rounded-full animate-ping opacity-75" />
            </div>

            {/* Desk lamp on right */}
            <div className="absolute top-3 right-1 flex flex-col items-center z-10 opacity-90">
              <div className="w-5 h-3 bg-amber-100 rounded-t-full shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
              <div className="w-0.5 h-6 bg-stone-400" />
            </div>

            {/* Sleeping white cat curled up on pastel books */}
            <div className="absolute bottom-1 right-5 z-20 flex flex-col items-center">
              {/* Cat body */}
              <div className="relative w-14 h-8 bg-amber-50 rounded-full shadow-md flex items-center justify-center border border-amber-200/50">
                {/* Ears */}
                <div className="absolute -top-1.5 left-2 w-2 h-2 bg-rose-200 rounded-tl-sm rotate-45" />
                <div className="absolute -top-1.5 left-5 w-2 h-2 bg-rose-200 rounded-tl-sm rotate-45" />
                {/* Sleeping closed eyes */}
                <span className="text-[10px] text-stone-500 font-bold select-none tracking-widest pl-1">ᵔ ᵕ ᵔ</span>
                {/* Tail */}
                <div className="absolute -right-2 top-2 w-3 h-4 border-r-2 border-b-2 border-amber-200 rounded-br-full" />
              </div>

              {/* Stack of colorful study books */}
              <div className="w-20 h-2 bg-rose-300 rounded-sm mt-0.5 border-b border-rose-400" />
              <div className="w-24 h-2 bg-teal-600 rounded-sm mt-0.5 border-b border-teal-700" />
              <div className="w-26 h-2 bg-amber-400 rounded-sm mt-0.5 border-b border-amber-500" />
            </div>

            {/* Potted plant on shelf */}
            <div className="absolute bottom-2 left-3 flex flex-col items-center">
              <span className="text-emerald-400 text-xs">🌱</span>
              <div className="w-4 h-3 bg-stone-300 rounded-b-sm border-t border-stone-400" />
            </div>

            {/* Floating gentle sparkles */}
            <span className="absolute bottom-7 left-12 text-amber-200 text-[10px] animate-pulse">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
}
