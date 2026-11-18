import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, Check, User, LogOut, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onOpenSidebar, onOpenSearch, onOpenAddModal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.list();
      const list = res.data.results || res.data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markRead([]);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userInitial = user?.full_name ? user.full_name[0].toUpperCase() : 'P';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-[#fcf8f5]/85 backdrop-blur-md px-5 py-3.5 border-b border-[#eedcd2]">
      {/* Left: Mobile Menu & Search Box */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input matching draft */}
        <div
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 px-3.5 py-2 bg-white/80 hover:bg-white rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer transition-all group"
        >
          <Search className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition-colors" />
          <span className="text-xs md:text-sm text-stone-400 select-none">
            Search transactions, categories...
          </span>
          <span className="ml-auto hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-stone-500 bg-stone-100 border border-stone-200 rounded-md">
            Ctrl + K
          </span>
        </div>
      </div>

      {/* Right: Quick Actions, Notification Bell, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        <button
          onClick={onOpenAddModal}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-all hover:shadow cursor-pointer"
        >
          <span>+ Add Paise</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2.5 rounded-2xl bg-white/80 hover:bg-white border border-stone-200/70 text-stone-600 hover:text-emerald-800 transition-colors cursor-pointer shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-stone-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                <span className="font-semibold text-sm text-stone-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs transition-colors ${
                        n.is_read ? 'bg-stone-50/60 text-stone-600' : 'bg-emerald-50/70 text-emerald-950 font-medium border border-emerald-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${n.is_read ? 'text-stone-400' : 'text-emerald-600'}`} />
                        <div className="flex-1">
                          <p>{n.message}</p>
                          <span className="text-[10px] text-stone-400 block mt-1">
                            {new Date(n.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/80 hover:bg-white border border-stone-200/70 shadow-xs cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {userInitial}
            </div>
            <span className="text-xs font-semibold text-stone-700 pr-1 hidden sm:inline">
              {user?.full_name?.split(' ')[0] || 'Dreamer'}
            </span>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-stone-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <p className="text-xs font-bold text-stone-800">{user?.full_name}</p>
                <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-stone-500" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
