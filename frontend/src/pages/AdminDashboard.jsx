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
  Legend,
  LineChart,
  Line,
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
/* ENHANCED ICONS WITH ANIMATIONS                                             */
/* -------------------------------------------------------------------------- */
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/* TABS CONFIG                                                                */
/* -------------------------------------------------------------------------- */
const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard, badge: null },
  { key: 'settings', label: 'Site Settings', icon: Icons.Settings, badge: null },
  { key: 'categories', label: 'Categories', icon: Icons.Categories, badge: null },
  { key: 'approvals', label: 'Product Approvals', icon: Icons.Approval, badge: 'pending' },
  { key: 'vendorApprovals', label: 'Vendor Requests', icon: Icons.Vendor, badge: 'vendorPending' },
  { key: 'vendors', label: 'Vendor Logins', icon: Icons.Vendor, badge: null },
  { key: 'users', label: 'User Logins', icon: Icons.Users, badge: null },
  { key: 'allproducts', label: 'All Products', icon: Icons.Products, badge: null },
];

/* -------------------------------------------------------------------------- */
/* ENHANCED COLOR PALETTE                                                     */
/* -------------------------------------------------------------------------- */
const COLORS = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#8b5cf6',
  success: '#10b981',
  successDark: '#059669',
  warning: '#f59e0b',
  warningDark: '#d97706',
  danger: '#ef4444',
  dangerDark: '#dc2626',
  info: '#06b6d4',
  infoDark: '#0891b2',
  slate: '#64748b',
  indigo: '#6366f1',
  pink: '#ec4899',
  teal: '#14b8a6',
};

const GRADIENT_COLORS = {
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-purple-500 to-pink-500',
  green: 'from-emerald-500 to-teal-500',
  orange: 'from-orange-500 to-red-500',
  indigo: 'from-indigo-500 to-purple-500',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
const SIDEBAR_STORAGE_KEY = 'admin-dashboard-sidebar-collapsed';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCurrency = (value) => `₹${formatNumber(value)}`;
const formatCompactNumber = (value) => {
  const num = Number(value || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};
const getChangeType = (value) => (Number(value || 0) >= 0 ? 'increase' : 'decrease');
const getRangeLabel = (range) => {
  switch (range) {
    case '7days':
      return 'Last 7 Days';
    case '90days':
      return 'Last 90 Days';
    case '365days':
      return 'Last Year';
    default:
      return 'Last 30 Days';
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
/* ENHANCED STAT CARD WITH ANIMATIONS                                         */
/* -------------------------------------------------------------------------- */
function StatCard({ title, value, change, changeType, icon: Icon, gradient, subtitle, compact = false }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1 tabular-nums">
            {compact && typeof value === 'number' ? formatCompactNumber(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                changeType === 'increase' 
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                  : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
              }`}>
                {changeType === 'increase' ? <Icons.TrendUp /> : <Icons.TrendDown />}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">
            {Icon && <Icon />}
          </div>
          {/* Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {change !== undefined && (
        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(Math.abs(change), 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MINI STAT CARD WITH ENHANCED DESIGN                                        */
/* -------------------------------------------------------------------------- */
function MiniStatCard({ label, value, icon: Icon, color, gradient }) {
  return (
    <div className="group relative bg-gradient-to-br from-white to-slate-50 rounded-xl p-4 border border-slate-200/60 hover:shadow-lg hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient || 'from-slate-200 to-slate-300'}`}>
            <div className="text-white">
              <Icon />
            </div>
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold ${color || 'text-slate-900'} tabular-nums`}>{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ENHANCED ACTIVITY ITEM                                                     */
/* -------------------------------------------------------------------------- */
function ActivityItem({ type, title, description, time, avatar }) {
  const typeConfig = {
    order: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-600/20', icon: Icons.Orders },
    user: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-600/20', icon: Icons.Users },
    vendor: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-600/20', icon: Icons.Vendor },
    product: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-600/20', icon: Icons.Products },
  };

  const config = typeConfig[type] || typeConfig.order;
  const ActivityIcon = config.icon;

  return (
    <div className="group flex items-start gap-3 py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
      <div className={`flex-shrink-0 p-2.5 rounded-xl ${config.bg} ${config.text} ring-1 ${config.ring} group-hover:scale-110 transition-transform`}>
        <ActivityIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 mb-0.5">{title}</p>
        <p className="text-xs text-slate-600 truncate">{description}</p>
      </div>
      <span className="flex-shrink-0 text-xs text-slate-500 font-medium whitespace-nowrap">{time}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ENHANCED TOP ITEM ROW                                                      */
/* -------------------------------------------------------------------------- */
function TopItemRow({ rank, name, value, subtext, image }) {
  const rankColors = {
    1: 'from-yellow-400 to-yellow-600 text-white',
    2: 'from-slate-300 to-slate-500 text-white',
    3: 'from-orange-400 to-orange-600 text-white',
  };

  return (
    <div className="group flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all border-b border-slate-100 last:border-0">
      <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${rankColors[rank] || 'from-slate-100 to-slate-200 text-slate-700'} flex items-center justify-center text-xs font-black shadow-md group-hover:scale-110 transition-transform`}>
        {rank}
      </div>
      {image && (
        <img 
          src={image} 
          alt={name} 
          className="flex-shrink-0 w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 group-hover:ring-blue-400 transition-all shadow-sm" 
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{name}</p>
        {subtext && <p className="text-xs text-slate-500 font-medium">{subtext}</p>}
      </div>
      <span className="flex-shrink-0 text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ALERT BANNER COMPONENT                                                     */
/* -------------------------------------------------------------------------- */
function AlertBanner({ type = 'info', icon: Icon, title, description, count, action }) {
  const typeConfig = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', subtext: 'text-blue-600', iconBg: 'bg-blue-100' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', subtext: 'text-amber-600', iconBg: 'bg-amber-100' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', subtext: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', subtext: 'text-red-600', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', subtext: 'text-purple-600', iconBg: 'bg-purple-100' },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`relative ${config.bg} border ${config.border} rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden group`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className={`relative flex-shrink-0 p-3 ${config.iconBg} rounded-xl shadow-sm`}>
        {Icon && <Icon />}
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-sm font-bold ${config.text}`}>{title}</p>
          {count > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${config.iconBg} ${config.text}`}>
              {count}
            </span>
          )}
        </div>
        <p className={`text-xs font-medium ${config.subtext}`}>{description}</p>
      </div>
      {action && (
        <button className={`relative flex-shrink-0 px-4 py-2 rounded-lg ${config.iconBg} ${config.text} text-xs font-bold hover:scale-105 transition-transform`}>
          {action}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ENHANCED DASHBOARD OVERVIEW                                                */
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
      setError('Unable to load dashboard statistics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
        </div>
        <p className="text-sm font-medium text-slate-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-1 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            📊 Real-time analytics and insights • {getRangeLabel(dateRange)}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-700 bg-white hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
          >
            <option value="7days">📅 Last 7 Days</option>
            <option value="30days">📅 Last 30 Days</option>
            <option value="90days">📅 Last 90 Days</option>
            <option value="365days">📅 Last Year</option>
          </select>
          
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-lg hover:shadow-xl hover:scale-105">
            <div className="flex items-center gap-2">
              <Icons.Download />
              Export
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 text-sm text-red-700 font-semibold shadow-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Primary Stats - Revenue, Orders, Users, Vendors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.periodSummary.revenue)}
          change={stats.changes.revenue}
          changeType={getChangeType(stats.changes.revenue)}
          icon={Icons.Revenue}
          gradient={GRADIENT_COLORS.blue}
          subtitle={`Lifetime: ${formatCurrency(stats.overview.totalRevenue)}`}
          compact={true}
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(stats.periodSummary.orders)}
          change={stats.changes.orders}
          changeType={getChangeType(stats.changes.orders)}
          icon={Icons.Orders}
          gradient={GRADIENT_COLORS.green}
          subtitle={`${formatNumber(stats.overview.pendingOrders)} pending orders`}
        />
        <StatCard
          title="New Users"
          value={formatNumber(stats.periodSummary.users)}
          change={stats.changes.users}
          changeType={getChangeType(stats.changes.users)}
          icon={Icons.Users}
          gradient={GRADIENT_COLORS.purple}
          subtitle={`Total: ${formatNumber(stats.overview.totalUsers)} users`}
        />
        <StatCard
          title="New Vendors"
          value={formatNumber(stats.periodSummary.vendors)}
          change={stats.changes.vendors}
          changeType={getChangeType(stats.changes.vendors)}
          icon={Icons.Vendor}
          gradient={GRADIENT_COLORS.orange}
          subtitle={`${formatNumber(stats.overview.pendingVendorRequests)} pending requests`}
        />
      </div>

      {/* Alert Banners */}
      {(stats.overview.pendingApprovals > 0 || stats.overview.pendingVendorRequests > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stats.overview.pendingApprovals > 0 && (
            <AlertBanner
              type="warning"
              icon={Icons.Approval}
              title="Products Pending Approval"
              description="Review and approve new product listings"
              count={stats.overview.pendingApprovals}
              action="Review Now"
            />
          )}
          {stats.overview.pendingVendorRequests > 0 && (
            <AlertBanner
              type="purple"
              icon={Icons.Vendor}
              title="Vendor Requests Pending"
              description="New vendors waiting for approval"
              count={stats.overview.pendingVendorRequests}
              action="Review Now"
            />
          )}
        </div>
      )}

      {/* Charts Section - Sales & Revenue */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Sales Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Sales Performance</h3>
              <p className="text-xs text-slate-500 font-medium">Revenue and orders trend analysis</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Sales (₹)
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Orders
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={stats.salesChart}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fontWeight: 600 }} 
                stroke="#94a3b8" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 11, fontWeight: 600 }} 
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 11, fontWeight: 600 }} 
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px',
                  fontWeight: 600,
                }}
                formatter={(value, name) => [
                  name === 'sales' ? `₹${value.toLocaleString()}` : value,
                  name === 'sales' ? 'Revenue' : 'Orders'
                ]}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                stroke={COLORS.primary}
                strokeWidth={3}
                fill="url(#salesGradient)"
                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke={COLORS.success}
                strokeWidth={3}
                fill="url(#ordersGradient)"
                dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Revenue Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-black text-slate-900 mb-1">Weekly Revenue</h3>
          <p className="text-xs text-slate-500 font-medium mb-6">Daily breakdown</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10, fontWeight: 600 }} 
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fontWeight: 600 }} 
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px',
                  fontWeight: 600,
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} />
                  <stop offset="100%" stopColor={COLORS.info} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registration & Order Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User & Vendor Registrations */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Registration Trends</h3>
              <p className="text-xs text-slate-500 font-medium">New users and vendors over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                Users
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                Vendors
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.registrationChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fontWeight: 600 }} 
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fontWeight: 600 }} 
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px',
                  fontWeight: 600,
                }}
                cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
              />
              <Bar dataKey="users" fill={COLORS.secondary} radius={[8, 8, 0, 0]} />
              <Bar dataKey="vendors" fill={COLORS.warning} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-black text-slate-900 mb-1">Order Status</h3>
          <p className="text-xs text-slate-500 font-medium mb-6">Distribution overview</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.orderStatusChart}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {stats.orderStatusChart.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px',
                  fontWeight: 600,
                }}
                formatter={(value) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {stats.orderStatusChart.map((entry, index) => (
              <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700">
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                ></span>
                {entry.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products, Vendors & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                <Icons.Star />
              </div>
              <h3 className="text-lg font-black text-slate-900">Top Products</h3>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all">
              View All <Icons.ChevronRight />
            </button>
          </div>
          <div className="space-y-1">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <TopItemRow
                  key={product.id}
                  rank={index + 1}
                  name={product.name}
                  value={`₹${product.revenue.toLocaleString()}`}
                  subtext={`${product.sales} sold`}
                  image={product.image}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Icons.Vendor />
              </div>
              <h3 className="text-lg font-black text-slate-900">Top Vendors</h3>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all">
              View All <Icons.ChevronRight />
            </button>
          </div>
          <div className="space-y-1">
            {stats.topVendors.length > 0 ? (
              stats.topVendors.map((vendor, index) => (
                <TopItemRow
                  key={vendor.id}
                  rank={index + 1}
                  name={vendor.name}
                  value={`₹${vendor.revenue.toLocaleString()}`}
                  subtext={`${vendor.orders} orders`}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Icons.Bell />
              </div>
              <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-2 transition-all">
              View All <Icons.ChevronRight />
            </button>
          </div>
          <div className="space-y-0">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  type={activity.type}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Distribution & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-black text-slate-900 mb-1">Sales by Category</h3>
          <p className="text-xs text-slate-500 font-medium mb-6">Product distribution</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.categoryChart}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              >
                {stats.categoryChart.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px',
                  fontWeight: 600,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-black text-slate-900 mb-6">Quick Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <MiniStatCard 
              label="Products" 
              value={formatNumber(stats.overview.totalProducts)}
              icon={Icons.Products}
              gradient={GRADIENT_COLORS.blue}
              color="text-blue-600"
            />
            <MiniStatCard 
              label="Active Users" 
              value={formatNumber(stats.quickStats.activeUsers)}
              icon={Icons.Users}
              gradient={GRADIENT_COLORS.green}
              color="text-emerald-600"
            />
            <MiniStatCard 
              label="Active Vendors" 
              value={formatNumber(stats.quickStats.activeVendors)}
              icon={Icons.Vendor}
              gradient={GRADIENT_COLORS.purple}
              color="text-purple-600"
            />
            <MiniStatCard 
              label="Pending Orders" 
              value={formatNumber(stats.overview.pendingOrders)}
              icon={Icons.Orders}
              gradient={GRADIENT_COLORS.orange}
              color="text-amber-600"
            />
            <MiniStatCard 
              label="Range Revenue" 
              value={formatCompactNumber(stats.quickStats.rangeRevenue)}
              icon={Icons.Revenue}
              gradient={GRADIENT_COLORS.green}
              color="text-emerald-600"
            />
            <MiniStatCard 
              label="Avg Order" 
              value={formatCurrency(stats.quickStats.avgOrderValue)}
              icon={Icons.Orders}
              gradient={GRADIENT_COLORS.indigo}
              color="text-indigo-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN ADMIN DASHBOARD WITH ENHANCED UI                                      */
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
  const [badgeCounts, setBadgeCounts] = useState({ pending: 0, vendorPending: 0 });

  useEffect(() => {
    if (!token) return;
    fetchSettings();
    fetchBadgeCounts();
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

  const fetchBadgeCounts = async () => {
    try {
      const res = await axiosClient.get('/api/admin/dashboard-stats?range=30days', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBadgeCounts({
        pending: res.data?.overview?.pendingApprovals || 0,
        vendorPending: res.data?.overview?.pendingVendorRequests || 0,
      });
    } catch (err) {
      console.error('fetchBadgeCounts', err);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <div className="flex">
        {/* ================= ENHANCED SIDEBAR ================= */}
        <aside
          className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200/60 shadow-xl z-40 transition-all duration-300 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${
            sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
          } w-72 lg:translate-x-0`}
        >
          {/* Logo Section */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200/60 bg-gradient-to-r from-blue-600 to-blue-700">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center">
                  <span className="text-blue-600 font-black text-xl">A</span>
                </div>
                <div>
                  <span className="font-black text-white text-lg">Admin Panel</span>
                  <p className="text-xs text-blue-100 font-medium">E-Commerce Dashboard</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-black text-xl">A</span>
              </div>
            )}
          </div>

          {/* Admin Profile Card */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-slate-200/60 bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                    <span className="text-white font-black text-lg">
                      {auth.user?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {auth.user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-slate-600 truncate font-medium">{auth.user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              const badge = t.badge ? badgeCounts[t.badge] : 0;
              
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`group relative w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === t.key
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                  } ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
                  title={sidebarCollapsed ? t.label : undefined}
                >
                  <div className={activeTab === t.key ? 'scale-110' : 'group-hover:scale-110 transition-transform'}>
                    <Icon />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{t.label}</span>
                      {badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                          activeTab === t.key 
                            ? 'bg-white text-blue-600' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                  {sidebarCollapsed && badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200/60 bg-white">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <Icons.Logout />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main
          className={`flex-1 min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
          }`}
        >
          {/* Enhanced Top Header */}
          <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex lg:hidden p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Icons.Menu />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <div className="text-white">
                    {TABS.find((t) => t.key === activeTab)?.icon && 
                      (() => {
                        const Icon = TABS.find((t) => t.key === activeTab).icon;
                        return <Icon />;
                      })()
                    }
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900">
                    {TABS.find((t) => t.key === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage and monitor your e-commerce platform
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                <Icons.Search />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-40"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
                <Icons.Bell />
                {(badgeCounts.pending + badgeCounts.vendorPending) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center">
                    {badgeCounts.pending + badgeCounts.vendorPending}
                  </span>
                )}
              </button>
              
              {/* Date Display */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                <span>📅</span>
                <span>
                  {new Date().toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </header>

          {/* Content Area with Enhanced Padding */}
          <div className="p-6 lg:p-8">
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && <DashboardOverview token={token} />}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700">
                    <Icons.Settings />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Site Settings</h2>
                    <p className="text-sm text-slate-500 font-medium">Configure your platform settings</p>
                  </div>
                </div>
                <SettingsForm token={token} settings={settings} onSaved={handleSettingsSaved} />
              </div>
            )}

            {/* CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Icons.Categories />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Product Categories</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage product categories</p>
                  </div>
                </div>
                <AdminCategories token={token} />
              </div>
            )}

            {/* PRODUCT APPROVALS */}
            {activeTab === 'approvals' && (
              <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                    <Icons.Approval />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Product Approvals</h2>
                    <p className="text-sm text-slate-500 font-medium">Review and approve pending products</p>
                  </div>
                </div>
                <AdminApprovals token={token} />
              </div>
            )}

            {/* VENDOR APPROVALS */}
            {activeTab === 'vendorApprovals' && (
              <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Icons.Vendor />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Vendor Requests</h2>
                    <p className="text-sm text-slate-500 font-medium">Approve or reject vendor applications</p>
                  </div>
                </div>
                <VendorApprovals token={token} />
              </div>
            )}

            {/* VENDORS */}
            {activeTab === 'vendors' && (
              <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
                    <Icons.Vendor />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Vendor Logins</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage vendor accounts</p>
                  </div>
                </div>
                <VendorLogins token={token} />
              </div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
              <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                    <Icons.Users />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">User Logins</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage customer accounts</p>
                  </div>
                </div>
                <UserLogins token={token} />
              </div>
            )}

            {/* ALL PRODUCTS */}
            {activeTab === 'allproducts' && (
              <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Icons.Products />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">All Products</h2>
                    <p className="text-sm text-slate-500 font-medium">Browse and manage all products</p>
                  </div>
                </div>
                <AdminProducts token={token} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}