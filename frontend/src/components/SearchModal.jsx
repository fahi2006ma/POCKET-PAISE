import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, Clock } from 'lucide-react';
import { transactionAPI } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await transactionAPI.list({ search: query.trim(), page_size: 8 });
        setResults(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search transactions by title, merchant, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm md:text-base outline-none text-stone-800 placeholder:text-stone-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] bg-stone-100 text-stone-500 rounded border border-stone-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-stone-400">Searching your records...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5">
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate('/transactions');
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: `${item.category_detail?.color || '#10b981'}20`,
                        color: item.category_detail?.color || '#10b981',
                      }}
                    >
                      {item.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800 group-hover:text-emerald-900">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                        <span>{item.category_detail?.name}</span>
                        <span>•</span>
                        <span>{item.payment_method?.toUpperCase()}</span>
                        <span>•</span>
                        <span>{new Date(item.date_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        item.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {item.type === 'income' ? '+' : '-'} ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="py-8 text-center text-xs text-stone-400">
              No transactions matching "{query}"
            </div>
          ) : (
            <div className="py-6 px-4 text-center text-stone-400 text-xs">
              Type to quickly locate any expense, merchant, or income entry
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
