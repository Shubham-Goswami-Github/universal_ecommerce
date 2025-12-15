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

  // page state
  const [activeTab, setActiveTab] = useState('settings');

  // settings
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
    // notify other components (navbar) to reload settings instantly
    window.dispatchEvent(new Event('settings:updated'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
      {/* Sidebar */}
      <aside className="lg:col-span-1 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">Admin Panel</h3>

        <nav className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === t.key
                  ? 'bg-teal-400 text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-6 text-xs text-slate-400">
          <div>Logged in as:</div>
          <div className="mt-1 text-sm font-semibold text-slate-100">{auth.user?.name}</div>
          <div className="text-xs text-slate-500">{auth.user?.email}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:col-span-5 space-y-6">
        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">Site Settings</h2>
            <SettingsForm token={token} settings={settings} onSaved={handleSettingsSaved} />
          </div>
        )}

        {/* Approvals */}
        {activeTab === 'approvals' && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">Pending Approvals</h2>
            <AdminApprovals token={token} />
          </div>
        )}

        {/* Vendor logins */}
        {activeTab === 'vendors' && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">Vendor Logins</h2>
            <VendorLogins token={token} />
          </div>
        )}

        {/* User logins */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">User Logins</h2>
            <UserLogins token={token} />
          </div>
        )}

        {/* All Products (admin) */}
        {activeTab === 'allproducts' && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-100 mb-3">All Products (Vendor-wise)</h2>
            <p className="text-xs text-slate-400 mb-4">Products are grouped by vendor. You can edit, delete or hide/show items here.</p>
            <AdminProducts token={token} />
          </div>
        )}
      </main>
    </div>
  );
}
