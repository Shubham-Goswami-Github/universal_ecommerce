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
  const [siteName, setSiteName] = useState('MultiVendorEcom'); // fallback
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

  const linkBase = 'block px-3 py-2 rounded-md text-sm font-medium transition-colors';

  const getNavLinkClass = ({ isActive }) =>
    `${linkBase} ${
      isActive
        ? 'bg-slate-800 text-teal-300'
        : 'text-slate-300 hover:text-teal-200 hover:bg-slate-800'
    }`;

  // Normalize incoming logo URL to backend if it points to the frontend dev server
  const normalizeLogoUrl = (rawUrl) => {
    if (!rawUrl) return null;

    // If axiosClient has baseURL (e.g. http://localhost:3000), prefer that as backend origin
    const axiosBase = axiosClient?.defaults?.baseURL?.replace(/\/$/, '') || null;

    try {
      const u = new URL(rawUrl);

      // If admin accidentally saved a frontend dev-server URL (ports like 5173), rewrite
      const frontendPorts = ['5173', '5174'];
      if (frontendPorts.includes(u.port)) {
        const path = u.pathname + (u.search || '');
        if (axiosBase) return axiosBase + path;
        return `${u.protocol}//${u.hostname}:3000${path}`;
      }

      // otherwise return absolute url unchanged
      return rawUrl;
    } catch (err) {
      // rawUrl is likely relative like "/uploads/xxx.png"
      if (rawUrl.startsWith('/')) {
        if (axiosBase) return axiosBase + rawUrl;
        // fallback: assume backend on same host but port 3000
        const origin = window.location.origin.replace(/:\d+$/, ':3000');
        return origin + rawUrl;
      }
      // unknown format, return as-is
      return rawUrl;
    }
  };

  // fetch public settings
  const fetchSettings = async () => {
    try {
      const res = await axiosClient.get('/api/settings/public');
      const data = res.data || {};
      if (data.siteName) setSiteName(data.siteName);

      const normalized = normalizeLogoUrl(data.logoUrl || '');
      if (normalized) setLogoUrl(normalized);
      else setLogoUrl(null);
    } catch (err) {
      // keep fallback; optionally console.warn
      // console.warn('Could not load site settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();

    // listen for admin saves: dispatch window event 'settings:updated' from admin code to refresh navbar instantly
    const onSettingsUpdated = () => {
      fetchSettings();
    };
    window.addEventListener('settings:updated', onSettingsUpdated);

    return () => {
      window.removeEventListener('settings:updated', onSettingsUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2" onClick={handleNavClick}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-400 text-slate-900 font-bold text-lg shadow-sm overflow-hidden">
                {logoUrl ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img src={logoUrl} alt="site logo" className="object-contain h-full w-full" />
                ) : (
                  <span className="text-lg">{siteName?.charAt(0) || 'E'}</span>
                )}
              </span>

              <span className="text-slate-100 font-semibold text-lg select-none">
                {siteName?.split(' ').map((part, i, arr) => (
                  <span key={i} className={i === arr.length - 1 ? 'text-teal-300' : ''}>
                    {part}
                    {i < arr.length - 1 ? ' ' : ''}
                  </span>
                )) || 'MultiVendorEcom'}
              </span>
            </Link>
          </div>

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

            {/* Right side - auth */}
            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <NavLink
                    to="/login"
                    className="px-3 py-1.5 rounded-md text-sm font-medium border border-slate-600 text-slate-100 hover:border-teal-400 hover:text-teal-300"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="px-3 py-1.5 rounded-md text-sm font-semibold bg-teal-400 text-slate-900 hover:bg-teal-300"
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-slate-100 font-semibold">{user.name}</span>
                    <span className="text-xs uppercase text-teal-300">{role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-md text-sm font-medium border border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <div className="space-y-1 px-3 pt-2 pb-3">
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

            <div className="border-t border-slate-800 mt-2 pt-2 space-y-2">
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
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-100 font-semibold">{user.name}</span>
                    <span className="text-xs uppercase text-teal-300">{role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10"
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
