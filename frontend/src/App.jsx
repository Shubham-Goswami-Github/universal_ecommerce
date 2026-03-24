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
      <Navbar />
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

export default function ThemedApp() {
  const [appearance, setAppearance] = useState(null);
  const [loadingAppearance, setLoadingAppearance] = useState(true);

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
  const maintenanceMode = Boolean(appearance?.isMaintenanceMode);

  // build inline style
  const style = appearance
    ? {
        backgroundColor: appearance.backgroundColor || undefined,
        backgroundImage: appearance.backgroundImage
          ? `url(${appearance.backgroundImage})`
          : undefined,
        backgroundRepeat: appearance.backgroundRepeat || undefined,
        backgroundSize: appearance.backgroundSize || undefined,
        color: appearance.fontColor || undefined,
        fontFamily: appearance.fontFamily || undefined,
      }
    : {};

  // minimal fallback classes so Tailwind styles still apply for unknown props
 return (
  <div
    style={style}
    className="min-h-screen bg-white text-slate-900"
  >
    {loadingAppearance ? (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    ) : (
      <BrowserRouter>
        <AppInner maintenanceMode={maintenanceMode} />
      </BrowserRouter>
    )}
  </div>
);

}


console.log("API URL:", import.meta.env.VITE_API_URL);
