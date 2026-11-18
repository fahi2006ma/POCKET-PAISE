import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ReceiptText,
  Target,
  BarChart3,
  Trophy,
  Lightbulb,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import PocketPaiseLogo from './PocketPaiseLogo';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose, onOpenAddModal }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Expense', action: onOpenAddModal, icon: PlusCircle, isAction: true },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Budgets', path: '/budgets', icon: Target },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Goals', path: '/goals', icon: Trophy },
    { name: 'Insights', path: '/insights', icon: Lightbulb },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#fcf8f5]/95 backdrop-blur-md border-r border-[#ebdcd3] p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header with Logo */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-200/60">
            <NavLink to="/dashboard" onClick={onClose}>
              <PocketPaiseLogo size="md" />
            </NavLink>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              if (item.isAction) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.action) item.action();
                      if (onClose) onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-stone-700 hover:text-emerald-900 hover:bg-emerald-50/70 font-medium text-sm transition-all group cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-emerald-700 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-sm transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md shadow-emerald-900/20'
                        : 'text-stone-700 hover:text-emerald-900 hover:bg-emerald-50/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-emerald-200' : 'text-stone-500'
                        }`}
                      />
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 space-y-4">
          {/* Motivational pastel card from the UI draft */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#fbeee6] to-[#f5dfd5] p-3.5 border border-[#eed1c4] overflow-hidden shadow-xs">
            <div className="flex items-center gap-1.5 mb-1 text-emerald-800 font-semibold text-xs">
              <span>🌿</span>
              <span>Daily Wisdom</span>
            </div>
            <p className="font-script text-xl text-stone-800 font-medium leading-tight">
              Small steps... Big financial dreams <span className="text-rose-400">♡</span>
            </p>
            <div className="absolute -bottom-3 -right-2 text-3xl opacity-20 pointer-events-none">
              🌸
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-stone-600 hover:text-rose-700 hover:bg-rose-50/80 font-medium text-sm transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-stone-400 hover:text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
