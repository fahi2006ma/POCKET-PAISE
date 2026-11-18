import React, { useState, useEffect } from 'react';
import { User, Lock, Tag, Bell, ShieldAlert, Download, Trash2, Check, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileAPI, authAPI, categoryAPI, transactionAPI } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatColor, setNewCatColor] = useState('#10b981');
  const [catMsg, setCatMsg] = useState('');

  // Delete Account
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.list();
      setCategories(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileLoading(true);
    try {
      const res = await profileAPI.updateMe({
        full_name: fullName.trim(),
        phone: phone.trim(),
        currency,
      });
      updateUser(res.data);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setProfileMsg('Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({ old_password: oldPassword, new_password: newPassword });
      setPasswordMsg('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Failed to change password.';
      setPasswordErr(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCatMsg('');
    if (!newCatName.trim()) return;
    try {
      await categoryAPI.create({
        name: newCatName.trim(),
        type: newCatType,
        color: newCatColor,
        icon: 'Folder',
      });
      setNewCatName('');
      setCatMsg('Custom category added!');
      fetchCategories();
    } catch (err) {
      console.error(err);
      setCatMsg('Failed to add category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await categoryAPI.delete(id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Default categories cannot be deleted.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteErr('Please enter your password to confirm account deletion.');
      return;
    }
    if (!window.confirm('WARNING: This will permanently delete your account and all financial transactions. Are you absolutely sure?')) {
      return;
    }

    setIsDeleting(true);
    setDeleteErr('');
    try {
      await profileAPI.deleteMe(deletePassword);
      await logout();
      navigate('/register');
    } catch (err) {
      setDeleteErr(err.response?.data?.password?.[0] || 'Incorrect password.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-800">
          Account & App Settings
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
          Customize your profile, categories, security, and data preferences
        </p>
      </div>

      {/* Profile Info */}
      <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <User className="w-5 h-5 text-emerald-800" />
          <h2 className="font-bold text-base text-stone-800 font-display">Personal Profile</h2>
        </div>

        {profileMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 rounded-2xl bg-stone-100 border border-stone-200 text-sm text-stone-500 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300 text-sm outline-none"
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="px-5 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Manage Categories */}
      <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Tag className="w-5 h-5 text-emerald-800" />
          <h2 className="font-bold text-base text-stone-800 font-display">Manage Categories</h2>
        </div>

        {catMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
            {catMsg}
          </div>
        )}

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            required
            placeholder="New Category Name..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 min-w-[180px] px-3.5 py-2 rounded-2xl bg-white border border-stone-300 text-xs outline-none focus:border-emerald-600"
          />

          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-white border border-stone-300 text-xs text-stone-700 outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="w-10 h-9 rounded-xl border border-stone-300 cursor-pointer p-0.5"
            title="Pick category color"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>

        {/* Categories Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-2"
              style={{
                backgroundColor: `${c.color || '#10b981'}15`,
                borderColor: `${c.color || '#10b981'}40`,
                color: c.color || '#10b981',
              }}
            >
              <span>{c.name}</span>
              <span className="text-[10px] text-stone-400 font-normal">({c.type})</span>
              {!c.is_default && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(c.id)}
                  className="hover:text-rose-600 cursor-pointer ml-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security - Change Password */}
      <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Lock className="w-5 h-5 text-emerald-800" />
          <h2 className="font-bold text-base text-stone-800 font-display">Security & Password</h2>
        </div>

        {passwordMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
            {passwordMsg}
          </div>
        )}
        {passwordErr && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {passwordErr}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">New Password (min 8 chars, 1 letter + 1 digit)</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-white border border-stone-300 text-sm outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            {passwordLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Export & Danger Zone */}
      <div className="rounded-3xl bg-white/90 border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Download className="w-5 h-5 text-emerald-800" />
          <h2 className="font-bold text-base text-stone-800 font-display">Data Privacy & Export</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
          <div>
            <h4 className="text-xs font-bold text-stone-800">Export All Financial Records</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Download all your recorded transactions as a clean spreadsheet (CSV) compliant with India's DPDP Act.
            </p>
          </div>
          <a
            href={transactionAPI.exportUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Data</span>
          </a>
        </div>

        {/* Delete Account */}
        <div className="mt-4 pt-4 border-t border-rose-100 p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-sm">Danger Zone: Delete Account</h3>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Permanently deletes your user account, all transactions, budgets, savings goals, and notification records.
          </p>

          {deleteErr && (
            <div className="mt-2 text-xs font-semibold text-rose-600">
              {deleteErr}
            </div>
          )}

          <div className="mt-3 flex flex-col sm:flex-row items-center gap-2 max-w-md">
            <input
              type="password"
              placeholder="Confirm your password to delete"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 text-xs text-stone-800 outline-none"
            />
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
