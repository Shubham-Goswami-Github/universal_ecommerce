// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

import SettingsForm from '../components/admin/SettingsForm';
import AdminApprovals from '../components/admin/AdminApprovals';
import VendorLogins from '../components/admin/VendorLogins';
import UserLogins from '../components/admin/UserLogins';
import AdminProducts from '../components/admin/AdminProducts';

const TABS = [
  { key: 'settings', label: 'Site Settings' },
  { key: 'approvals', label: 'Pending Approvals' },
  { key: 'vendors', label: 'Vendor Logins' },
  { key: 'users', label: 'User Logins' },
  { key: 'allproducts', label: 'All Products' },
];

export default function AdminDashboard() {
  const { auth } = useAuth();
  const token = auth.token;

  const [activeTab, setActiveTab] = useState(null); // 👈 all hidden by default
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await axiosClient.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data.settings);
    } catch (err) {
      console.error('fetchSettings', err);
      setSettings(null);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSettingsSaved = (newSettings) => {
    setSettings(newSettings);
    window.dispatchEvent(new Event('settings:updated'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
      {/* ================= SIDEBAR ================= */}
      <aside className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4">
        {/* Admin Header */}
        <div className="mb-6 border-b border-slate-200 pb-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Admin Panel
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {auth.user?.name}
          </div>
          <div className="text-sm text-slate-500">
            {auth.user?.email}
          </div>
        </div>

        {/* Navigation (collapsed by default) */}
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() =>
                setActiveTab(activeTab === t.key ? null : t.key)
              }
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === t.key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="lg:col-span-5 space-y-6">
        {!activeTab && (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Welcome, {auth.user?.name} 👋
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Select an option from the left panel to manage the platform.
            </p>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Site Settings
            </h2>
            <SettingsForm
              token={token}
              settings={settings}
              onSaved={handleSettingsSaved}
            />
          </div>
        )}

        {/* APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Pending Approvals
            </h2>
            <AdminApprovals token={token} />
          </div>
        )}

        {/* VENDORS */}
        {activeTab === 'vendors' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Vendor Logins
            </h2>
            <VendorLogins token={token} />
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              User Logins
            </h2>
            <UserLogins token={token} />
          </div>
        )}

        {/* ALL PRODUCTS */}
        {activeTab === 'allproducts' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              All Products (Vendor-wise)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Products are grouped by vendor. You can edit, delete or manage items here.
            </p>
            <AdminProducts token={token} />
          </div>
        )}
      </main>
    </div>
  );
}
