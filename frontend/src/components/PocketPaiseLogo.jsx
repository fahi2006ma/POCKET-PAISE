import React from 'react';

export default function PocketPaiseLogo({ size = 'md', showTagline = true, className = '' }) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon */}
      <div className={`${iconSizes[size]} relative flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#184e3d] via-[#12382c] to-[#0a231b] shadow-md shadow-emerald-950/20 border border-emerald-500/25 p-1.5 overflow-hidden group`}>
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-radial from-emerald-400/20 to-transparent pointer-events-none" />
        
        {/* Lotus & Coin SVG */}
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105">
          <defs>
            <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="logoPetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* Outer Lotus Petals */}
          <path d="M50 16 C42 32 28 44 20 56 C34 58 45 52 50 40 C55 52 66 58 80 56 C72 44 58 32 50 16 Z" fill="url(#logoPetal)" opacity="0.9" />
          <path d="M50 24 C45 36 36 46 30 52 C38 54 44 50 50 42 C56 50 62 54 70 52 C64 46 55 36 50 24 Z" fill="#a7f3d0" opacity="0.6" />
          
          {/* Golden Rupee Coin */}
          <circle cx="50" cy="60" r="22" fill="url(#logoGold)" />
          <circle cx="50" cy="60" r="19" stroke="#fef3c7" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <text x="50" y="67" fontFamily="sans-serif" fontSize="21" fontWeight="bold" fill="#78350f" textAnchor="middle">₹</text>

          {/* Sparkle star */}
          <path d="M80 18 Q80 24 86 24 Q80 24 80 30 Q80 24 74 24 Q80 24 80 18 Z" fill="#fde68a" />
          <circle cx="20" cy="24" r="2.5" fill="#6ee7b7" />
        </svg>
      </div>

      {/* Brand Title & Tagline */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-bold tracking-tight text-slate-800 ${textSizes[size]}`}>
            Pocket <span className="text-emerald-800">Paise</span>
          </span>
          <span className="text-amber-500 text-xs">✨</span>
        </div>
        {showTagline && (
          <p className="text-[11px] text-stone-500 font-medium tracking-wide">
            Plan · Track · Thrive <span className="text-rose-400">♡</span>
          </p>
        )}
      </div>
    </div>
  );
}
