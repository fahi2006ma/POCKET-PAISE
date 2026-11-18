import React, { useState } from 'react';
import { X, Sparkles, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { goalAPI } from '../api/client';

export default function GoalContributionModal({ isOpen, onClose, goal, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt <= 0) {
      setError('Please enter a contribution amount greater than ₹0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await goalAPI.addContribution(goal.id, {
        amount: numAmt.toFixed(2),
        date,
        note: note.trim()
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#fbbf24']
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to record contribution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#fefaf7] rounded-3xl border border-[#ebdcd3] shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-base font-bold text-stone-800 font-display">
              Add Savings to Goal
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Target Goal</p>
            <p className="text-sm font-bold text-emerald-950">{goal.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-500">Progress</p>
            <p className="text-sm font-bold text-emerald-700">{goal.percentage}%</p>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Contribution Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-2xl bg-white border border-stone-300 text-lg font-bold text-stone-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-white border border-stone-300 text-xs text-stone-700 outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Freelance bonus, Saved from dining out..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-white border border-stone-300 text-xs text-stone-700 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Saving...' : 'Add to Savings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
