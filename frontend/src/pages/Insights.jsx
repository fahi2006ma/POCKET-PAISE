import React, { useState, useEffect } from 'react';
import { Lightbulb, Crown, TrendingUp, AlertTriangle, CheckCircle, Award, PiggyBank, Zap } from 'lucide-react';
import { insightAPI } from '../api/client';

export default function Insights() {
  const [scoreData, setScoreData] = useState(null);
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const [scoreRes, tipsRes] = await Promise.all([
          insightAPI.getScore(),
          insightAPI.getTips(),
        ]);
        setScoreData(scoreRes.data);
        setTips(tipsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const score = scoreData?.score ?? 92;
  const parts = scoreData?.parts || {
    savings_score: 95,
    budget_score: 90,
    goal_score: 88,
    savings_rate: 25.4,
  };

  const getTipIcon = (iconName) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-amber-600" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'CheckCircle': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'Award': return <Award className="w-5 h-5 text-emerald-700" />;
      case 'PiggyBank': return <PiggyBank className="w-5 h-5 text-sky-600" />;
      default: return <Zap className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-800">
          Financial Health & Insights
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
          Data-driven tips and mathematical scoring of your money habits
        </p>
      </div>

      {/* Main Score Breakdown Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1b3d2f] via-[#132c22] to-[#091712] text-white p-6 sm:p-8 shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Gauge & Label */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#254636" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="8"
                  strokeDasharray={`${2.64 * score} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <Crown className="w-5 h-5 text-amber-300 mb-0.5" />
                <span className="text-4xl font-extrabold">{score}</span>
                <span className="text-xs text-emerald-300/80">out of 100</span>
              </div>
            </div>

            <h3 className="mt-4 text-xl font-bold text-white tracking-wide">
              {scoreData?.label || 'Excellent!'}
            </h3>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-xs">
              {scoreData?.message || "You're a smart spender 💚"}
            </p>
          </div>

          {/* Right Column: Mathematical Components (SRS Appendix A) */}
          <div className="md:col-span-7 space-y-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Formula Breakdown: Score = 0.4S + 0.3B + 0.3G
            </h4>

            {/* Savings Score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-stone-300">Savings Score (40% weight)</span>
                <span className="font-bold text-white">{parts.savings_score} / 100</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${parts.savings_score}%` }} />
              </div>
              <span className="text-[10px] text-stone-400">Current savings rate benchmark against 30% target</span>
            </div>

            {/* Budget Adherence Score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-stone-300">Budget Adherence (30% weight)</span>
                <span className="font-bold text-white">{parts.budget_score} / 100</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${parts.budget_score}%` }} />
              </div>
              <span className="text-[10px] text-stone-400">Percentage of monthly category limits strictly respected</span>
            </div>

            {/* Goal Progress Score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-stone-300">Goal Momentum (30% weight)</span>
                <span className="font-bold text-white">{parts.goal_score} / 100</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${parts.goal_score}%` }} />
              </div>
              <span className="text-[10px] text-stone-400">Average progress across all active savings targets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Actionable Tips */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-stone-800 font-display">Personalized Money Tips</h2>
        </div>

        {tips.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            Keep recording transactions to generate customized guidance!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs flex items-start gap-4 transition-all hover:shadow-md"
              >
                <div className="p-3 rounded-2xl bg-stone-100 flex-shrink-0">
                  {getTipIcon(tip.icon)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-800">{tip.title}</h4>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
