import React, { useState, useEffect } from 'react';
import { Target, Plus, Copy, AlertTriangle, AlertCircle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { budgetAPI } from '../api/client';
import BudgetModal from '../components/BudgetModal';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const res = await budgetAPI.list(month);
      setBudgets(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month]);

  const handleCopyPrevious = async () => {
    setMessage('');
    setErrorMessage('');
    try {
      const res = await budgetAPI.copyPrevious(month);
      setMessage(res.data.message);
      fetchBudgets();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to copy previous month budgets.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category budget limit?')) return;
    try {
      await budgetAPI.delete(id);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const totalLimit = budgets.reduce((acc, b) => acc + parseFloat(b.limit_amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + parseFloat(b.spent_amount || 0), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-800">
            Monthly Budgets
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Set and monitor spending limits per category with smart alerts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 shadow-xs outline-none"
          />

          <button
            onClick={handleCopyPrevious}
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy previous month's limits"
          >
            <Copy className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Copy Last Month</span>
          </button>

          <button
            onClick={() => { setEditingBudget(null); setModalOpen(true); }}
            className="px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {message}
        </div>
      )}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Total Budget Limit</span>
          <p className="text-2xl font-extrabold text-stone-800 mt-1">₹{totalLimit.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Total Spent So Far</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Total Remaining</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">₹{totalRemaining.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Budgets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            Loading your budget limits...
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-12 text-center shadow-xs">
            <span className="text-4xl">🎯</span>
            <h3 className="mt-2 text-base font-bold text-stone-800">No budgets set for this month</h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              Setting category budgets helps keep variable expenses under control and saves more paise!
            </p>
            <button
              onClick={() => { setEditingBudget(null); setModalOpen(true); }}
              className="mt-4 px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold"
            >
              + Create Category Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const pct = b.percentage_used || 0;
              const isOver = pct >= 100;
              const isWarning = pct >= 80 && pct < 100;

              return (
                <div
                  key={b.id}
                  className="rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-base"
                          style={{
                            backgroundColor: `${b.category_detail?.color || '#10b981'}20`,
                            color: b.category_detail?.color || '#10b981',
                          }}
                        >
                          🏷️
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-800">{b.category_detail?.name}</h4>
                          <span className="text-[11px] text-stone-400">Monthly Target</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {isOver ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Over Budget
                          </span>
                        ) : isWarning ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> 80% Used
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> On Track
                          </span>
                        )}

                        <button
                          onClick={() => { setEditingBudget(b); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Numbers row */}
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-stone-500">Spent:</span>
                        <span className="text-sm font-bold text-stone-800 ml-1">
                          ₹{parseFloat(b.spent_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-500">Limit:</span>
                        <span className="text-sm font-bold text-stone-800 ml-1">
                          ₹{parseFloat(b.limit_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                    <span>{pct}% of limit used</span>
                    <span className="font-semibold text-stone-700">
                      ₹{parseFloat(b.remaining_amount).toLocaleString('en-IN')} remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchBudgets}
        initialData={editingBudget}
        selectedMonth={month}
      />
    </div>
  );
}
