// src/components/admin/VendorLogins.jsx
import { useEffect, useState, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';

const ALLOWED_ALL_KEYWORD = 'AllowedAll';

const normalizeCategoryId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') {
    return value._id?.toString() || '';
  }
  return value.toString();
};

/* -------------------------------------------------------------------------- */
/* ICONS                                                                      */
/* -------------------------------------------------------------------------- */
const Icons = {
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Delete: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Store: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Ban: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  DollarSign: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/* STATUS BADGE COMPONENT                                                     */
/* -------------------------------------------------------------------------- */
function StatusBadge({ status, type = 'default' }) {
  const configs = {
    active: {
      true: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
      false: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Blocked' },
    },
    application: {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Pending' },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Approved' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Rejected' },
    },
    account: {
      active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
      blocked: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Blocked' },
      deleted: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500', label: 'Deleted' },
    },
  };

  const config = configs[type]?.[status] || configs.application.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT CARD COMPONENT                                                        */
/* -------------------------------------------------------------------------- */
function StatCard({ icon: Icon, label, value, color = 'blue', subtext }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
          {subtext && <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg shadow-${color}-500/20`}>
          <span className="text-white">{Icon && <Icon />}</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VENDOR CARD - GRID VIEW                                                    */
/* -------------------------------------------------------------------------- */
function VendorCardGrid({ vendor, onView, onEdit, onDelete, onEditCategories, onToggleAccessType, approvedCategoryLabels, accessType }) {
  const getInitials = (name) => {
    if (!name) return 'V';
    const parts = name.trim().split(' ');
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300">
      <div className="h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 rounded-xl bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center">
            {vendor.profilePicture ? (
              <img src={vendor.profilePicture} alt={vendor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-blue-600 bg-blue-50 w-full h-full flex items-center justify-center">
                {getInitials(vendor.name)}
              </span>
            )}
          </div>
        </div>
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button onClick={() => onEdit(vendor)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white transition-colors" title="Edit">
            <Icons.Edit />
          </button>
          <button onClick={() => onDelete(vendor)} className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-red-600 hover:bg-white transition-colors" title="Delete">
            <Icons.Delete />
          </button>
        </div>
      </div>

      <div className="pt-8 pb-4 px-4">
        <h3 className="text-sm font-semibold text-slate-900 truncate">{vendor.name}</h3>
        <p className="text-xs text-slate-500 truncate mt-0.5">{vendor.email}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          <StatusBadge status={vendor.isActive} type="active" />
          <StatusBadge status={vendor.vendorApplicationStatus || 'pending'} type="application" />
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Categories</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${accessType === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {accessType === 'all' ? 'All' : 'Limited'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(approvedCategoryLabels || []).slice(0, 2).map((label) => (
              <span key={label} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{label}</span>
            ))}
            {(approvedCategoryLabels || []).length > 2 && (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">+{approvedCategoryLabels.length - 2}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={() => onView(vendor)} className="flex-1 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1">
            <Icons.Eye /> View
          </button>
          <button onClick={() => onEditCategories(vendor)} className="flex-1 py-2 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-600 rounded-lg text-[11px] font-medium transition-colors">
            Categories
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VENDOR ROW - LIST VIEW                                                     */
/* -------------------------------------------------------------------------- */
function VendorRowList({ vendor, onView, onEdit, onDelete, onEditCategories, onToggleAccessType, approvedCategoryLabels, accessType }) {
  const getInitials = (name) => {
    if (!name) return 'V';
    const parts = name.trim().split(' ');
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          {vendor.profilePicture ? (
            <img src={vendor.profilePicture} alt={vendor.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base font-bold text-blue-600">{getInitials(vendor.name)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{vendor.name}</h3>
            <StatusBadge status={vendor.vendorApplicationStatus || 'pending'} type="application" />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
              <Icons.Mail />
              {vendor.email}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${accessType === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {accessType === 'all' ? 'AllowedAll' : 'Limited'}
            </span>
            {(approvedCategoryLabels || []).slice(0, 2).map((label) => (
              <span key={label} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px]">{label}</span>
            ))}
            {(approvedCategoryLabels || []).length > 2 && (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px]">+{approvedCategoryLabels.length - 2}</span>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <StatusBadge status={vendor.isActive} type="active" />
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => onToggleAccessType(vendor)} className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title={accessType === 'all' ? 'Set Limited' : 'Set AllowedAll'}>
            <Icons.Refresh />
          </button>
          <button onClick={() => onEditCategories(vendor)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Categories">
            <Icons.Package />
          </button>
          <button onClick={() => onView(vendor)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
            <Icons.Eye />
          </button>
          <button onClick={() => onEdit(vendor)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
            <Icons.Edit />
          </button>
          <button onClick={() => onDelete(vendor)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <Icons.Delete />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING SKELETON                                                           */
/* -------------------------------------------------------------------------- */
function LoadingSkeleton({ viewMode }) {
  return (
    <div className="animate-pulse">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="h-16 bg-slate-200"></div>
              <div className="pt-8 pb-4 px-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 bg-slate-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */
function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-2xl">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
        <Icons.Store />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Vendors Found</h3>
      <p className="text-sm text-slate-500 text-center max-w-md mb-6">
        There are no vendor accounts in the system yet.
      </p>
      <button onClick={onCreate} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
        <Icons.Plus />
        Add First Vendor
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HIERARCHICAL CATEGORY SELECTOR COMPONENT                                   */
/* -------------------------------------------------------------------------- */
function HierarchicalCategorySelector({ categories, selection, onToggle }) {
  const [expandedSuper, setExpandedSuper] = useState({});

  // Group categories: super categories with their sub categories
  const hierarchy = useMemo(() => {
    const superCategories = categories.filter(c => c.type === 'super');
    const subCategories = categories.filter(c => c.type === 'sub');

    return superCategories.map(superCat => ({
      ...superCat,
      subCategories: subCategories.filter(subCat => {
        const parentId = normalizeCategoryId(subCat.parent?._id || subCat.parent);
        return parentId === normalizeCategoryId(superCat._id);
      })
    }));
  }, [categories]);

  const toggleExpand = (superId) => {
    setExpandedSuper(prev => ({ ...prev, [superId]: !prev[superId] }));
  };

  const isSelected = (categoryId) => selection.includes(normalizeCategoryId(categoryId));

  const getSelectedCountForSuper = (superCat) => {
    const subIds = superCat.subCategories.map(s => normalizeCategoryId(s._id));
    return subIds.filter(id => selection.includes(id)).length;
  };

  const selectAllSub = (superCat) => {
    const subIds = superCat.subCategories.map(s => normalizeCategoryId(s._id));
    const allSelected = subIds.every(id => selection.includes(id));
    
    if (allSelected) {
      // Deselect all
      subIds.forEach(id => {
        if (selection.includes(id)) onToggle(id);
      });
    } else {
      // Select all
      subIds.forEach(id => {
        if (!selection.includes(id)) onToggle(id);
      });
    }
  };

  return (
    <div className="space-y-2">
      {hierarchy.map(superCat => {
        const superId = normalizeCategoryId(superCat._id);
        const isExpanded = expandedSuper[superId];
        const selectedCount = getSelectedCountForSuper(superCat);
        const hasSubCategories = superCat.subCategories.length > 0;

        return (
          <div key={superId} className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Super Category Header */}
            <div 
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                isExpanded ? 'bg-blue-50 border-b border-blue-100' : 'bg-slate-50 hover:bg-slate-100'
              }`}
              onClick={() => hasSubCategories && toggleExpand(superId)}
            >
              {/* Expand/Collapse Icon */}
              {hasSubCategories && (
                <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  <Icons.ChevronRight />
                </span>
              )}
              
              {/* Category Image or Icon */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {superCat.image ? (
                  <img src={superCat.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {superCat.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Category Name & Count */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{superCat.name}</p>
                <p className="text-[10px] text-slate-500">
                  {hasSubCategories 
                    ? `${superCat.subCategories.length} sub-categories` 
                    : 'No sub-categories'}
                  {selectedCount > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">• {selectedCount} selected</span>
                  )}
                </p>
              </div>

              {/* Select All Button */}
              {hasSubCategories && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAllSub(superCat);
                  }}
                  className="px-2 py-1 text-[10px] font-medium bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                >
                  {selectedCount === superCat.subCategories.length ? 'Deselect All' : 'Select All'}
                </button>
              )}

              {/* Super Category Checkbox (if no sub-categories, can be selected directly) */}
              {!hasSubCategories && (
                <input
                  type="checkbox"
                  checked={isSelected(superId)}
                  onChange={() => onToggle(superId)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Sub Categories */}
            {isExpanded && hasSubCategories && (
              <div className="bg-white p-2 space-y-1 max-h-48 overflow-y-auto">
                {superCat.subCategories.map(subCat => {
                  const subId = normalizeCategoryId(subCat._id);
                  const checked = isSelected(subId);

                  return (
                    <label
                      key={subId}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        checked ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(subId)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {subCat.image ? (
                          <img src={subCat.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-500 text-[10px] font-bold">
                            {subCat.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm ${checked ? 'font-medium text-blue-700' : 'text-slate-700'}`}>
                        {subCat.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {hierarchy.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No categories available
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
export default function VendorLogins({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewVendor, setViewVendor] = useState(null);
  const [viewIsActive, setViewIsActive] = useState(true);
  const [viewAccountStatus, setViewAccountStatus] = useState('active');
  const [viewSaving, setViewSaving] = useState(false);
  const [vendorStats, setVendorStats] = useState({});
  const [vendorApplicationStatus, setVendorApplicationStatus] = useState('pending');
  const [allCategories, setAllCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryEditorVendor, setCategoryEditorVendor] = useState(null);
  const [categoryEditorSelection, setCategoryEditorSelection] = useState([]);
  const [categoryEditorSaving, setCategoryEditorSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/api/categories/public/all');
      setAllCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
      setAllCategories([]);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.vendors || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchVendors();
    fetchCategories();
  }, [token]);

  const filteredItems = useMemo(() => {
    return items.filter((v) => {
      const matchesSearch = !searchQuery || v.name?.toLowerCase().includes(searchQuery.toLowerCase()) || v.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || (statusFilter === 'active' ? v.isActive : !v.isActive);
      const matchesApplication = !applicationFilter || v.vendorApplicationStatus === applicationFilter;
      return matchesSearch && matchesStatus && matchesApplication;
    });
  }, [items, searchQuery, statusFilter, applicationFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((v) => v.isActive).length;
    const approved = items.filter((v) => v.vendorApplicationStatus === 'approved').length;
    const pending = items.filter((v) => v.vendorApplicationStatus === 'pending').length;
    return { total, active, approved, pending };
  }, [items]);

  const hasFilters = searchQuery || statusFilter || applicationFilter;

  const getInitials = (name) => {
    if (!name) return 'V';
    const parts = name.trim().split(' ');
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formatDate = (v) => {
    if (!v) return 'Not set';
    try {
      return new Date(v).toLocaleString();
    } catch {
      return 'Not set';
    }
  };

  const getVendorCategoryAccessType = (vendor) => {
    const approvedIds = Array.isArray(vendor?.vendorCategoriesApproved) ? vendor.vendorCategoriesApproved.map(normalizeCategoryId) : [];
    if (vendor?.vendorCategoryAccessType === 'all' || approvedIds.includes(ALLOWED_ALL_KEYWORD)) {
      return 'all';
    }
    return 'limited';
  };

  const getCategoryName = (value) => {
    const id = normalizeCategoryId(value);
    if (!id) return '';
    if (id === ALLOWED_ALL_KEYWORD) return ALLOWED_ALL_KEYWORD;
    if (typeof value === 'object' && value?.name) return value.name;
    const matchedCategory = allCategories.find((category) => normalizeCategoryId(category._id) === id);
    return matchedCategory?.name || id;
  };

  const getApprovedCategoryLabels = (vendor) => {
    if (getVendorCategoryAccessType(vendor) === 'all') return [ALLOWED_ALL_KEYWORD];
    return (vendor?.vendorCategoriesApproved || []).map((category) => getCategoryName(category)).filter(Boolean);
  };

  const openCategoryEditor = (vendor) => {
    const approvedIds = Array.isArray(vendor?.vendorCategoriesApproved)
      ? vendor.vendorCategoriesApproved.map(normalizeCategoryId).filter((id) => id && id !== ALLOWED_ALL_KEYWORD)
      : [];
    setCategoryEditorVendor(vendor);
    setCategoryEditorSelection(approvedIds);
    setShowCategoryModal(true);
  };

  const closeCategoryEditor = () => {
    setShowCategoryModal(false);
    setCategoryEditorVendor(null);
    setCategoryEditorSelection([]);
    setCategoryEditorSaving(false);
  };

  const toggleCategorySelection = (categoryId) => {
    setCategoryEditorSelection((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const saveVendorCategorySettings = async (vendorId, vendorCategoriesApproved, vendorCategoryAccessType) => {
    await axiosClient.patch(`/api/admin/users/${vendorId}`, { vendorCategoriesApproved, vendorCategoryAccessType }, { headers: { Authorization: `Bearer ${token}` } });
  };

  const handleAccessTypeChange = async (vendor) => {
    const nextAccessType = getVendorCategoryAccessType(vendor) === 'all' ? 'limited' : 'all';
    const nextApprovedCategories = nextAccessType === 'all' ? [ALLOWED_ALL_KEYWORD] : [];
    try {
      await saveVendorCategorySettings(vendor._id, nextApprovedCategories, nextAccessType);
      if (viewVendor?._id === vendor._id) {
        setViewVendor((prev) => prev ? { ...prev, vendorCategoryAccessType: nextAccessType, vendorCategoriesApproved: nextApprovedCategories } : prev);
      }
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update category access type');
    }
  };

  const handleCategoryEditorSave = async () => {
    if (!categoryEditorVendor) return;
    try {
      setCategoryEditorSaving(true);
      await saveVendorCategorySettings(categoryEditorVendor._id, categoryEditorSelection, 'limited');
      if (viewVendor?._id === categoryEditorVendor._id) {
        setViewVendor((prev) => prev ? { ...prev, vendorCategoryAccessType: 'limited', vendorCategoriesApproved: categoryEditorSelection } : prev);
      }
      closeCategoryEditor();
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update approved categories');
      setCategoryEditorSaving(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({ name: v.name || '', email: v.email || '', password: '', isActive: v.isActive ?? true });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await axiosClient.patch(`/api/admin/users/${editing._id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        alert('Vendor updated successfully');
      } else {
        await axiosClient.post('/api/admin/users', { ...form, role: 'vendor' }, { headers: { Authorization: `Bearer ${token}` } });
        alert('Vendor created successfully');
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (v) => {
    if (!confirm(`Are you sure you want to delete vendor "${v.name}"?`)) return;
    try {
      await axiosClient.delete(`/api/admin/users/${v._id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const openView = (v) => {
    setViewVendor(v);
    setViewIsActive(v.isActive ?? true);
    setViewAccountStatus(v.accountStatus || 'active');
    setVendorApplicationStatus(v.vendorApplicationStatus || 'pending');
    fetchVendorStats(v._id);
    setShowViewModal(true);
  };

  const fetchVendorStats = async (vendorId) => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        axiosClient.get(`/api/admin/vendors/${vendorId}/sales-stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axiosClient.get(`/api/admin/vendors/${vendorId}/products`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const stats = statsRes.data;
      const products = productsRes.data.products || [];
      setVendorStats({ ...stats, totalProductsListed: products.length });
    } catch (err) {
      console.error(err);
      setVendorStats({ totalOrders: 0, totalProductsSold: 0, totalRevenue: 0, lastOrderDate: null, totalProductsListed: 0 });
    }
  };

  const handleViewSave = async () => {
    if (!viewVendor) return;
    let vendorActive = vendorApplicationStatus === 'approved';
    try {
      setViewSaving(true);
      await axiosClient.patch(`/api/admin/users/${viewVendor._id}`, {
        isActive: viewIsActive,
        accountStatus: viewAccountStatus,
        vendorApplicationStatus,
        vendorActive,
        role: vendorApplicationStatus === 'approved' ? 'vendor' : 'user',
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Vendor status updated successfully');
      setShowViewModal(false);
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setViewSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setApplicationFilter('');
  };

  return (
    <div className="space-y-5">
      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Icons.Store} label="Total Vendors" value={stats.total} color="blue" />
        <StatCard icon={Icons.Check} label="Active" value={stats.active} color="green" subtext={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`} />
        <StatCard icon={Icons.TrendingUp} label="Approved" value={stats.approved} color="purple" />
        <StatCard icon={Icons.Clock} label="Pending" value={stats.pending} color="orange" />
      </div>

      {/* HEADER & CONTROLS */}
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white"><Icons.Users /></span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vendor Accounts</h2>
              <p className="text-sm text-slate-500">{hasFilters ? `Showing ${filteredItems.length} of ${items.length}` : 'Manage all vendor accounts'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={fetchVendors} disabled={loading} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200" title="Refresh">
              <Icons.Refresh />
            </button>

            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <Icons.Grid />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <Icons.List />
              </button>
            </div>

            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${showFilters || hasFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-600'}`}>
              <Icons.Filter />
              <span className="text-sm font-medium hidden sm:inline">Filters</span>
              {hasFilters && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
            </button>

            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              <Icons.Plus />
              <span className="hidden sm:inline">Add Vendor</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search vendors..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
              <select value={applicationFilter} onChange={(e) => setApplicationFilter(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">All Applications</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                  <Icons.Close /> Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CONTENT */}
      {loading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : filteredItems.length === 0 ? (
        items.length === 0 ? <EmptyState onCreate={openCreate} /> : (
          <div className="flex flex-col items-center justify-center py-12 bg-white border border-slate-200 rounded-2xl">
            <p className="text-slate-500 mb-4">No vendors match your filters</p>
            <button onClick={clearFilters} className="text-blue-600 hover:underline text-sm font-medium">Clear filters</button>
          </div>
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((v) => (
            <VendorCardGrid key={v._id} vendor={v} onView={openView} onEdit={openEdit} onDelete={handleDelete} onEditCategories={openCategoryEditor} onToggleAccessType={handleAccessTypeChange} approvedCategoryLabels={getApprovedCategoryLabels(v)} accessType={getVendorCategoryAccessType(v)} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((v) => (
            <VendorRowList key={v._id} vendor={v} onView={openView} onEdit={openEdit} onDelete={handleDelete} onEditCategories={openCategoryEditor} onToggleAccessType={handleAccessTypeChange} approvedCategoryLabels={getApprovedCategoryLabels(v)} accessType={getVendorCategoryAccessType(v)} />
          ))}
        </div>
      )}

      {/* FOOTER */}
      {!loading && filteredItems.length > 0 && (
        <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600">
          <span>Showing <span className="font-semibold text-slate-900">{filteredItems.length}</span> of <span className="font-semibold text-slate-900">{items.length}</span> vendors</span>
          {hasFilters && <button onClick={clearFilters} className="text-blue-600 hover:underline font-medium">Clear filters</button>}
        </div>
      )}

      {/* ============ CREATE / EDIT MODAL ============ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white">{editing ? <Icons.Edit /> : <Icons.Plus />}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Vendor' : 'Create Vendor'}</h3>
                  <p className="text-xs text-slate-500">{editing ? 'Update vendor details' : 'Add a new vendor'}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Icons.Close />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required placeholder="Enter vendor name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required type="email" placeholder="Enter email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{editing ? 'New Password (optional)' : 'Password'}</label>
                <input type="password" placeholder={editing ? 'Leave blank to keep current' : 'Enter password'} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required={!editing} />
              </div>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="text-sm font-medium text-slate-700">Active Account</span>
                  <p className="text-xs text-slate-500">Vendor can access the platform</p>
                </div>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Saving...</> : editing ? 'Save Changes' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ VIEW DETAILS MODAL - RESPONSIVE & COMPACT ============ */}
      {showViewModal && viewVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Compact Header */}
            <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl p-4">
              <button onClick={() => setShowViewModal(false)} className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors">
                <Icons.Close />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center flex-shrink-0">
                  {viewVendor.profilePicture ? (
                    <img src={viewVendor.profilePicture} alt={viewVendor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-blue-600 bg-blue-50 w-full h-full flex items-center justify-center">{getInitials(viewVendor.name)}</span>
                  )}
                </div>
                <div className="text-white min-w-0">
                  <h3 className="text-lg font-bold truncate">{viewVendor.name}</h3>
                  <p className="text-sm text-white/80 truncate">{viewVendor.email}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <StatusBadge status={viewVendor.isActive} type="active" />
                    <StatusBadge status={viewVendor.vendorApplicationStatus || 'pending'} type="application" />
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
              {/* Analytics - Compact Grid */}
              <div className="grid grid-cols-5 gap-2">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-slate-900">{vendorStats.totalOrders ?? 0}</p>
                  <p className="text-[9px] text-slate-500">Orders</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-green-600">₹{vendorStats.totalRevenue ?? 0}</p>
                  <p className="text-[9px] text-slate-500">Revenue</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-slate-900">{vendorStats.totalProductsSold ?? 0}</p>
                  <p className="text-[9px] text-slate-500">Sold</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-slate-900">{vendorStats.totalProductsListed ?? 0}</p>
                  <p className="text-[9px] text-slate-500">Listed</p>
                </div>
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-2 text-center">
                  <p className="text-xs font-bold text-slate-900">{vendorStats.lastOrderDate ? new Date(vendorStats.lastOrderDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-[9px] text-slate-500">Last Order</p>
                </div>
              </div>

              {/* Contact & Business Info - 2 Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Contact */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Contact</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Icons.Mail />
                      <span className="text-slate-700 truncate">{viewVendor.email || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.Phone />
                      <span className="text-slate-700">{viewVendor.mobileNumber || 'Not set'}</span>
                    </div>
                    {viewVendor.alternateMobileNumber && (
                      <div className="flex items-center gap-2">
                        <Icons.Phone />
                        <span className="text-slate-700">{viewVendor.alternateMobileNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Info - NEW */}
                <div className="bg-purple-50 rounded-xl p-3">
                  <h4 className="text-[10px] font-semibold text-purple-600 uppercase mb-2 flex items-center gap-1">
                    <Icons.Briefcase /> Business Details
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Business Name</span>
                      <span className="font-medium text-slate-700">{viewVendor.businessName || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Business Type</span>
                      <span className="font-medium text-slate-700 capitalize">{viewVendor.businessType || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Personal */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Personal</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Gender</span>
                      <span className="font-medium text-slate-700 capitalize">{viewVendor.gender || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">DOB</span>
                      <span className="font-medium text-slate-700">{viewVendor.dateOfBirth ? new Date(viewVendor.dateOfBirth).toLocaleDateString() : 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Account Info</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Role</span>
                      <span className="font-medium text-slate-700 capitalize">{viewVendor.role}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Created</span>
                      <span className="font-medium text-slate-700 text-xs">{viewVendor.createdAt ? new Date(viewVendor.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories - Compact */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-semibold text-blue-800">Approved Categories</h4>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAccessTypeChange(viewVendor)} className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-medium hover:bg-purple-200 transition-colors">
                      {getVendorCategoryAccessType(viewVendor) === 'all' ? 'Set Limited' : 'Set AllowedAll'}
                    </button>
                    <button onClick={() => openCategoryEditor(viewVendor)} className="px-2 py-1 rounded-lg bg-white text-blue-700 text-[10px] font-medium border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-1">
                      <Icons.Edit /> Edit
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getApprovedCategoryLabels(viewVendor).length > 0 ? (
                    getApprovedCategoryLabels(viewVendor).map((label) => (
                      <span key={label} className="px-2 py-1 bg-white text-slate-700 text-xs rounded-lg border border-blue-200">{label}</span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No categories assigned</span>
                  )}
                </div>
              </div>

              {/* Admin Controls - Compact */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <h4 className="text-xs font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <Icons.Edit /> Admin Controls
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">Application</label>
                    <select value={vendorApplicationStatus} onChange={(e) => setVendorApplicationStatus(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">Account</label>
                    <select value={viewAccountStatus} onChange={(e) => setViewAccountStatus(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">Login</label>
                    <label className="flex items-center gap-2 px-2 py-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" checked={viewIsActive} onChange={(e) => setViewIsActive(e.target.checked)} className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-xs text-slate-700">Can Login</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-white rounded-b-2xl">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
              <button onClick={handleViewSave} disabled={viewSaving} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {viewSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CATEGORY EDITOR MODAL - HIERARCHICAL ============ */}
      {showCategoryModal && categoryEditorVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Edit Approved Categories</h3>
                <p className="text-xs text-slate-500 mt-0.5">{categoryEditorVendor.name} • {categoryEditorSelection.length} selected</p>
              </div>
              <button onClick={closeCategoryEditor} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Icons.Close />
              </button>
            </div>

            {/* Info Banner */}
            <div className="px-4 pt-4 flex-shrink-0">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icons.Package />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Select Categories</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Click on a super category to expand and select sub-categories. Use "Select All" to quickly select all sub-categories.
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Category List */}
            <div className="flex-1 overflow-y-auto p-4">
              <HierarchicalCategorySelector
                categories={allCategories}
                selection={categoryEditorSelection}
                onToggle={toggleCategorySelection}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  Selected: <span className="font-bold text-blue-600">{categoryEditorSelection.length}</span>
                </span>
                {categoryEditorSelection.length > 0 && (
                  <button onClick={() => setCategoryEditorSelection([])} className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={closeCategoryEditor} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleCategoryEditorSave} disabled={categoryEditorSaving} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {categoryEditorSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Saving...</> : 'Save Categories'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}