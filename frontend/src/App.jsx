// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';
import axiosClient from './api/axiosClient';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Vendors from './pages/Vendors';
import VendorStorePage from './pages/VendorStorePage';
// App.jsx ya jaha routes define hain
import Profile from './pages/Profile';
// In your router configuration (e.g., App.jsx)
import CategoryPage from './pages/CategoryPage';
import CategoriesPage from './pages/CategoriesPage';
import MaintenancePage from './pages/MaintenancePage';

const buildBackgroundStyle = ({ color, image, repeat, size, fitScreen, accentPrimary, accentSecondary }) => {
  const overlay = accentPrimary || accentSecondary
    ? `linear-gradient(135deg, ${accentPrimary || color || '#ffffff'}52 0%, ${accentSecondary || accentPrimary || color || '#ffffff'}38 100%)`
    : undefined;

  return {
    backgroundColor: color || undefined,
    backgroundImage: [overlay, image ? `url(${image})` : undefined].filter(Boolean).join(', ') || undefined,
    backgroundRepeat: overlay && image ? `no-repeat, ${repeat || 'no-repeat'}` : 'no-repeat',
    backgroundSize: overlay && image ? `cover, ${size || 'cover'}` : (overlay ? 'cover' : (size || undefined)),
    backgroundPosition: image ? (overlay ? 'center center, center top' : 'center top') : 'center center',
    backgroundAttachment: fitScreen ? 'fixed' : undefined,
  };
};

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function AppInner({ maintenanceMode }) {
  const { auth } = useAuth();
  const location = useLocation();
  const isAdminRoute = /^\/admin(\/|$)/.test(location.pathname);
  const isLoginRoute = location.pathname === '/login';
  const isAdminUser = auth?.user?.role === 'admin';
  const shouldShowMaintenancePage =
    maintenanceMode &&
    !isAdminRoute &&
    !isLoginRoute &&
    !isAdminUser;

  const hideFooter =
    isAdminRoute ||
    /^\/vendor(\/|$)/.test(location.pathname);
  const isFullBleedPage =
    location.pathname === '/' ||
    location.pathname === '/products' ||
    location.pathname === '/categories' ||
    location.pathname.startsWith('/category/') ||
    hideFooter;

  if (shouldShowMaintenancePage) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main className={isFullBleedPage ? 'flex-1' : 'flex-1 py-4'}>
        <div className={isFullBleedPage ? '' : 'px-3 sm:px-4'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            // Add these routes
<Route path="/category/:categoryId" element={<CategoryPage />} />
<Route path="/categories" element={<CategoriesPage />} />
// ...

<Route path="/profile" element={<Profile />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor"
              element={
                <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendor-store/:id" element={<VendorStorePage />} />
          </Routes>
        </div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function AppShell({ appearance, loadingAppearance }) {
  const location = useLocation();
  const isAdminRoute = /^\/admin(\/|$)/.test(location.pathname);
  const isVendorRoute = /^\/vendor(\/|$)/.test(location.pathname);
  const isHomeRoute = location.pathname === '/';
  const isRestBackgroundRoute = !isHomeRoute && !isAdminRoute && !isVendorRoute;
  const maintenanceMode = Boolean(appearance?.isMaintenanceMode);

  const style = {
    color: appearance?.fontColor || undefined,
    fontFamily: appearance?.fontFamily || undefined,
    '--brand-accent-primary': appearance?.homeAccentPrimary || '#0056b3',
    '--brand-accent-secondary': appearance?.homeAccentSecondary || '#00a0ff',
    ...(isRestBackgroundRoute
      ? buildBackgroundStyle({
          color: appearance?.restBackgroundColor || appearance?.backgroundColor,
          accentPrimary: appearance?.restBackgroundAccentPrimary || appearance?.homeAccentPrimary,
          accentSecondary: appearance?.restBackgroundAccentSecondary || appearance?.homeAccentSecondary,
          image: appearance?.restBackgroundImage || appearance?.backgroundImage,
          repeat: appearance?.restBackgroundRepeat || appearance?.backgroundRepeat,
          size: appearance?.restBackgroundSize || appearance?.backgroundSize,
          fitScreen: appearance?.restBackgroundFitScreen,
        })
      : {}),
  };

  return (
    <div
      style={style}
      className={`relative isolate min-h-screen text-slate-900 dark:text-gray-100 ${isRestBackgroundRoute ? 'rest-background-mode' : ''}`}
    >
      {isRestBackgroundRoute && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none"
          style={buildBackgroundStyle({
            color: appearance?.restBackgroundColor || appearance?.backgroundColor,
            accentPrimary: appearance?.restBackgroundAccentPrimary || appearance?.homeAccentPrimary,
            accentSecondary: appearance?.restBackgroundAccentSecondary || appearance?.homeAccentSecondary,
            image: appearance?.restBackgroundImage || appearance?.backgroundImage,
            repeat: appearance?.restBackgroundRepeat || appearance?.backgroundRepeat,
            size: appearance?.restBackgroundSize || appearance?.backgroundSize,
            fitScreen: appearance?.restBackgroundFitScreen,
          })}
        />
      )}
      {isRestBackgroundRoute && (
        <style>{`
          .rest-background-mode main > div > * {
            background-color: transparent !important;
          }
        `}</style>
      )}
      {loadingAppearance ? (
        <div className="relative z-10 min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-slate-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin" />
            <span className="text-sm text-slate-400 dark:text-gray-500 font-medium">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <AppInner maintenanceMode={maintenanceMode} />
        </div>
      )}
    </div>
  );
}

/* ─── Dark Mode Initializer ─── */
function initDarkMode() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default function ThemedApp() {
  const [appearance, setAppearance] = useState(null);
  const [loadingAppearance, setLoadingAppearance] = useState(true);

  // Initialize dark mode on mount
  useEffect(() => {
    initDarkMode();
    // Listen for system preference changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (!localStorage.getItem('theme')) initDarkMode();
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const fetchAppearance = () => {
    axiosClient
      .get('/api/settings/public')
      .then((res) => {
        const nextAppearance = res.data || {};
        setAppearance(nextAppearance);
        localStorage.setItem('maintenanceMode', nextAppearance.isMaintenanceMode ? 'true' : 'false');
      })
      .catch((err) => {
        console.warn('Could not load appearance settings', err);
      })
      .finally(() => {
        setLoadingAppearance(false);
      });
  };

  useEffect(() => {
    fetchAppearance();
    window.addEventListener('settings:updated', fetchAppearance);
    return () => window.removeEventListener('settings:updated', fetchAppearance);
  }, []);

  useEffect(() => {
    const nextTitle = appearance?.tabName?.trim() || appearance?.siteName?.trim() || 'My Ecommerce Store';
    document.title = nextTitle;

    const faviconHref = appearance?.tabIconUrl?.trim() || '/vite.svg';

    let favicon = document.querySelector('#app-favicon');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.id = 'app-favicon';
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }

    favicon.type = faviconHref.toLowerCase().includes('.svg') ? 'image/svg+xml' : 'image/x-icon';
    favicon.href = faviconHref;
  }, [appearance]);

  return (
    <BrowserRouter>
      <AppShell appearance={appearance} loadingAppearance={loadingAppearance} />
    </BrowserRouter>
  );
}
