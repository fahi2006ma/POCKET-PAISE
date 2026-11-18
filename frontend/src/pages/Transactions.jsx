import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
  Calendar,
  X
} from 'lucide-react';
import { transactionAPI, categoryAPI } from '../api/client';
import TransactionModal from '../components/TransactionModal';

export default function Transactions() {
  const { refreshTrigger, onOpenAddModal } = useOutletContext();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ordering, setOrdering] = useState('-date_time');
  const [showFilters, setShowFilters] = useState(false);

  // Edit & Delete modals
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        ordering,
      };
      if (search.trim()) params.search = search.trim();
      if (type) params.type = type;
      if (categoryId) params.category = categoryId;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await transactionAPI.list(params);
      if (res.data.results) {
        setTransactions(res.data.results);
        setCount(res.data.count || res.data.results.length);
      } else if (Array.isArray(res.data)) {
        setTransactions(res.data);
        setCount(res.data.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    categoryAPI.list().then((res) => {
      setCategories(res.data.results || res.data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, type, categoryId, paymentMethod, startDate, endDate, ordering, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setCategoryId('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setOrdering('-date_time');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setIsDeleting(true);
    try {
      await transactionAPI.delete(deletingTransaction.id);
      setDeletingTransaction(null);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(count / 20) || 1;

  const exportUrl = transactionAPI.exportUrl({
    search,
    type,
    category: categoryId,
    payment_method: paymentMethod,
    start_date: startDate,
    end_date: endDate,
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-800">
            Transactions History
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Manage, filter, and export all your income and expenses entries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={exportUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Paise</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by merchant, title, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs sm:text-sm text-stone-800 focus:bg-white focus:border-emerald-600 outline-none transition-all"
            />
          </form>

          {/* Quick Type Selector */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200/70 w-full sm:w-auto">
            <button
              onClick={() => { setType(''); setPage(1); }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                type === '' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setType('expense'); setPage(1); }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                type === 'expense' ? 'bg-rose-500 text-white shadow-xs' : 'text-stone-500'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => { setType('income'); setPage(1); }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                type === 'income' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-500'
              }`}
            >
              Income
            </button>
          </div>

          {/* Toggle More Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-2xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              showFilters || categoryId || paymentMethod || startDate || endDate
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 outline-none"
              >
                <option value="">All Methods</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="netbanking">Net Banking</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 outline-none"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-1">
              <button
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-3xl bg-white/90 border border-stone-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            Loading your transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <span className="text-4xl">🍃</span>
            <h3 className="mt-2 text-base font-bold text-stone-800">No transactions recorded yet</h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              Start tracking by adding your daily income and expense receipts.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
            >
              + Record First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/70 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Merchant / Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-emerald-50/40 transition-colors group">
                    <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(t.date_time).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      <div>{t.title}</div>
                      {t.notes && (
                        <p className="text-[11px] text-stone-400 font-normal truncate max-w-xs">{t.notes}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${t.category_detail?.color || '#10b981'}15`,
                          color: t.category_detail?.color || '#10b981',
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.category_detail?.color || '#10b981' }} />
                        {t.category_detail?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 uppercase text-[11px] font-medium whitespace-nowrap">
                      {t.payment_method}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-extrabold text-sm">
                      <span className={t.type === 'income' ? 'text-emerald-700' : 'text-rose-600'}>
                        {t.type === 'income' ? '+' : '-'} ₹{parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingTransaction(t)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTransaction(t)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {transactions.length > 0 && (
          <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing {transactions.length} of {count} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-stone-700">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <TransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={fetchTransactions}
          initialData={editingTransaction}
        />
      )}

      {/* Delete Confirmation Dialog (SRS FR-TXN-07) */}
      {deletingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-800">Delete Transaction?</h3>
            <p className="text-xs text-stone-500 mt-1.5">
              Are you sure you want to delete <span className="font-semibold text-stone-700">"{deletingTransaction.title}"</span> (₹{parseFloat(deletingTransaction.amount).toLocaleString()})? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                onClick={() => setDeletingTransaction(null)}
                className="px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
