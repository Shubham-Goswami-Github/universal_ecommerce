// src/components/layout/Navbar.jsx
import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // site settings
  const [siteName, setSiteName] = useState('MultiVendorEcom');
  const [logoUrl, setLogoUrl] = useState(null);

  // user stats
  const [userStats, setUserStats] = useState({});

  const user = auth.user;
  const role = user?.role;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfilePanel(false);
    setShowUserDropdown(false);
    setIsOpen(false);
    navigate('/');
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const openProfilePanel = () => {
    if (user) {
      setShowProfilePanel(true);
      setShowUserDropdown(false);
      fetchUserStats();
    }
  };

  const closeProfilePanel = () => {
    setShowProfilePanel(false);
  };

  // normalize logo url
  const normalizeLogoUrl = (rawUrl) => {
    if (!rawUrl) return null;
    const axiosBase = axiosClient?.defaults?.baseURL?.replace(/\/$/, '') || null;

    try {
      const u = new URL(rawUrl);
      const frontendPorts = ['5173', '5174'];
      if (frontendPorts.includes(u.port)) {
        const path = u.pathname + (u.search || '');
        if (axiosBase) return axiosBase + path;
        return `${u.protocol}//${u.hostname}:3000${path}`;
      }
      return rawUrl;
    } catch {
      if (rawUrl.startsWith('/')) {
        if (axiosBase) return axiosBase + rawUrl;
        const origin = window.location.origin.replace(/:\d+$/, ':3000');
        return origin + rawUrl;
      }
      return rawUrl;
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/api/settings/public');
      const data = res.data || {};
      if (data.siteName) setSiteName(data.siteName);

      const normalized = normalizeLogoUrl(data.logoUrl || '');
      setLogoUrl(normalized || null);
    } catch {
      // silent fallback
    }
  };

  const fetchUserStats = async () => {
    if (!user?._id) return;
    try {
      let endpoint = '';
      if (role === 'user') {
        endpoint = '/api/orders/my-stats';
      } else if (role === 'vendor') {
        endpoint = '/api/vendor/sales-stats';
      } else if (role === 'admin') {
        endpoint = '/api/admin/stats';
      } else {
        return;
      }
      const res = await axiosClient.get(endpoint, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUserStats(res.data || {});
    } catch (err) {
      console.error('fetchUserStats error:', err);
      setUserStats({});
    }
  };

  useEffect(() => {
    fetchSettings();
    const onSettingsUpdated = () => fetchSettings();
    window.addEventListener('settings:updated', onSettingsUpdated);
    return () => {
      window.removeEventListener('settings:updated', onSettingsUpdated);
    };
  }, []);

  const formatDate = (value) => {
    if (!value) return 'Not set';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return 'Not set';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-slate-200/60'
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand Logo */}
            <Link
              to="/"
              onClick={handleNavClick}
              className="flex items-center gap-3 group flex-shrink-0"
            >
              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xl shadow-lg shadow-blue-500/30 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-blue-500/40">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="site logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="drop-shadow-sm">{siteName?.charAt(0) || 'E'}</span>
                  )}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></span>
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-slate-900 font-bold text-xl tracking-tight leading-none group-hover:text-blue-600 transition-colors duration-200">
                  {siteName || 'MultiVendorEcom'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">
                  Shop with confidence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-50/80 backdrop-blur-sm rounded-full px-2 py-1.5 border border-slate-100">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`
                }
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`
                }
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Products
              </NavLink>

              {role === 'vendor' && (
                <NavLink
                  to="/vendor"
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                    }`
                  }
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Dashboard
                </NavLink>
              )}

              {role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                    }`
                  }
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Admin
                </NavLink>
              )}
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3">
              {/* User Actions */}
              {user && role === 'user' && (
                <div className="hidden md:flex items-center gap-1">
                  {/* Wishlist */}
                  <NavLink
                    to="/wishlist"
                    className={({ isActive }) =>
                      `relative p-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-rose-500 bg-rose-50'
                          : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                      }`
                    }
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </NavLink>

                  {/* Cart */}
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `relative p-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                      }`
                    }
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30">
                      3
                    </span>
                  </NavLink>

                  {/* Orders */}
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `relative p-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                      }`
                    }
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </NavLink>
                </div>
              )}

              {/* Divider */}
              {user && <div className="hidden md:block w-px h-8 bg-slate-200"></div>}

              {/* Auth Section */}
              <div className="hidden md:flex items-center gap-2">
                {!user ? (
                  <>
                    <NavLink
                      to="/login"
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Sign Up
                    </NavLink>
                  </>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    {/* Profile Button */}
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all duration-200 group"
                    >
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white ring-2 ring-white shadow-md">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name || 'Profile'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(user.name)}</span>
                        )}
                      </div>
                      <div className="hidden lg:flex flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-slate-800 max-w-[100px] truncate">
                          {user.name?.split(' ')[0]}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wide">
                          {role}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          showUserDropdown ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-dropdown-in">
                        {/* User Info Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/20">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.name || 'Profile'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>{getInitials(user.name)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 truncate">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                                {role}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={openProfilePanel}
                            className="w-full px-5 py-3 flex items-center gap-4 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                          >
                            <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </span>
                            <span className="font-medium">My Profile</span>
                          </button>

                          {role === 'user' && (
                            <>
                              <Link
                                to="/orders"
                                onClick={() => setShowUserDropdown(false)}
                                className="w-full px-5 py-3 flex items-center gap-4 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                              >
                                <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                  </svg>
                                </span>
                                <span className="font-medium">My Orders</span>
                              </Link>

                              <Link
                                to="/wishlist"
                                onClick={() => setShowUserDropdown(false)}
                                className="w-full px-5 py-3 flex items-center gap-4 text-sm text-slate-600 hover:text-rose-500 hover:bg-rose-50/50 transition-all duration-200"
                              >
                                <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                  </svg>
                                </span>
                                <span className="font-medium">Wishlist</span>
                              </Link>

                              <Link
                                to="/addresses"
                                onClick={() => setShowUserDropdown(false)}
                                className="w-full px-5 py-3 flex items-center gap-4 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                              >
                                <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                </span>
                                <span className="font-medium">Saved Addresses</span>
                              </Link>
                            </>
                          )}

                          <Link
                            to="/profile/settings"
                            onClick={() => setShowUserDropdown(false)}
                            className="w-full px-5 py-3 flex items-center gap-4 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                          >
                            <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </span>
                            <span className="font-medium">Settings</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-slate-100 p-3">
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center gap-2">
                {user && role === 'user' && (
                  <NavLink
                    to="/cart"
                    className="relative p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      3
                    </span>
                  </NavLink>
                )}

                {user && (
                  <button
                    onClick={openProfilePanel}
                    className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-blue-100 shadow-md"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name || 'Profile'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user.name)}</span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-slate-50/50 backdrop-blur-lg border-t border-slate-100">
            <div className="px-4 py-4 space-y-2">
              <NavLink
                to="/"
                end
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </NavLink>

              <NavLink
                to="/products"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Products
              </NavLink>

              {role === 'vendor' && (
                <NavLink
                  to="/vendor"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Vendor Dashboard
                </NavLink>
              )}

              {role === 'admin' && (
                <NavLink
                  to="/admin"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Admin Panel
                </NavLink>
              )}

              {user && role === 'user' && (
                <>
                  <NavLink
                    to="/cart"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                      }`
                    }
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Cart
                  </NavLink>

                  <NavLink
                    to="/orders"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                      }`
                    }
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    My Orders
                  </NavLink>

                  <NavLink
                    to="/wishlist"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-rose-500/20'
                          : 'text-slate-600 hover:text-rose-500 hover:bg-rose-50'
                      }`
                    }
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Wishlist
                  </NavLink>
                </>
              )}

              {/* Auth Section Mobile */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                {!user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <NavLink
                      to="/login"
                      onClick={handleNavClick}
                      className="px-4 py-3 rounded-xl text-sm font-semibold text-center border-2 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={handleNavClick}
                      className="px-4 py-3 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-200"
                    >
                      Sign Up
                    </NavLink>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-base font-bold text-white shadow-md">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name || 'Profile'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(user.name)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-blue-600 uppercase font-bold tracking-wide">{role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-center border-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Panel (Right Side Drawer) */}
      {user && showProfilePanel && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={closeProfilePanel}
          />

          {/* Panel */}
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 pt-8 pb-16">
              {/* Close Button */}
              <button
                onClick={closeProfilePanel}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* User Avatar & Info */}
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="h-24 w-24 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white/30 shadow-xl">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name || 'Profile'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user.name)}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white truncate">{user.name}</h2>
                  <p className="text-blue-100 text-sm truncate mt-1">{user.email}</p>
                  <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold text-white uppercase tracking-wide">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    {role}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="px-6 -mt-8 relative z-10">
              {role === 'user' && (
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 grid grid-cols-3 gap-4 border border-slate-100">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{userStats.totalOrders ?? 0}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Orders</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">₹{userStats.totalSpent ?? 0}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Spent</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{formatDate(userStats.lastOrderDate)}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Last Order</p>
                  </div>
                </div>
              )}
              {role === 'vendor' && (
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 grid grid-cols-2 gap-4 border border-slate-100">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{userStats.totalOrders ?? 0}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">₹{userStats.totalRevenue ?? 0}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Total Sales</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{userStats.totalProductsSold ?? 0}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Products Sold</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{formatDate(userStats.lastOrderDate)}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Last Vendor Order</p>
                  </div>
                </div>
              )}
              {role === 'admin' && (
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 grid grid-cols-3 gap-4 border border-slate-100">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{userStats.totalUsers ?? 0}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Total Users</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{userStats.totalVendors ?? 0}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Total Vendors</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{userStats.totalProducts ?? 0}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Total Products Listed</p>
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Personal Info */}
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Personal Information
                </h3>
                <div className="bg-slate-50 rounded-2xl p-1">
                  <div className="bg-white rounded-xl divide-y divide-slate-100">
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </span>
                        <span className="text-sm text-slate-500">Full Name</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 text-right max-w-[150px] truncate">
                        {user.name || 'Not set'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </span>
                        <span className="text-sm text-slate-500">Email</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 text-right max-w-[150px] truncate">
                        {user.email || 'Not set'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </span>
                        <span className="text-sm text-slate-500">Mobile</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {user.mobileNumber || 'Not set'}
                      </span>
                    </div>

                    {user.alternateMobileNumber && (
                      <div className="flex items-center justify-between px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                          <span className="text-sm text-slate-500">Alternate</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {user.alternateMobileNumber}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </span>
                        <span className="text-sm text-slate-500">Gender</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 capitalize">
                        {user.gender || 'Not set'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                            />
                          </svg>
                        </span>
                        <span className="text-sm text-slate-500">Birthday</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatDate(user.dateOfBirth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      closeProfilePanel();
                      navigate('/orders');
                    }}
                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <span className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-200">
                      <svg
                        className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">My Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      closeProfilePanel();
                      navigate('/wishlist');
                    }}
                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 transition-all duration-200 group"
                  >
                    <span className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:bg-rose-500 group-hover:shadow-lg group-hover:shadow-rose-500/20 transition-all duration-200">
                      <svg
                        className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-rose-500">Wishlist</span>
                  </button>

                  <button
                    onClick={() => {
                      closeProfilePanel();
                      navigate('/addresses');
                    }}
                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <span className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:bg-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-200">
                      <svg
                        className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-600">Addresses</span>
                  </button>

                  <button
                    onClick={() => {
                      closeProfilePanel();
                      navigate('/profile/settings');
                    }}
                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-purple-50 transition-all duration-200 group"
                  >
                    <span className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:bg-purple-500 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-200">
                      <svg
                        className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-purple-600">Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-3">
              <button
                onClick={() => {
                  closeProfilePanel();
                  navigate('/profile');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-3.5 rounded-xl border-2 border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }

        .animate-dropdown-in {
          animation: dropdown-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar; 