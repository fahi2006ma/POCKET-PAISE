import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { budgetAPI, categoryAPI } from '../api/client';

export default function BudgetModal({ isOpen, onClose, onSuccess, initialData = null, selectedMonth = null }) {
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      categoryAPI.list().then((res) => {
        const cats = (res.data.results || res.data || []).filter((c) => c.type === 'expense');
        setCategories(cats);
        if (!initialData && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      }).catch(console.error);

      if (initialData) {
        setCategoryId(initialData.category || initialData.category_detail?.id);
        setLimitAmount(initialData.limit_amount);
        setMonth(initialData.month ? initialData.month.slice(0, 7) : new Date().toISOString().slice(0, 7));
      } else {
        setLimitAmount('');
        setMonth(selectedMonth ? selectedMonth.slice(0, 7) : new Date().toISOString().slice(0, 7));
      }
      setError('');
    }
  }, [isOpen, initialData, selectedMonth]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(limitAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a budget limit amount greater than ₹0.');
      return;
    }
    if (!categoryId) {
      setError('Please select an expense category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        category: categoryId,
        limit_amount: parsedAmount.toFixed(2),
        month: `${month}-01`,
      };

      if (initialData?.id) {
        await budgetAPI.update(initialData.id, payload);
      } else {
        await budgetAPI.create(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.category?.[0] || 'Failed to save budget. A budget may already exist for this category.';
      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#fefaf7] rounded-3xl border border-[#ebdcd3] shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-bold text-stone-800 font-display">
              {initialData ? 'Edit Category Budget' : 'Set Monthly Budget'}
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
            <label className="block text-xs font-semibold text-stone-600 mb-1">Expense Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!!initialData}
              className="w-full px-3 py-2 rounded-2xl bg-white border border-stone-300 text-xs text-stone-700 outline-none focus:border-emerald-600 disabled:bg-stone-100"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Monthly Limit Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="5000.00"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-2xl bg-white border border-stone-300 text-base font-bold text-stone-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Budget Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={!!initialData}
              className="w-full px-3 py-2 rounded-2xl bg-white border border-stone-300 text-xs text-stone-700 outline-none focus:border-emerald-600 disabled:bg-stone-100"
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
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Limit' : 'Set Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
