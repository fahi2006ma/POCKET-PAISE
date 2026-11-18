import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Eye,
  EyeOff,
  ChevronRight,
  TrendingUp,
  Plus,
  ArrowDown,
  Target,
  BarChart2,
  Check,
  MoreVertical,
  Crown,
  Sparkles,
  Plane
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import CozyBanner from '../components/CozyBanner';
import GoalContributionModal from '../components/GoalContributionModal';
import { dashboardAPI } from '../api/client';

export default function Dashboard() {
  const { refreshTrigger, onOpenAddModal } = useOutletContext();
  const navigate = useNavigate();

  const [hideBalance, setHideBalance] = useState(false);
  const [trendType, setTrendType] = useState('expense'); // 'income' or 'expense'
  const [summaryData, setSummaryData] = useState(null);
  const [spendingData, setSpendingData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const [sumRes, spendRes, trendRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getSpendingByCategory(),
        dashboardAPI.getTrend(6),
      ]);
      setSummaryData(sumRes.data);
      setSpendingData(spendRes.data);
      setTrendData(trendRes.data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [refreshTrigger]);

  const formatRupee = (num) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Pre-seed fallbacks if newly registered user has empty data
  const totalBalance = summaryData?.total_balance ?? 24580;
  const totalIncome = summaryData?.total_income ?? 18000;
  const totalExpenses = summaryData?.total_expenses ?? 13420;
  const savings = summaryData?.savings ?? 11160;

  const score = summaryData?.financial_score?.score ?? 92;
  const scoreLabel = summaryData?.financial_score?.label ?? 'Excellent!';
  const scoreMessage = summaryData?.financial_score?.message ?? "You're a smart spender 💚";

  const categories = spendingData?.categories?.length > 0
    ? spendingData.categories
    : [
        { name: 'Food & Dining', amount: 4290, percentage: 32, color: '#10b981' },
        { name: 'Shopping', amount: 3750, percentage: 28, color: '#f43f5e' },
        { name: 'Travel', amount: 2420, percentage: 18, color: '#38bdf8' },
        { name: 'Bills', amount: 1610, percentage: 12, color: '#f59e0b' },
        { name: 'Others', amount: 1350, percentage: 10, color: '#a78bfa' },
      ];

  const totalSpent = spendingData?.total_spent ?? totalExpenses;

  const nearestGoal = summaryData?.nearest_goal || {
    id: 1,
    name: 'Next Trip ✈️',
    target_amount: 25000,
    saved_amount: 10000,
    percentage: 40,
    remaining_amount: 15000,
  };

  const recentTransactions = summaryData?.recent_transactions?.length > 0
    ? summaryData.recent_transactions
    : [
        { id: 1, title: 'Burger King', category_detail: { name: 'Food & Dining', color: '#10b981' }, amount: '350.00', type: 'expense', date_time: '2026-11-16T19:30:00' },
        { id: 2, title: 'Zudio', category_detail: { name: 'Shopping', color: '#f43f5e' }, amount: '1200.00', type: 'expense', date_time: '2026-11-15T17:45:00' },
        { id: 3, title: 'Bus Ticket', category_detail: { name: 'Travel', color: '#38bdf8' }, amount: '100.00', type: 'expense', date_time: '2026-11-14T20:20:00' },
        { id: 4, title: 'Part-time Work', category_detail: { name: 'Income', color: '#10b981' }, amount: '5000.00', type: 'income', date_time: '2026-11-13T10:00:00' },
      ];

  return (
    <div className="space-y-6">
      {/* 1. Cozy Banner */}
      <CozyBanner onQuickAdd={onOpenAddModal} />

      {/* 2. Four Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Balance Card (Deep Green Glossy Gradient) */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#12392b] via-[#0d2b20] to-[#061812] text-white p-5 shadow-lg shadow-emerald-950/20 border border-emerald-800/40 overflow-hidden flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xs">
                <Wallet className="w-5 h-5 text-amber-200" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-emerald-200/90">Total Balance</span>
            </div>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-emerald-300/80 transition-colors cursor-pointer"
              title="Toggle visibility"
            >
              {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-display font-extrabold tracking-tight text-white">
              {hideBalance ? '••••••' : `₹${formatRupee(totalBalance)}`}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
              <span className="inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+8%</span>
              </span>
              <span className="text-emerald-400/60 font-normal">from last month</span>
            </div>
          </div>
        </div>

        {/* Total Income Card (Pastel Mint) */}
        <div className="rounded-3xl bg-[#edf7f1] border border-[#cfead8] p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-600">Total Income</span>
          </div>

          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-display font-extrabold text-stone-800 tracking-tight">
              {hideBalance ? '••••••' : `₹${formatRupee(totalIncome)}`}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <span>↑ +12%</span>
              <span className="text-stone-400 font-normal">from last month</span>
            </div>
          </div>
        </div>

        {/* Total Expenses Card (Pastel Rose) */}
        <div className="rounded-3xl bg-[#fdf2f2] border border-[#fbd6d6] p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-600">Total Expenses</span>
          </div>

          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-display font-extrabold text-stone-800 tracking-tight">
              {hideBalance ? '••••••' : `₹${formatRupee(totalExpenses)}`}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
              <span>↑ +5%</span>
              <span className="text-stone-400 font-normal">from last month</span>
            </div>
          </div>
        </div>

        {/* Savings Card (Pastel Apricot Peach) */}
        <div className="rounded-3xl bg-[#fff6ec] border border-[#fee4cc] p-5 shadow-xs flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-stone-600">Savings</span>
          </div>

          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-display font-extrabold text-stone-800 tracking-tight">
              {hideBalance ? '••••••' : `₹${formatRupee(savings)}`}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
              <span>↑ +15%</span>
              <span className="text-stone-400 font-normal">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Spending Overview + Monthly Trend + Financial Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Spending Overview (Donut Chart) - 4 cols */}
        <div className="lg:col-span-4 rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-sm text-stone-800 font-display">Spending Overview</h3>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200/60">
              This Month
            </span>
          </div>

          {/* Donut Chart with Center Text */}
          <div className="relative h-44 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-emerald-800 text-sm">🌱</span>
              <span className="text-base font-extrabold text-stone-800">
                ₹{formatRupee(totalSpent)}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">Total Spent</span>
            </div>
          </div>

          {/* Categories List Legend */}
          <div className="space-y-2 mt-1">
            {categories.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color || '#10b981' }}
                  />
                  <span className="text-stone-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500">
                  <span>{cat.percentage}%</span>
                  <span className="font-semibold text-stone-800">₹{formatRupee(cat.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Area Chart - 5 cols */}
        <div className="lg:col-span-5 rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-sm text-stone-800 font-display">Monthly Trend</h3>
            </div>
            {/* Toggle Income / Expense */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200/60">
              <button
                onClick={() => setTrendType('income')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  trendType === 'income' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setTrendType('expense')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  trendType === 'expense' ? 'bg-stone-800 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-56 mt-2 relative">
            {/* Highlight Badge on Current Month */}
            <div className="absolute top-2 right-4 z-10 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 shadow-xs">
              ₹{formatRupee(trendType === 'expense' ? totalExpenses : totalIncome)}
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.length > 0 ? trendData : [
                { month: 'Jun', income: 15000, expense: 12000 },
                { month: 'Jul', income: 16000, expense: 12500 },
                { month: 'Aug', income: 16500, expense: 13000 },
                { month: 'Sep', income: 17000, expense: 12800 },
                { month: 'Oct', income: 17500, expense: 13100 },
                { month: 'Nov', income: 18000, expense: 13420 },
              ]}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={trendType === 'expense' ? '#f43f5e' : '#10b981'}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={trendType === 'expense' ? '#f43f5e' : '#10b981'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, trendType === 'expense' ? 'Expense' : 'Income']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey={trendType}
                  stroke={trendType === 'expense' ? '#f43f5e' : '#059669'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                  dot={{ r: 3, fill: trendType === 'expense' ? '#f43f5e' : '#059669' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Your Financial Score Card - 3 cols (Dark Emerald) */}
        <div className="lg:col-span-3 rounded-3xl bg-gradient-to-br from-[#1b3d2f] via-[#132c22] to-[#091712] text-white p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-200/90 flex items-center gap-1.5">
              <span>Your Financial Score</span>
              <span className="text-rose-400">♡</span>
            </span>
            <Crown className="w-4 h-4 text-amber-300" />
          </div>

          {/* Circular Score Gauge */}
          <div className="my-4 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#2d5242"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="8"
                  strokeDasharray={`${2.51 * score} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{score}</span>
                <span className="text-[10px] text-emerald-300/80 font-medium">/100</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-base font-bold text-white tracking-wide">{scoreLabel}</p>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">{scoreMessage}</p>
            </div>
          </div>

          <Link
            to="/insights"
            className="w-full py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-center text-xs font-semibold text-emerald-100 transition-colors cursor-pointer border border-white/10"
          >
            View Insights & Breakdown →
          </Link>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Transactions + Set Your Goal + Quick Actions + Motivational Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Recent Transactions (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <h3 className="font-bold text-sm text-stone-800 font-display">Recent Transactions</h3>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100 my-2">
            {recentTransactions.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shadow-xs"
                    style={{
                      backgroundColor: `${t.category_detail?.color || '#10b981'}15`,
                      color: t.category_detail?.color || '#10b981',
                    }}
                  >
                    {t.type === 'income' ? '💼' : '🛍️'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800 group-hover:text-emerald-800 transition-colors">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {t.category_detail?.name} • {new Date(t.date_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${
                      t.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'} ₹{formatRupee(t.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onOpenAddModal}
            className="w-full py-2 rounded-2xl bg-stone-100 hover:bg-stone-200/80 text-xs font-semibold text-stone-700 transition-colors text-center cursor-pointer mt-1"
          >
            + Add Another Transaction
          </button>
        </div>

        {/* Set Your Goal (3 cols) */}
        <div className="lg:col-span-3 rounded-3xl bg-[#fdfaf6] border border-[#ebdcd3] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-stone-800 font-display">Set Your Goal</h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <Link
              to="/goals"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Goal Jar Visual & Info */}
          <div className="my-2 flex items-center gap-4 bg-white/70 rounded-2xl p-3 border border-stone-200/60 shadow-xs">
            {/* Cute Mason Jar of Stars */}
            <div className="w-16 h-20 rounded-2xl bg-amber-50 border-2 border-amber-300/80 p-1 flex flex-col items-center justify-between shadow-xs relative">
              <div className="w-10 h-2 bg-amber-200 rounded-t-md border-b border-amber-300" />
              <div className="flex flex-wrap gap-1 justify-center py-1">
                <span className="text-[10px]">⭐</span>
                <span className="text-[10px]">⭐</span>
                <span className="text-[10px]">⭐</span>
                <span className="text-[10px]">⭐</span>
              </div>
              <div className="w-full h-1.5 bg-emerald-600/60 rounded-b-sm" />
            </div>

            <div>
              <div className="flex items-center gap-1 text-xs font-bold text-stone-800">
                <span>{nearestGoal.name}</span>
              </div>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">
                ₹{formatRupee(nearestGoal.target_amount)}
              </p>
              <span className="text-[10px] text-stone-400 font-medium">Target Amount</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-stone-500">Progress</span>
              <span className="text-emerald-800">{nearestGoal.percentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-700 rounded-full transition-all duration-500"
                style={{ width: `${nearestGoal.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-2 font-medium">
              ₹{formatRupee(nearestGoal.remaining_amount)} more to go!
            </p>
          </div>

          <button
            onClick={() => setSelectedGoalForContribution(nearestGoal)}
            className="w-full mt-3 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            + Add Savings to Goal
          </button>
        </div>

        {/* Quick Actions (2 cols on lg) */}
        <div className="lg:col-span-2 rounded-3xl bg-white/90 border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-sm text-stone-800 font-display mb-3">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-2.5 flex-1">
            {/* Add Expense Button */}
            <button
              onClick={onOpenAddModal}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fee2e2]/70 hover:bg-[#fee2e2] text-rose-700 transition-all border border-rose-200/50 cursor-pointer group"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-center leading-tight">Add Expense</span>
            </button>

            {/* Add Income Button */}
            <button
              onClick={onOpenAddModal}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#dcfce7]/70 hover:bg-[#dcfce7] text-emerald-800 transition-all border border-emerald-200/50 cursor-pointer group"
            >
              <ArrowDown className="w-5 h-5 transition-transform group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-center leading-tight">Add Income</span>
            </button>

            {/* Set Budget Button */}
            <button
              onClick={() => navigate('/budgets')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#f3e8ff]/70 hover:bg-[#f3e8ff] text-purple-700 transition-all border border-purple-200/50 cursor-pointer group"
            >
              <Target className="w-5 h-5 transition-transform group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-center leading-tight">Set Budget</span>
            </button>

            {/* View Reports Button */}
            <button
              onClick={() => navigate('/reports')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#e0f2fe]/70 hover:bg-[#e0f2fe] text-sky-700 transition-all border border-sky-200/50 cursor-pointer group"
            >
              <BarChart2 className="w-5 h-5 transition-transform group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-center leading-tight">View Reports</span>
            </button>
          </div>
        </div>

        {/* You're Doing Great! Motivational Card (3 cols) */}
        <div className="lg:col-span-3 rounded-3xl bg-gradient-to-br from-[#fbeee6] via-[#f7ded4] to-[#f4d1c4] p-5 shadow-xs border border-[#eed1c4] flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-script text-2xl md:text-3xl font-bold text-stone-800">
                You're doing great!
              </h3>
              <span className="text-rose-500 font-script text-2xl">♡</span>
            </div>

            <ul className="mt-3 space-y-2 text-xs font-semibold text-stone-700">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">✓</span>
                <span>Keep tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">✓</span>
                <span>Stay consistent</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">✓</span>
                <span>Reach your goals</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-2">
            <button
              onClick={() => navigate('/insights')}
              className="w-full py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Let's Go!</span>
              <span>→</span>
            </button>
          </div>

          {/* Decorative sprig */}
          <div className="absolute -bottom-3 -right-3 text-4xl opacity-20 pointer-events-none">
            🌸
          </div>
        </div>
      </div>

      {/* Goal Contribution Modal */}
      {selectedGoalForContribution && (
        <GoalContributionModal
          isOpen={!!selectedGoalForContribution}
          onClose={() => setSelectedGoalForContribution(null)}
          goal={selectedGoalForContribution}
          onSuccess={fetchDashboard}
        />
      )}
    </div>
  );
}
