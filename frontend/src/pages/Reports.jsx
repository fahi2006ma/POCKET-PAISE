import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, PieChart as PieIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { reportAPI } from '../api/client';

export default function Reports() {
  const [period, setPeriod] = useState('this_month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const setPresetDates = (preset) => {
    setPeriod(preset);
    const now = new Date();
    let d1, d2;

    if (preset === 'this_month') {
      d1 = new Date(now.getFullYear(), now.getMonth(), 1);
      d2 = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (preset === 'last_month') {
      d1 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      d2 = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (preset === 'last_3_months') {
      d1 = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      d2 = now;
    } else if (preset === 'this_year') {
      d1 = new Date(now.getFullYear(), 0, 1);
      d2 = now;
    }

    if (d1 && d2) {
      setFromDate(d1.toISOString().slice(0, 10));
      setToDate(d2.toISOString().slice(0, 10));
    }
  };

  useEffect(() => {
    setPresetDates('this_month');
  }, []);

  const fetchSummary = async () => {
    if (!fromDate || !toDate) return;
    setIsLoading(true);
    try {
      const res = await reportAPI.getSummary(fromDate, toDate);
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [fromDate, toDate]);

  const pdfUrl = reportAPI.exportUrl('pdf', fromDate, toDate);
  const csvUrl = reportAPI.exportUrl('csv', fromDate, toDate);

  const topCategories = summary?.top_categories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-800">
            Financial Reports
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Download and analyze in-depth summaries of your cash flow and habits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={csvUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </a>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:shadow cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto bg-stone-100 p-1 rounded-2xl">
          {[
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'last_3_months', label: 'Last 3 Months' },
            { id: 'this_year', label: 'This Year' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPresetDates(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                period === tab.id
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Range Picker */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500 font-medium">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPeriod('custom'); }}
            className="px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 font-medium text-stone-700 outline-none"
          />
          <span className="text-stone-500 font-medium">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPeriod('custom'); }}
            className="px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 font-medium text-stone-700 outline-none"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Total Income</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            ₹{summary ? summary.total_income.toLocaleString('en-IN') : '0'}
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Total Expenses</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            ₹{summary ? summary.total_expenses.toLocaleString('en-IN') : '0'}
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Net Savings</span>
          <p className="text-2xl font-extrabold text-stone-800 mt-1">
            ₹{summary ? summary.savings.toLocaleString('en-IN') : '0'}
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Savings Rate</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">
            {summary ? summary.savings_rate : '0'}%
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Avg. Daily Spend</span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">
            ₹{summary ? summary.average_daily_spending.toLocaleString('en-IN') : '0'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Expense Categories Bar Chart */}
        <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-sm text-stone-800 font-display mb-4">
            Top Expense Categories
          </h3>
          <div className="h-64">
            {topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" fontSize={11} stroke="#64748b" width={110} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[0, 8, 8, 0]}>
                    {topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                No expense data in this period
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Categories Breakdown Table */}
        <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-800 font-display mb-3">
              Distribution & Percentages
            </h3>
            <div className="divide-y divide-stone-100">
              {topCategories.map((tc, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tc.color || '#10b981' }}
                    />
                    <span className="font-bold text-stone-800">{tc.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-stone-700">₹{tc.amount.toLocaleString('en-IN')}</span>
                    <span className="text-stone-400 w-12 text-right">{tc.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs text-stone-500">
            💡 Pro-tip: Keep discretionary expenses like dining and shopping below 40% of total outflow for optimal savings momentum.
          </div>
        </div>
      </div>
    </div>
  );
}
