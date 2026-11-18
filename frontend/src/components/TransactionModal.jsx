import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Check, Calendar, CreditCard, Tag, FileText, Repeat } from 'lucide-react';
import { transactionAPI, categoryAPI } from '../api/client';

export default function TransactionModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch categories
  useEffect(() => {
    if (isOpen) {
      categoryAPI.list().then((res) => {
        const cats = res.data.results || res.data || [];
        setCategories(cats);
        if (!initialData && cats.length > 0) {
          const defaultCat = cats.find((c) => c.type === (initialData?.type || type));
          if (defaultCat) setCategoryId(defaultCat.id);
        }
      }).catch(console.error);

      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount);
        setTitle(initialData.title);
        setCategoryId(initialData.category || initialData.category_detail?.id);
        setPaymentMethod(initialData.payment_method || 'upi');
        setDateTime(initialData.date_time ? initialData.date_time.slice(0, 16) : new Date().toISOString().slice(0, 16));
        setNotes(initialData.notes || '');
        setIsRecurring(initialData.is_recurring || false);
        setRecurrence(initialData.recurrence || '');
      } else {
        // Defaults
        setType('expense');
        setAmount('');
        setTitle('');
        setPaymentMethod('upi');
        // Local ISO datetime string
        const now = new Date();
        const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setDateTime(localISO);
        setNotes('');
        setIsRecurring(false);
        setRecurrence('');
      }
      setErrorMessage('');
    }
  }, [isOpen, initialData]);

  // Adjust category selection when type toggles
  const handleTypeChange = (newType) => {
    setType(newType);
    const matchingCat = categories.find((c) => c.type === newType);
    if (matchingCat) setCategoryId(matchingCat.id);
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e, keepOpen = false) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please provide a merchant or description title.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type,
        amount: parsedAmount.toFixed(2),
        title: title.trim(),
        category: categoryId,
        payment_method: paymentMethod,
        date_time: new Date(dateTime).toISOString(),
        notes: notes.trim(),
        is_recurring: isRecurring,
        recurrence: isRecurring ? recurrence || 'monthly' : '',
      };

      if (initialData?.id) {
        await transactionAPI.update(initialData.id, payload);
      } else {
        await transactionAPI.create(payload);
      }

      if (onSuccess) onSuccess();

      if (keepOpen) {
        setAmount('');
        setTitle('');
        setNotes('');
        setErrorMessage('');
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.amount?.[0] || err.response?.data?.detail || 'Failed to save transaction. Please check the values.';
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#fefaf7] rounded-3xl border border-[#ebdcd3] shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h2 className="text-lg font-bold text-stone-800 font-display">
              {initialData ? 'Edit Transaction' : 'Record New Paise'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense / Income Toggle */}
        <div className="mt-5 grid grid-cols-2 gap-2 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/60">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="mt-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-base">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-white border border-stone-300/80 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 text-lg font-bold text-stone-800 outline-none transition-all"
              />
            </div>
          </div>

          {/* Title / Merchant */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Title or Merchant <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Burger King, Zudio, Freelance Stipend..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300/80 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 text-sm text-stone-800 outline-none transition-all"
            />
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-white border border-stone-300/80 text-sm text-stone-700 focus:border-emerald-600 outline-none cursor-pointer"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-white border border-stone-300/80 text-sm text-stone-700 focus:border-emerald-600 outline-none cursor-pointer"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="card">Debit / Credit Card</option>
                <option value="cash">Cash</option>
                <option value="netbanking">Net Banking</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300/80 text-sm text-stone-700 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Dinner with friends, Split with Aisha..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300/80 text-sm text-stone-700 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Recurring Option */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-100/70 border border-stone-200/60">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-emerald-800" />
              <span className="text-xs font-semibold text-stone-700">Recurring Transaction?</span>
            </div>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-emerald-700 rounded accent-emerald-700 cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-2xl text-stone-600 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {!initialData && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Save & Add Another
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-all hover:shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Transaction' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
