// src/components/admin/UserLogins.jsx
import { useEffect, useState, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';

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
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Home: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/* STATUS BADGE COMPONENT                                                     */
/* -------------------------------------------------------------------------- */
function StatusBadge({ status, type = 'active' }) {
  const configs = {
    active: {
      true: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
      false: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Blocked' },
    },
    account: {
      active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
      blocked: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Blocked' },
      deleted: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500', label: 'Deleted' },
    },
  };

  const config = configs[type]?.[status] || configs.active[true];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
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
    cyan: 'from-cyan-500 to-cyan-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
          {subtext && <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <span className="text-white">{Icon && <Icon />}</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* USER CARD - GRID VIEW                                                      */
/* -------------------------------------------------------------------------- */
function UserCardGrid({ user, onView, onEdit, onDelete }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const avatarColors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-emerald-400 to-emerald-600',
    'from-orange-400 to-orange-600',
    'from-cyan-400 to-cyan-600',
  ];

  const colorIndex = user.name ? user.name.charCodeAt(0) % avatarColors.length : 0;

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300">
      {/* Header with gradient */}
      <div className={`h-16 bg-gradient-to-br ${avatarColors[colorIndex]} relative`}>
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 rounded-xl bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className={`text-sm font-bold text-transparent bg-clip-text bg-gradient-to-br ${avatarColors[colorIndex]}`}>
                {getInitials(user.name)}
              </span>
            )}
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white transition-colors"
            title="Edit"
          >
            <Icons.Edit />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-red-600 hover:bg-white transition-colors"
            title="Delete"
          >
            <Icons.Delete />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-8 pb-4 px-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{user.name}</h3>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <StatusBadge status={user.isActive} type="active" />
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 mt-3 py-2 border-y border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Icons.ShoppingBag />
            <span className="font-medium text-slate-700">{user.totalOrders ?? 0}</span>
            <span>orders</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Icons.DollarSign />
            <span className="font-medium text-emerald-600">₹{user.totalSpent ?? 0}</span>
          </div>
        </div>

        {/* View button */}
        <button
          onClick={() => onView(user)}
          className="w-full mt-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <Icons.Eye />
          View Profile
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* USER ROW - LIST VIEW                                                       */
/* -------------------------------------------------------------------------- */
function UserRowList({ user, onView, onEdit, onDelete }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base font-bold text-blue-600">{getInitials(user.name)}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{user.name}</h3>
            <StatusBadge status={user.isActive} type="active" />
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
              <Icons.Mail />
              {user.email}
            </span>
            {user.mobileNumber && (
              <span className="text-xs text-slate-500 flex items-center gap-1 hidden sm:flex">
                <Icons.Phone />
                {user.mobileNumber}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900">{user.totalOrders ?? 0}</p>
            <p className="text-[10px] text-slate-500">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-emerald-600">₹{user.totalSpent ?? 0}</p>
            <p className="text-[10px] text-slate-500">Spent</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(user)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View"
          >
            <Icons.Eye />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Icons.Edit />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
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
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
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
function EmptyState({ onCreate, hasFilters, onClearFilters }) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white border border-slate-200 rounded-2xl">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Icons.Search />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No users match your filters</h3>
        <p className="text-sm text-slate-500 mb-4">Try adjusting your search or filter criteria</p>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-slate-200 rounded-2xl">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
        <Icons.Users />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Users Found</h3>
      <p className="text-sm text-slate-500 text-center max-w-md mb-6">
        There are no user accounts in the system yet. Create your first user to get started.
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
      >
        <Icons.Plus />
        Add First User
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ADDRESS CARD                                                               */
/* -------------------------------------------------------------------------- */
function AddressCard({ address, isDefault }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500">
            <Icons.Home />
          </div>
          <span className="text-sm font-semibold text-slate-900">{address.fullName}</span>
        </div>
        {isDefault && (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full">
            Default
          </span>
        )}
      </div>
      <div className="text-xs text-slate-600 space-y-0.5 ml-10">
        <p>{address.houseNo}, {address.streetArea}</p>
        <p>{address.city}, {address.state} - {address.pincode}</p>
        <p className="flex items-center gap-1 text-slate-500 mt-1">
          <Icons.Phone />
          {address.mobileNumber}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
export default function UserLogins({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // View details modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewIsActive, setViewIsActive] = useState(true);
  const [viewAccountStatus, setViewAccountStatus] = useState('active');
  const [viewSaving, setViewSaving] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data.users || [];
      setItems(all.filter((u) => u.role === 'user'));
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((u) => {
      const matchesSearch =
        !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || (statusFilter === 'active' ? u.isActive : !u.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((u) => u.isActive).length;
    const blocked = items.filter((u) => !u.isActive).length;
    const totalSpent = items.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
    const totalOrders = items.reduce((acc, u) => acc + (u.totalOrders || 0), 0);
    return { total, active, blocked, totalSpent, totalOrders };
  }, [items]);

  const hasFilters = searchQuery || statusFilter;

  // Helpers
  const getInitials = (name) => {
    if (!name) return 'U';
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

  // Modal handlers
  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      isActive: u.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await axiosClient.patch(`/api/admin/users/${editing._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('User updated successfully');
      } else {
        await axiosClient.post(
          '/api/admin/users',
          { ...form, role: 'user' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Are you sure you want to delete user "${u.name}"? This action cannot be undone.`)) return;
    try {
      await axiosClient.delete(`/api/admin/users/${u._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const openView = (u) => {
    setViewUser(u);
    setViewIsActive(u.isActive ?? true);
    setViewAccountStatus(u.accountStatus || 'active');
    setShowViewModal(true);
  };

  const handleViewSave = async () => {
    if (!viewUser) return;
    try {
      setViewSaving(true);
      await axiosClient.patch(
        `/api/admin/users/${viewUser._id}`,
        {
          isActive: viewIsActive,
          accountStatus: viewAccountStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User status updated successfully');
      setShowViewModal(false);
      fetchUsers();
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
  };

  return (
    <div className="space-y-5">
      {/* STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={Icons.Users}
          label="Total Users"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={Icons.Check}
          label="Active Users"
          value={stats.active}
          color="green"
          subtext={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`}
        />
        <StatCard
          icon={Icons.Ban}
          label="Blocked"
          value={stats.blocked}
          color="orange"
        />
        <StatCard
          icon={Icons.ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders}
          color="purple"
        />
        <StatCard
          icon={Icons.DollarSign}
          label="Total Revenue"
          value={`₹${stats.totalSpent.toLocaleString()}`}
          color="cyan"
        />
      </div>

      {/* HEADER & CONTROLS */}
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white"><Icons.User /></span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">User Accounts</h2>
              <p className="text-sm text-slate-500">
                {hasFilters
                  ? `Showing ${filteredItems.length} of ${items.length} users`
                  : 'Manage all application users'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Refresh */}
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
              title="Refresh"
            >
              <Icons.Refresh />
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icons.Grid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icons.List />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                showFilters || hasFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icons.Filter />
              <span className="text-sm font-medium hidden sm:inline">Filters</span>
              {hasFilters && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
            </button>

            {/* Add User */}
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Icons.Plus />
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>

        {/* FILTERS PANEL */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icons.Search />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>

              {/* Clear Filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Icons.Close />
                  Clear All
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
        <EmptyState onCreate={openCreate} hasFilters={hasFilters} onClearFilters={clearFilters} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((u) => (
            <UserCardGrid
              key={u._id}
              user={u}
              onView={openView}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((u) => (
            <UserRowList
              key={u._id}
              user={u}
              onView={openView}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* FOOTER */}
      {!loading && filteredItems.length > 0 && (
        <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600">
          <span>
            Showing <span className="font-semibold text-slate-900">{filteredItems.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{items.length}</span> users
          </span>
          {hasFilters && (
            <button onClick={clearFilters} className="text-blue-600 hover:underline font-medium">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ============ CREATE / EDIT MODAL ============ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white">{editing ? <Icons.Edit /> : <Icons.Plus />}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {editing ? 'Edit User' : 'Create User'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editing ? 'Update user account details' : 'Add a new user account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Icons.Close />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  required
                  placeholder="Enter user name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {editing ? 'New Password (optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  placeholder={editing ? 'Leave blank to keep current' : 'Enter password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editing}
                />
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Active Account</span>
                  <p className="text-xs text-slate-500">User can login and use the platform</p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : editing ? (
                    'Save Changes'
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ VIEW DETAILS MODAL ============ */}
      {showViewModal && viewUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Cover */}
            <div className="relative h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-t-2xl">
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors"
              >
                <Icons.Close />
              </button>

              {/* Avatar */}
              <div className="absolute -bottom-8 left-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                  {viewUser.profilePicture ? (
                    <img
                      src={viewUser.profilePicture}
                      alt={viewUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-blue-600 bg-blue-50 w-full h-full flex items-center justify-center">
                      {getInitials(viewUser.name)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="pt-12 px-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{viewUser.name}</h3>
                  <p className="text-sm text-slate-500">{viewUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={viewUser.isActive} type="active" />
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full capitalize">
                      {viewUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-5">
              {/* Analytics Cards */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Icons.ShoppingBag />
                  User Analytics
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-blue-600 flex justify-center mb-2">
                      <Icons.ShoppingBag />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{viewUser.totalOrders ?? 0}</p>
                    <p className="text-xs text-slate-500">Total Orders</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-4 text-center">
                    <div className="text-emerald-600 flex justify-center mb-2">
                      <Icons.DollarSign />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">₹{viewUser.totalSpent ?? 0}</p>
                    <p className="text-xs text-slate-500">Total Spent</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-4 text-center">
                    <div className="text-purple-600 flex justify-center mb-2">
                      <Icons.Calendar />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {viewUser.lastOrderDate
                        ? new Date(viewUser.lastOrderDate).toLocaleDateString()
                        : 'No orders yet'}
                    </p>
                    <p className="text-xs text-slate-500">Last Order</p>
                  </div>
                </div>
              </div>

              {/* Contact & Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                    <Icons.Mail />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-20">Email</span>
                      <span className="text-sm text-slate-900 truncate">{viewUser.email || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-20">Mobile</span>
                      <span className="text-sm text-slate-900">{viewUser.mobileNumber || 'Not set'}</span>
                    </div>
                    {viewUser.alternateMobileNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-20">Alt. Mobile</span>
                        <span className="text-sm text-slate-900">{viewUser.alternateMobileNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                    <Icons.User />
                    Personal Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Gender</span>
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {viewUser.gender || 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Date of Birth</span>
                      <span className="text-sm font-medium text-slate-900">
                        {viewUser.dateOfBirth
                          ? new Date(viewUser.dateOfBirth).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Icons.MapPin />
                  Saved Addresses
                  {viewUser.addresses?.length > 0 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                      {viewUser.addresses.length}
                    </span>
                  )}
                </h4>
                {viewUser.addresses && viewUser.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewUser.addresses.map((addr, idx) => (
                      <AddressCard key={idx} address={addr} isDefault={addr.isDefault} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Icons.MapPin />
                    <p className="text-sm text-slate-500 mt-2">No addresses saved</p>
                  </div>
                )}
              </div>

              {/* Admin Controls */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <Icons.Edit />
                  Admin Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Status */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Account Status
                    </label>
                    <select
                      value={viewAccountStatus}
                      onChange={(e) => setViewAccountStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </div>

                  {/* Active Toggle */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Login Access</label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={viewIsActive}
                        onChange={(e) => setViewIsActive(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Can Login</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                <span className="flex items-center gap-1">
                  <Icons.Clock />
                  Created: {formatDate(viewUser.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Icons.Clock />
                  Updated: {formatDate(viewUser.updatedAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleViewSave}
                  disabled={viewSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {viewSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}