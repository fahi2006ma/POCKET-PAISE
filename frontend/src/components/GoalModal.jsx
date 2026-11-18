import React, { useState, useEffect } from 'react';
import { X, Trophy, Calendar, Check } from 'lucide-react';
import { goalAPI } from '../api/client';

export default function GoalModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('active');
  const [icon, setIcon] = useState('Plane');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const iconsList = [
    { label: 'Trip', val: 'Plane', emoji: '✈️' },
    { label: 'Shield', val: 'Shield', emoji: '🛡️' },
    { label: 'Laptop', val: 'Laptop', emoji: '💻' },
    { label: 'Home', val: 'Home', emoji: '🏡' },
    { label: 'Car', val: 'Car', emoji: '🚗' },
    { label: 'Gift', val: 'Gift', emoji: '🎁' },
    { label: 'Heart', val: 'Heart', emoji: '💖' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setTargetAmount(initialData.target_amount);
        setTargetDate(initialData.target_date || '');
        setStatus(initialData.status || 'active');
        setIcon(initialData.icon || 'Plane');
      } else {
        setName('');
        setTargetAmount('');
        setTargetDate('');
        setStatus('active');
        setIcon('Plane');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedTarget = parseFloat(targetAmount);
    if (!name.trim()) {
      setError('Please provide a goal name.');
      return;
    }
    if (!parsedTarget || parsedTarget <= 0) {
      setError('Please enter a target amount greater than ₹0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        target_amount: parsedTarget.toFixed(2),
        target_date: targetDate || null,
        status,
        icon,
      };

      if (initialData?.id) {
        await goalAPI.update(initialData.id, payload);
      } else {
        await goalAPI.create(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#fefaf7] rounded-3xl border border-[#ebdcd3] shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-stone-800 font-display">
              {initialData ? 'Edit Savings Goal' : 'Create New Savings Goal'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Goal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next Trip, Emergency Fund, New Laptop..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300 text-sm text-stone-800 outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Target Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="25000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-2xl bg-white border border-stone-300 text-base font-bold text-stone-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300 text-xs text-stone-700 outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Icon Motif</label>
            <div className="flex items-center gap-2">
              {iconsList.map((ic) => (
                <button
                  key={ic.val}
                  type="button"
                  onClick={() => setIcon(ic.val)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border transition-all cursor-pointer ${
                    icon === ic.val
                      ? 'bg-amber-100 border-amber-400 scale-110 shadow-xs'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {ic.emoji}
                </button>
              ))}
            </div>
          </div>

          {initialData && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-white border border-stone-300 text-xs text-stone-700 outline-none"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

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
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
