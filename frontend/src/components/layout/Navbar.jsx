// src/components/layout/Navbar.jsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const normalizeHex = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return fallback;
};

const hexToRgb = (hex) => {
  const safeHex = normalizeHex(hex, '#10b981');
  const value = safeHex.replace('#', '');
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

const rgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* ─────────────────────────────────────────────────────────────
   NAVBAR COMPONENT
───────────────────────────────────────────────────────────── */
const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Refs
  const dropdownRef = useRef(null);
  const categoryRef = useRef(null);
  const searchRef = useRef(null);

  // Site settings
  const [siteName, setSiteName] = useState('ShopCart');
  const [logoUrl, setLogoUrl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brandAccent, setBrandAccent] = useState({
    primary: '#10b981',
    secondary: '#14b8a6',
  });

  // User stats
  const [userStats, setUserStats] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const user = auth.user;
  const role = user?.role;
  const isDashboardRoute =
    /^\/admin(\/|$)/.test(location.pathname) ||
    /^\/vendor(\/|$)/.test(location.pathname);
  const accentPrimary = brandAccent.primary;
  const accentSecondary = brandAccent.secondary;
  const accentSoft = rgba(accentPrimary, 0.1);
  const accentSoftBorder = rgba(accentPrimary, 0.18);
  const accentShadow = rgba(accentPrimary, 0.25);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowSearch(false);
  }, [location.pathname]);

  // Fetch settings and categories
  useEffect(() => {
    fetchSettings();
    fetchCategories();
    if (user && role === 'user') {
      fetchCartCount();
      fetchWishlistCount();
    }
    
    const onSettingsUpdated = () => fetchSettings();
    const onCartUpdated = () => {
      if (user && role === 'user') {
        fetchCartCount();
      }
    };
    window.addEventListener('settings:updated', onSettingsUpdated);
    window.addEventListener('cart:updated', onCartUpdated);
    return () => {
      window.removeEventListener('settings:updated', onSettingsUpdated);
      window.removeEventListener('cart:updated', onCartUpdated);
    };
  }, [user, role]);

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
      setBrandAccent({
        primary: normalizeHex(data.homeAccentPrimary, '#10b981'),
        secondary: normalizeHex(data.homeAccentSecondary, '#14b8a6'),
      });
    } catch {
      // silent fallback
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/api/categories/public/all');
      setCategories(res.data?.categories || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await axiosClient.get('/api/cart', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const items = res.data?.cart?.items || [];
      setCartCount(items.reduce((sum, item) => sum + (item.quantity || 1), 0));
    } catch {
      setCartCount(0);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const res = await axiosClient.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setWishlistCount(res.data?.wishlist?.products?.length || 0);
    } catch {
      setWishlistCount(0);
    }
  };

  const fetchUserStats = async () => {
    if (!user?._id) return;
    try {
      let endpoint = '';
      if (role === 'user') endpoint = '/api/orders/my-stats';
      else if (role === 'vendor') endpoint = '/api/vendor/sales-stats';
      else if (role === 'admin') endpoint = '/api/admin/stats';
      else return;
      
      const res = await axiosClient.get(endpoint, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUserStats(res.data || {});
    } catch (err) {
      console.error('fetchUserStats error:', err);
      setUserStats({});
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfilePanel(false);
    setShowUserDropdown(false);
    setIsOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const openProfilePanel = () => {
    if (user) {
      setShowProfilePanel(true);
      setShowUserDropdown(false);
      fetchUserStats();
    }
  };

  const closeProfilePanel = () => setShowProfilePanel(false);

  const formatDate = (value) => {
    if (!value) return 'Not set';
    try {
      return new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
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

  // Get super categories for mega menu
  const superCategories = categories.filter(c => c.type === 'super');
  const getSubCategories = (parentId) => 
    categories.filter(c => c.parent === parentId || c.parent?._id === parentId);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          TOP BAR (Optional - For announcements, etc.)
      ═══════════════════════════════════════════════════════════════ */}
      {!isDashboardRoute && (
      <div className="hidden lg:block bg-gray-900 text-gray-300 text-xs">
        <div className="w-full px-3 sm:px-4 lg:px-5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +91 1234567890
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@shopcart.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link>
            <span className="text-gray-600">|</span>
            <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
            <span className="text-gray-600">|</span>
            {role === 'vendor' && (
              <Link to="/vendor" className="hover:text-white transition-colors">Seller Dashboard</Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="hover:text-white transition-colors">Admin Panel</Link>
            )}
            {!user && (
              <Link to="/vendor/register" className="hover:text-white transition-colors">Sell on {siteName}</Link>
            )}
          </div>
        </div>
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MAIN NAVBAR
      ═══════════════════════════════════════════════════════════════ */}
      <nav
        style={{
          '--navbar-accent-primary': accentPrimary,
          '--navbar-accent-secondary': accentSecondary,
          '--navbar-accent-soft': accentSoft,
          '--navbar-accent-border': accentSoftBorder,
          '--navbar-height': '64px',
          '--navbar-height-desktop': '72px',
        }}
        className={`navbar-theme sticky top-0 z-[80] transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="w-full px-3 sm:px-4 lg:px-5">
          <div className="flex h-16 lg:h-[72px] items-center gap-4 lg:gap-8">
            
            {/* ─────────────────────────────────────────────
                LOGO / BRAND
            ───────────────────────────────────────────── */}
            <Link
              to="/"
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="relative">
                {logoUrl ? (
                  <div className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:shadow-md transition-all duration-300">
                    <img
                      src={logoUrl}
                      alt={siteName}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                ) : (
                  <div
                    className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${accentPrimary}, ${accentSecondary})`, boxShadow: `0 12px 28px ${accentShadow}` }}
                  >
                    {siteName?.charAt(0) || 'S'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: accentPrimary }}></span>
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-900 font-bold text-xl tracking-tight transition-colors group-hover:opacity-90" style={{ color: accentPrimary }}>
                  {siteName}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" style={{ color: accentPrimary }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Trusted
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>Fast Delivery</span>
                </div>
              </div>
            </Link>

            {/* ─────────────────────────────────────────────
                SEARCH BAR (Desktop)
            ───────────────────────────────────────────── */}
            <form 
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 max-w-2xl"
            >
              <div className={`relative w-full flex items-center transition-all duration-300 ${
                searchFocused ? 'scale-[1.02]' : ''
              }`}>
                {/* Category Dropdown */}
                <div className="relative" ref={categoryRef}>
                  <button
                    type="button"
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className={`h-11 px-4 flex items-center gap-2 bg-gray-100 border border-r-0 rounded-l-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors ${
                      searchFocused ? '' : 'border-gray-200'
                    }`}
                    style={searchFocused ? { borderColor: accentPrimary, backgroundColor: accentSoft } : undefined}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="hidden xl:inline">All Categories</span>
                    <svg className={`w-3 h-3 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Category Mega Menu */}
                  {showCategoryMenu && (
                    <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-dropdown-in z-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Shop by Category</h3>
                        <Link 
                          to="/categories" 
                          onClick={() => setShowCategoryMenu(false)}
                          className="text-sm font-medium flex items-center gap-1"
                          style={{ color: accentPrimary }}
                        >
                          View All
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {superCategories.slice(0, 9).map((cat) => (
                          <Link
                            key={cat._id}
                            to={`/category/${cat._id}`}
                            onClick={() => setShowCategoryMenu(false)}
                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 transition-colors group-hover:opacity-80" style={{ color: accentPrimary }}>{cat.name}</p>
                              <p className="text-xs text-gray-400">{getSubCategories(cat._id).length} items</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Search for products, brands and more..."
                    className={`w-full h-11 pl-4 pr-12 bg-gray-50 border text-sm placeholder:text-gray-400 focus:outline-none transition-all ${
                      searchFocused 
                        ? 'bg-white' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={searchFocused ? { borderColor: accentPrimary, boxShadow: `0 0 0 4px ${accentSoft}` } : undefined}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-11 w-12 rounded-r-xl flex items-center justify-center text-white transition-colors"
                    style={{ background: `linear-gradient(135deg, ${accentPrimary}, ${accentSecondary})` }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            {/* ─────────────────────────────────────────────
                NAVIGATION LINKS (Desktop)
            ───────────────────────────────────────────── */}
            <div className="hidden xl:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                style={({ isActive }) => (isActive ? { color: accentPrimary, backgroundColor: accentSoft } : undefined)}
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                style={({ isActive }) => (isActive ? { color: accentPrimary, backgroundColor: accentSoft } : undefined)}
              >
                Products
              </NavLink>
              <NavLink
                to="/products?sale=true"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                  }`
                }
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Deals
              </NavLink>
            </div>

            {/* ─────────────────────────────────────────────
                RIGHT ACTIONS
            ───────────────────────────────────────────── */}
            <div className="flex items-center gap-2 lg:gap-3 ml-auto">
              
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="lg:hidden p-2.5 rounded-xl text-gray-500 transition-all"
                style={{ color: showSearch ? accentPrimary : undefined, backgroundColor: showSearch ? accentSoft : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist */}
              {user && role === 'user' && (
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) =>
                    `relative p-2.5 rounded-xl transition-all duration-200 hidden sm:flex ${
                      isActive
                        ? 'text-rose-500 bg-rose-50'
                        : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50'
                    }`
                  }
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-rose-500/30 animate-scale-in">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </NavLink>
              )}

              {/* Cart */}
              {user && role === 'user' && (
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `relative p-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? ''
                        : 'text-gray-500'
                    }`
                  }
                  style={({ isActive }) => (isActive ? { color: accentPrimary, backgroundColor: accentSoft } : undefined)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-scale-in" style={{ backgroundColor: accentPrimary, boxShadow: `0 10px 18px ${accentShadow}` }}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </NavLink>
              )}

              {/* Orders (User) */}
              {user && role === 'user' && (
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `relative p-2.5 rounded-xl transition-all duration-200 hidden md:flex ${
                      isActive
                        ? ''
                        : 'text-gray-500'
                    }`
                  }
                  style={({ isActive }) => (isActive ? { color: accentPrimary, backgroundColor: accentSoft } : undefined)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </NavLink>
              )}

              {/* Divider */}
              <div className="hidden md:block w-px h-8 bg-gray-200"></div>

              {/* Auth Section */}
              {!user ? (
                <div className="flex items-center gap-2">
                  <NavLink
                    to="/login"
                    className="hidden sm:flex px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 transition-all"
                    style={{ color: location.pathname === '/login' ? accentPrimary : undefined, backgroundColor: location.pathname === '/login' ? accentSoft : undefined }}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="hidden sm:flex px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${accentPrimary}, ${accentSecondary})`, boxShadow: `0 12px 28px ${accentShadow}` }}
                  >
                    Sign Up
                  </NavLink>
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  {/* Profile Button */}
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all duration-200 ${
                      showUserDropdown
                        ? ''
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                    style={showUserDropdown ? { backgroundColor: accentSoft, borderColor: accentSoftBorder } : undefined}
                  >
                    <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${accentPrimary}, ${accentSecondary})` }}>
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{getInitials(user.name)}</span>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="text-xs text-gray-400">Hello,</span>
                      <span className="text-sm font-semibold text-gray-800 max-w-[80px] truncate">
                        {user.name?.split(' ')[0]}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform hidden lg:block ${
                        showUserDropdown ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <UserDropdown
                      user={user}
                      role={role}
                      getInitials={getInitials}
                      openProfilePanel={openProfilePanel}
                      setShowUserDropdown={setShowUserDropdown}
                      handleLogout={handleLogout}
                    />
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 rounded-xl text-gray-600 transition-all"
                style={{ color: isOpen ? accentPrimary : undefined, backgroundColor: isOpen ? accentSoft : undefined }}
              >
                {isOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            MOBILE SEARCH BAR
        ───────────────────────────────────────────── */}
        {showSearch && (
          <div className="lg:hidden px-4 pb-4 animate-slide-down">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 pl-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-9 w-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────
            MOBILE MENU
        ───────────────────────────────────────────── */}
      </nav>

      <MobileMenu
        isOpen={isOpen}
        user={user}
        role={role}
        categories={superCategories}
        getInitials={getInitials}
        openProfilePanel={openProfilePanel}
        handleLogout={handleLogout}
        setIsOpen={setIsOpen}
      />

      {/* ═══════════════════════════════════════════════════════════════
          PROFILE PANEL (Slide-out Drawer)
      ═══════════════════════════════════════════════════════════════ */}
      {user && showProfilePanel && (
        <ProfilePanel
          user={user}
          role={role}
          userStats={userStats}
          getInitials={getInitials}
          formatDate={formatDate}
          closeProfilePanel={closeProfilePanel}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 800px; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .animate-dropdown-in { animation: dropdown-in 0.2s ease-out; }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }

        .navbar-theme .text-emerald-600 { color: var(--brand-accent-primary, var(--navbar-accent-primary)) !important; }
        .navbar-theme .bg-emerald-50 { background-color: color-mix(in srgb, var(--brand-accent-primary, var(--navbar-accent-primary)) 10%, white) !important; }
        .navbar-theme .border-emerald-200 { border-color: color-mix(in srgb, var(--brand-accent-primary, var(--navbar-accent-primary)) 18%, white) !important; }
        .navbar-theme .bg-emerald-500 { background-color: var(--brand-accent-primary, var(--navbar-accent-primary)) !important; }
        .navbar-theme .bg-emerald-100 { background-color: color-mix(in srgb, var(--brand-accent-primary, var(--navbar-accent-primary)) 12%, white) !important; }
        .navbar-theme .text-emerald-700 { color: var(--brand-accent-primary, var(--navbar-accent-primary)) !important; }
        .navbar-theme .text-emerald-100 { color: rgba(255,255,255,0.82) !important; }
        .navbar-theme .hover\\:text-emerald-600:hover { color: var(--brand-accent-primary, var(--navbar-accent-primary)) !important; }
        .navbar-theme .hover\\:bg-emerald-50:hover { background-color: color-mix(in srgb, var(--brand-accent-primary, var(--navbar-accent-primary)) 10%, white) !important; }
        .navbar-theme .focus\\:border-emerald-500:focus { border-color: var(--brand-accent-primary, var(--navbar-accent-primary)) !important; }
      `}</style>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   USER DROPDOWN COMPONENT
───────────────────────────────────────────────────────────── */
const UserDropdown = ({
  user,
  role,
  getInitials,
  openProfilePanel,
  setShowUserDropdown,
  handleLogout,
}) => (
  <div className="navbar-theme absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-dropdown-in z-50">
    {/* User Header */}
    <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-emerald-500/20">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <span>{getInitials(user.name)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
          role === 'admin' ? 'bg-purple-100 text-purple-700' :
          role === 'vendor' ? 'bg-blue-100 text-blue-700' :
          'bg-emerald-100 text-emerald-700'
        }`}>
          {role}
        </span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">Verified Account</span>
      </div>
    </div>

    {/* Quick Links */}
    <div className="p-2">
      <button
        onClick={openProfilePanel}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
        <span className="font-medium">My Profile</span>
        <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {role === 'user' && (
        <>
          <Link
            to="/orders"
            onClick={() => setShowUserDropdown(false)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            <span className="font-medium">My Orders</span>
          </Link>

          <Link
            to="/wishlist"
            onClick={() => setShowUserDropdown(false)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-rose-50 transition-colors group"
          >
            <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-gray-500 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </span>
            <span className="font-medium group-hover:text-rose-600 transition-colors">Wishlist</span>
          </Link>

          <Link
            to="/addresses"
            onClick={() => setShowUserDropdown(false)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span className="font-medium">Addresses</span>
          </Link>
        </>
      )}

      {role === 'vendor' && (
        <Link
          to="/vendor"
          onClick={() => setShowUserDropdown(false)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-blue-50 transition-colors group"
        >
          <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </span>
          <span className="font-medium group-hover:text-blue-600 transition-colors">Seller Dashboard</span>
        </Link>
      )}

      {role === 'admin' && (
        <Link
          to="/admin"
          onClick={() => setShowUserDropdown(false)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-purple-50 transition-colors group"
        >
          <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <span className="font-medium group-hover:text-purple-600 transition-colors">Admin Panel</span>
        </Link>
      )}

      <Link
        to="/profile/settings"
        onClick={() => setShowUserDropdown(false)}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <span className="font-medium">Settings</span>
      </Link>
    </div>

    {/* Logout */}
    <div className="border-t border-gray-100 p-2">
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MOBILE MENU COMPONENT
───────────────────────────────────────────────────────────── */
const MobileMenu = ({
  isOpen,
  user,
  role,
  categories,
  getInitials,
  openProfilePanel,
  handleLogout,
  setIsOpen,
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!isOpen) return null;

  return (
    <div
      className="navbar-theme lg:hidden fixed left-0 right-0 bottom-0 z-[70]"
      style={{ top: 'var(--navbar-height, 64px)' }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Panel */}
      <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <span>{getInitials(user.name)}</span>
                )}
              </div>
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-white/80">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Welcome!</p>
                <p className="text-sm text-white/80">Sign in to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="p-4 border-b border-gray-100">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </NavLink>

            <NavLink
              to="/products"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              All Products
            </NavLink>

            <NavLink
              to="/products?sale=true"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-rose-50 text-rose-600' : 'text-gray-700 hover:bg-rose-50'
                }`
              }
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Hot Deals
            </NavLink>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">Categories</p>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat._id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                </div>
                {cat.name}
              </Link>
            ))}
            <Link
              to="/categories"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              View All Categories
            </Link>
          </div>

          {/* User Links */}
          {user && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">My Account</p>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  openProfilePanel();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                My Profile
              </button>

              {role === 'user' && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    My Orders
                  </Link>

                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    Shopping Cart
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-rose-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="group-hover:text-rose-600 transition-colors">Wishlist</span>
                  </Link>

                  <Link
                    to="/addresses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    Saved Addresses
                  </Link>
                </>
              )}

              {role === 'vendor' && (
                <Link
                  to="/vendor"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="group-hover:text-blue-600 transition-colors">Vendor Dashboard</span>
                </Link>
              )}

              {role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="group-hover:text-purple-600 transition-colors">Admin Panel</span>
                </Link>
              )}
            </div>
          )}

          {/* Help Links */}
          <div className="p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">Help & Support</p>
            <Link
              to="/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Help Center
            </Link>
            <Link
              to="/track-order"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              Track Order
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {user ? (
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-center border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-center bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   PROFILE PANEL COMPONENT
───────────────────────────────────────────────────────────── */
const ProfilePanel = ({
  user,
  role,
  userStats,
  getInitials,
  formatDate,
  closeProfilePanel,
  handleLogout,
  navigate,
}) => (
  <div className="navbar-theme fixed inset-0 z-50 flex">
    {/* Backdrop */}
    <div
      className="flex-1 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={closeProfilePanel}
    />

    {/* Panel */}
    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 pt-8 pb-16">
        <button
          onClick={closeProfilePanel}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white/30 shadow-xl">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{user.name}</h2>
            <p className="text-emerald-100 text-sm truncate mt-0.5">{user.email}</p>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
              role === 'admin' ? 'bg-purple-500/30 text-purple-100' :
              role === 'vendor' ? 'bg-blue-500/30 text-blue-100' :
              'bg-white/20 text-white'
            }`}>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 -mt-8 relative z-10">
        {role === 'user' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-5 grid grid-cols-3 gap-4 border border-gray-100">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900">{userStats.totalOrders ?? 0}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Orders</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900">₹{(userStats.totalSpent ?? 0).toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Spent</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-900">{formatDate(userStats.lastOrderDate)}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Last Order</p>
            </div>
          </div>
        )}

        {role === 'vendor' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-5 grid grid-cols-2 gap-4 border border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userStats.totalOrders ?? 0}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">₹{(userStats.totalRevenue ?? 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userStats.totalProductsSold ?? 0}</p>
              <p className="text-xs text-gray-500">Products Sold</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{formatDate(userStats.lastOrderDate)}</p>
              <p className="text-xs text-gray-500">Last Sale</p>
            </div>
          </div>
        )}

        {role === 'admin' && (
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-5 grid grid-cols-3 gap-4 border border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers ?? 0}</p>
              <p className="text-xs text-gray-500">Users</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-2xl font-bold text-emerald-600">{userStats.totalVendors ?? 0}</p>
              <p className="text-xs text-gray-500">Vendors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userStats.totalProducts ?? 0}</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h3>
          <div className="bg-gray-50 rounded-xl p-1">
            <div className="bg-white rounded-lg divide-y divide-gray-50">
              {[
                { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Name', value: user.name },
                { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Email', value: user.email },
                { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label: 'Mobile', value: user.mobileNumber || 'Not set' },
                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Birthday', value: formatDate(user.dateOfBirth) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </span>
                    <span className="text-sm text-gray-500">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 max-w-[140px] truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Orders', path: '/orders', color: 'emerald' },
              { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label: 'Wishlist', path: '/wishlist', color: 'rose' },
              { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z', label: 'Addresses', path: '/addresses', color: 'blue' },
              { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Settings', path: '/profile/settings', color: 'purple' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => { closeProfilePanel(); navigate(item.path); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-${item.color}-50 transition-colors group`}
              >
                <span className={`w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-${item.color}-500 flex items-center justify-center transition-colors`}>
                  <svg className={`w-5 h-5 text-gray-500 group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </span>
                <span className={`text-xs font-semibold text-gray-600 group-hover:text-${item.color}-600`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-3">
        <button
          onClick={() => { closeProfilePanel(); navigate('/profile'); }}
          className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border-2 border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  </div>
);

export default Navbar;
