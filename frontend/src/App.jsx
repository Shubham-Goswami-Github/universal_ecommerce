// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';
import axiosClient from './api/axiosClient';

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

function AppInner() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-4">
          <div className="max-w-6xl mx-auto px-3 sm:px-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

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
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default function ThemedApp() {
  const [appearance, setAppearance] = useState(null);
  const [loadingAppearance, setLoadingAppearance] = useState(true);

  useEffect(() => {
    let mounted = true;
    axiosClient
      .get('/api/settings/public')
      .then((res) => {
        if (!mounted) return;
        setAppearance(res.data || {});
      })
      .catch((err) => {
        console.warn('Could not load appearance settings', err);
      })
      .finally(() => {
        if (mounted) setLoadingAppearance(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
      <AppInner />
    )}
  </div>
);

}
