// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

// Charts
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Components
import SettingsForm from '../components/admin/SettingsForm';
import AdminApprovals from '../components/admin/AdminApprovals';
import VendorLogins from '../components/admin/VendorLogins';
import UserLogins from '../components/admin/UserLogins';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import VendorApprovals from '../components/admin/VendorApprovals';

/* -------------------------------------------------------------------------- */
/* ICONS (Simple SVG icons)                                                   */
/* -------------------------------------------------------------------------- */
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Categories: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Approval: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Vendor: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Products: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Revenue: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  TrendDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  PanelLeftClose: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16v14H4zM9 5v14M15 9l-3 3 3 3" />
    </svg>
  ),
  PanelLeftOpen: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16v14H4zM9 5v14M12 9l3 3-3 3" />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/* TABS CONFIG                                                                */
/* -------------------------------------------------------------------------- */
const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { key: 'settings', label: 'Site Settings', icon: Icons.Settings },
  { key: 'categories', label: 'Categories', icon: Icons.Categories },
  { key: 'approvals', label: 'Product Approvals', icon: Icons.Approval },
  { key: 'vendorApprovals', label: 'Vendor Requests', icon: Icons.Vendor },
  { key: 'vendors', label: 'Vendor Logins', icon: Icons.Vendor },
  { key: 'users', label: 'User Logins', icon: Icons.Users },
  { key: 'allproducts', label: 'All Products', icon: Icons.Products },
];

/* -------------------------------------------------------------------------- */
/* CHART COLORS                                                               */
/* -------------------------------------------------------------------------- */
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  slate: '#64748b',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const SIDEBAR_STORAGE_KEY = 'admin-dashboard-sidebar-collapsed';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCurrency = (value) => `₹${formatNumber(value)}`;
const getChangeType = (value) => (Number(value || 0) >= 0 ? 'increase' : 'decrease');
const getRangeLabel = (range) => {
  switch (range) {
    case '7days':
      return 'last 7 days';
    case '90days':
      return 'last 90 days';
    case '365days':
      return 'last 12 months';
    default:
      return 'last 30 days';
  }
};

const getDefaultStats = () => ({
  meta: {},
  overview: {
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingApprovals: 0,
    pendingVendorRequests: 0,
  },
  periodSummary: {
    revenue: 0,
    orders: 0,
    users: 0,
    vendors: 0,
  },
  quickStats: {
    activeUsers: 0,
    activeVendors: 0,
    avgOrderValue: 0,
    rangeRevenue: 0,
  },
  changes: {
    users: 0,
    vendors: 0,
    orders: 0,
    revenue: 0,
  },
  salesChart: [],
  registrationChart: [],
  orderStatusChart: [],
  categoryChart: [],
  topProducts: [],
  topVendors: [],
  recentActivity: [],
  revenueByDay: [],
});

/* -------------------------------------------------------------------------- */
/* STAT CARD COMPONENT                                                        */
/* -------------------------------------------------------------------------- */
function StatCard({ title, value, change, changeType, icon: Icon, color, subtitle }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              changeType === 'increase' ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {changeType === 'increase' ? <Icons.TrendUp /> : <Icons.TrendDown />}
              <span>{change}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color] || 'bg-blue-500'}`}>
          <div className="text-white">
            {Icon && <Icon />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MINI STAT CARD                                                             */
/* -------------------------------------------------------------------------- */
function MiniStatCard({ label, value, color }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${color || 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RECENT ACTIVITY ITEM                                                       */
/* -------------------------------------------------------------------------- */
function ActivityItem({ type, title, description, time, avatar }) {
  const typeColors = {
    order: 'bg-blue-100 text-blue-600',
    user: 'bg-emerald-100 text-emerald-600',
    vendor: 'bg-purple-100 text-purple-600',
    product: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={`p-2 rounded-full ${typeColors[type] || 'bg-slate-100 text-slate-600'}`}>
        {type === 'order' && <Icons.Orders />}
        {type === 'user' && <Icons.Users />}
        {type === 'vendor' && <Icons.Vendor />}
        {type === 'product' && <Icons.Products />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 truncate">{description}</p>
      </div>
      <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TOP ITEM ROW                                                               */
/* -------------------------------------------------------------------------- */
function TopItemRow({ rank, name, value, subtext, image }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
        {rank}
      </span>
      {image && (
        <img src={image} alt={name} className="w-8 h-8 rounded-lg object-cover" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
        {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD OVERVIEW COMPONENT                                               */
/* -------------------------------------------------------------------------- */
function DashboardOverview({ token }) {
  const [stats, setStats] = useState(getDefaultStats());
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, [token, dateRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosClient.get(`/api/admin/dashboard-stats?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        ...getDefaultStats(),
        ...res.data,
        overview: { ...getDefaultStats().overview, ...(res.data?.overview || {}) },
        periodSummary: { ...getDefaultStats().periodSummary, ...(res.data?.periodSummary || {}) },
        quickStats: { ...getDefaultStats().quickStats, ...(res.data?.quickStats || {}) },
        changes: { ...getDefaultStats().changes, ...(res.data?.changes || {}) },
      });
    } catch (err) {
      console.error('fetchDashboardStats', err);
      setStats(getDefaultStats());
      setError('Dashboard stats load nahi ho paaye. Backend response check karo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time admin analytics for {getRangeLabel(dateRange)}.
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="365days">Last Year</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.periodSummary.revenue)}
          change={stats.changes.revenue}
          changeType={getChangeType(stats.changes.revenue)}
          icon={Icons.Revenue}
          color="blue"
          subtitle={`Lifetime ${formatCurrency(stats.overview.totalRevenue)}`}
        />
        <StatCard
          title="Orders"
          value={formatNumber(stats.periodSummary.orders)}
          change={stats.changes.orders}
          changeType={getChangeType(stats.changes.orders)}
          icon={Icons.Orders}
          color="green"
          subtitle={`${formatNumber(stats.overview.pendingOrders)} pending right now`}
        />
        <StatCard
          title="New Users"
          value={formatNumber(stats.periodSummary.users)}
          change={stats.changes.users}
          changeType={getChangeType(stats.changes.users)}
          icon={Icons.Users}
          color="purple"
          subtitle={`Lifetime ${formatNumber(stats.overview.totalUsers)}`}
        />
        <StatCard
          title="New Vendors"
          value={formatNumber(stats.periodSummary.vendors)}
          change={stats.changes.vendors}
          changeType={getChangeType(stats.changes.vendors)}
          icon={Icons.Vendor}
          color="orange"
          subtitle={`${formatNumber(stats.overview.pendingVendorRequests)} requests pending`}
        />
      </div>

      {/* Alert Cards for Pending Items */}
      {(stats.overview.pendingApprovals > 0 || stats.overview.pendingVendorRequests > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.overview.pendingApprovals > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Icons.Approval />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {stats.overview.pendingApprovals} Products Pending Approval
                </p>
                <p className="text-xs text-amber-600">Review and approve new product listings</p>
              </div>
            </div>
          )}
          {stats.overview.pendingVendorRequests > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icons.Vendor />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-800">
                  {stats.overview.pendingVendorRequests} Vendor Requests
                </p>
                <p className="text-xs text-purple-600">New vendors waiting for approval</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts Row 1: Sales & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Sales Overview</h3>
              <p className="text-xs text-slate-500">Monthly sales and orders trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Sales (₹)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Orders
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.salesChart}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                stroke={COLORS.primary}
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke={COLORS.success}
                strokeWidth={2}
                fill="url(#ordersGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Day */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Weekly Revenue</h3>
          <p className="text-xs text-slate-500 mb-4">Revenue distribution by day</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Registrations & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User & Vendor Registrations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Registrations</h3>
              <p className="text-xs text-slate-500">New users and vendors over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                Users
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                Vendors
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.registrationChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="users" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="vendors" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Order Status</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of order statuses</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.orderStatusChart}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {stats.orderStatusChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
                formatter={(value) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {stats.orderStatusChart.map((entry, index) => (
              <span key={index} className="flex items-center gap-1 text-xs text-slate-600">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                ></span>
                {entry.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Products, Vendors & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Top Products</h3>
            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
              View All
            </span>
          </div>
          <div className="space-y-1">
            {stats.topProducts.map((product, index) => (
              <TopItemRow
                key={product.id}
                rank={index + 1}
                name={product.name}
                value={`₹${product.revenue.toLocaleString()}`}
                subtext={`${product.sales} sold`}
                image={product.image}
              />
            ))}
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Top Vendors</h3>
            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
              View All
            </span>
          </div>
          <div className="space-y-1">
            {stats.topVendors.map((vendor, index) => (
              <TopItemRow
                key={vendor.id}
                rank={index + 1}
                name={vendor.name}
                value={`₹${vendor.revenue.toLocaleString()}`}
                subtext={`${vendor.orders} orders`}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
              View All
            </span>
          </div>
          <div className="space-y-0">
            {stats.recentActivity.map((activity, index) => (
              <ActivityItem
                key={index}
                type={activity.type}
                title={activity.title}
                description={activity.description}
                time={activity.time}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Sales by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Product category distribution</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.categoryChart}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {stats.categoryChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MiniStatCard label="Total Products" value={formatNumber(stats.overview.totalProducts)} />
            <MiniStatCard label="Active Users" value={formatNumber(stats.quickStats.activeUsers)} />
            <MiniStatCard label="Active Vendors" value={formatNumber(stats.quickStats.activeVendors)} />
            <MiniStatCard label="Pending Orders" value={formatNumber(stats.overview.pendingOrders)} color="text-amber-600" />
            <MiniStatCard label="Range Revenue" value={formatCurrency(stats.quickStats.rangeRevenue)} color="text-emerald-600" />
            <MiniStatCard label="Avg Order Value" value={formatCurrency(stats.quickStats.avgOrderValue)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN ADMIN DASHBOARD                                                       */
/* -------------------------------------------------------------------------- */
export default function AdminDashboard() {
  const { auth, logout } = useAuth();
  const token = auth.token;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchSettings();
  }, [token]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {mobileSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      <div className="flex">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`fixed left-0 top-16 lg:top-[72px] h-[calc(100vh-4rem)] lg:h-[calc(100vh-72px)] bg-white border-r border-slate-200 shadow-sm z-40 transition-all duration-300 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${
            sidebarCollapsed ? 'lg:w-24' : 'lg:w-72'
          } w-72 lg:translate-x-0
          }`}
        >
          {/* Logo / Brand */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-bold text-slate-900">Admin Panel</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:inline-flex p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              {sidebarCollapsed ? <Icons.PanelLeftOpen /> : <Icons.PanelLeftClose />}
            </button>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="inline-flex lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <Icons.Close />
            </button>
          </div>

          {/* Admin Info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {auth.user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {auth.user?.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{auth.user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === t.key
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  } ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
                  title={sidebarCollapsed ? t.label : undefined}
                >
                  <Icon />
                  {!sidebarCollapsed && <span>{t.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 bg-white">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all`}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <Icons.Logout />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main
          className={`flex-1 min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-72'
          }`}
        >
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-16 lg:top-[72px] z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <Icons.Menu />
              </button>
              <button
                onClick={() => setSidebarCollapsed((current) => !current)}
                className="hidden lg:inline-flex p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <Icons.PanelLeftOpen /> : <Icons.PanelLeftClose />}
              </button>
              <h1 className="text-lg font-semibold text-slate-900">
                {TABS.find((t) => t.key === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6">
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && <DashboardOverview token={token} />}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Site Settings</h2>
                <SettingsForm token={token} settings={settings} onSaved={handleSettingsSaved} />
              </div>
            )}

            {/* CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Product Categories</h2>
                <AdminCategories token={token} />
              </div>
            )}

            {/* PRODUCT APPROVALS */}
            {activeTab === 'approvals' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Product Approvals</h2>
                <AdminApprovals token={token} />
              </div>
            )}

            {/* VENDOR APPROVALS */}
            {activeTab === 'vendorApprovals' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Vendor Approval Requests</h2>
                <VendorApprovals token={token} />
              </div>
            )}

            {/* VENDORS */}
            {activeTab === 'vendors' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Vendor Logins</h2>
                <VendorLogins token={token} />
              </div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">User Logins</h2>
                <UserLogins token={token} />
              </div>
            )}

            {/* ALL PRODUCTS */}
            {activeTab === 'allproducts' && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <AdminProducts token={token} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
