// src/components/layout/Navbar.jsx
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // site settings
  const [siteName, setSiteName] = useState('MultiVendorEcom');
  const [logoUrl, setLogoUrl] = useState(null);

  const user = auth.user;
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const linkBase =
    'block px-3 py-2 rounded-md text-sm font-medium transition-colors';

  const getNavLinkClass = ({ isActive }) =>
    `${linkBase} ${
      isActive
        ? 'bg-blue-50 text-blue-600'
        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
    }`;

  // normalize logo url (UNCHANGED)
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

  useEffect(() => {
    fetchSettings();
    const onSettingsUpdated = () => fetchSettings();
    window.addEventListener('settings:updated', onSettingsUpdated);
    return () => {
      window.removeEventListener('settings:updated', onSettingsUpdated);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-2"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="site logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span>{siteName?.charAt(0) || 'E'}</span>
              )}
            </span>

            <span className="text-slate-900 font-semibold text-lg select-none">
              {siteName || 'MultiVendorEcom'}
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              <NavLink to="/" end className={getNavLinkClass}>
                Home
              </NavLink>
              <NavLink to="/products" className={getNavLinkClass}>
                Products
              </NavLink>

              {role === 'vendor' && (
                <NavLink to="/vendor" className={getNavLinkClass}>
                  Vendor Dashboard
                </NavLink>
              )}

              {role === 'admin' && (
                <NavLink to="/admin" className={getNavLinkClass}>
                  Admin Panel
                </NavLink>
              )}

              {user && role === 'user' && (
                <>
                  <NavLink to="/cart" className={getNavLinkClass}>
                    Cart
                  </NavLink>
                  <NavLink to="/orders" className={getNavLinkClass}>
                    Orders
                  </NavLink>
                </>
              )}
            </div>

            {/* Auth section */}
            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:text-blue-600"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-4 py-1.5 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-end leading-tight">
                    <span className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </span>
                    <span className="text-[11px] uppercase text-blue-600">
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-md text-sm font-medium border border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen((p) => !p)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="space-y-1 px-4 py-3">
            <NavLink to="/" end className={getNavLinkClass} onClick={handleNavClick}>
              Home
            </NavLink>
            <NavLink to="/products" className={getNavLinkClass} onClick={handleNavClick}>
              Products
            </NavLink>

            {role === 'vendor' && (
              <NavLink to="/vendor" className={getNavLinkClass} onClick={handleNavClick}>
                Vendor Dashboard
              </NavLink>
            )}

            {role === 'admin' && (
              <NavLink to="/admin" className={getNavLinkClass} onClick={handleNavClick}>
                Admin Panel
              </NavLink>
            )}

            {user && role === 'user' && (
              <>
                <NavLink to="/cart" className={getNavLinkClass} onClick={handleNavClick}>
                  Cart
                </NavLink>
                <NavLink to="/orders" className={getNavLinkClass} onClick={handleNavClick}>
                  Orders
                </NavLink>
              </>
            )}

            <div className="border-t border-slate-200 pt-3 mt-2">
              {!user ? (
                <>
                  <NavLink to="/login" className={getNavLinkClass} onClick={handleNavClick}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={getNavLinkClass} onClick={handleNavClick}>
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <span className="block text-sm font-semibold text-slate-900">
                      {user.name}
                    </span>
                    <span className="text-[11px] uppercase text-blue-600">
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
