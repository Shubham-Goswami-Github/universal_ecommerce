// src/pages/VendorDashboard.jsx
import { useEffect, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/vendor/ProductForm';
import VendorProductsList from '../components/vendor/VendorProductsList';
import VendorOrders from '../components/vendor/VendorOrders';

const VendorDashboard = () => {
  const { auth } = useAuth();
  const token = auth.token;
  const [vendor, setVendor] = useState(null);

  /* ================= STATES ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formSectionRef = useRef(null);

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* 🔥 SALES STATS */
  const [salesStats, setSalesStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/products/vendor/my-products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SALES STATS ================= */
  const fetchSalesStats = async () => {
    try {
      setStatsLoading(true);
      const res = await axiosClient.get('/api/vendor/sales-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesStats(res.data);
    } catch (err) {
      console.error(err);
      setSalesStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  /* ================= FETCH VENDOR ================= */
  const fetchVendor = async () => {
    try {
      const res = await axiosClient.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendor(res.data.user);
    } catch (err) {
      console.error(err);
      setVendor(auth.user);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!token) return;
    fetchVendor();
    fetchSalesStats();
    fetchProducts();
  }, [token]);

  useEffect(() => {
    if (!showForm) return;
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [showForm, editingProduct?._id]);

  /* ================= HANDLERS ================= */
  const handleCreateClick = () => {
    setEditingProduct(null);
    setShowForm(true);
    setActiveSection('add-product');
    setSidebarOpen(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setActiveSection('edit-product');
    setSidebarOpen(false);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axiosClient.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((p) => p.filter((x) => x._id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleFormSaved = (savedProduct) => {
    const exists = products.some((p) => p._id === savedProduct._id);
    if (exists) {
      setProducts((p) =>
        p.map((x) => (x._id === savedProduct._id ? savedProduct : x))
      );
    } else {
      setProducts((p) => [savedProduct, ...p]);
    }
    setShowForm(false);
    setEditingProduct(null);
    setActiveSection('products');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setActiveSection('products');
  };

  /* ================= HELPERS ================= */
  const getInitials = (name) => {
    if (!name) return 'V';
    const p = name.trim().split(' ');
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[1][0]).toUpperCase();
  };

  const formatDate = (v) => {
    if (!v) return 'Not set';
    try {
      return new Date(v).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Not set';
    }
  };

  const genderLabel = vendor?.gender
    ? vendor.gender.charAt(0).toUpperCase() + vendor.gender.slice(1)
    : 'Not set';

  const accountStatusLabel = vendor?.accountStatus || 'active';

  /* ================= SIDEBAR MENU ITEMS ================= */
  const menuItems = [
    { key: 'overview', label: 'Overview', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )},
    { key: 'products', label: 'My Products', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ), badge: products?.length || 0 },
    { key: 'add-product', label: 'Add Product', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    )},
    { key: 'orders', label: 'Orders', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )},
    { key: 'profile', label: 'Profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  const handleMenuClick = (key) => {
    if (key === 'add-product') {
      handleCreateClick();
    } else {
      setActiveSection(key);
      setShowForm(false);
      setEditingProduct(null);
    }
    setSidebarOpen(false);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Vendor Panel</h1>
              <p className="text-xs text-slate-500">Manage your store</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Vendor Info */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
              {vendor?.profilePicture ? (
                <img src={vendor.profilePicture} className="w-full h-full object-cover" alt="" />
              ) : (
                getInitials(vendor?.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{vendor?.name || 'Vendor'}</h3>
              <p className="text-xs text-slate-500 truncate">{vendor?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${accountStatusLabel === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs text-slate-500 capitalize">{accountStatusLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Menu</p>
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeSection === item.key || (item.key === 'edit-product' && activeSection === 'edit-product')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={activeSection === item.key ? 'text-blue-600' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  activeSection === item.key ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Quick Stats</p>
                <p className="text-xs text-slate-500">Today's summary</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-blue-600">{salesStats?.totalOrders || 0}</p>
                <p className="text-xs text-slate-500">Orders</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-green-600">₹{((salesStats?.totalRevenue || 0) / 1000).toFixed(1)}k</p>
                <p className="text-xs text-slate-500">Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  {activeSection === 'overview' && 'Dashboard Overview'}
                  {activeSection === 'products' && 'My Products'}
                  {activeSection === 'add-product' && 'Add New Product'}
                  {activeSection === 'edit-product' && 'Edit Product'}
                  {activeSection === 'orders' && 'Order Management'}
                  {activeSection === 'profile' && 'My Profile'}
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  {activeSection === 'overview' && 'Welcome back! Here\'s your store summary'}
                  {activeSection === 'products' && `Manage your ${products.length} products`}
                  {activeSection === 'add-product' && 'Fill in the details to list a new product'}
                  {activeSection === 'edit-product' && `Editing: ${editingProduct?.name || 'Product'}`}
                  {activeSection === 'orders' && 'Track and manage customer orders'}
                  {activeSection === 'profile' && 'View and update your information'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button 
                onClick={() => {
                  fetchProducts();
                  fetchSalesStats();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Add Product Button */}
              <button
                onClick={handleCreateClick}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {/* ================= OVERVIEW SECTION ================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {statsLoading ? '...' : `₹${(salesStats?.totalRevenue || 0).toLocaleString()}`}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Total Earnings</p>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Orders</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {statsLoading ? '...' : salesStats?.totalOrders || 0}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Total Orders</p>
                </div>

                {/* Products Sold */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Sold</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {statsLoading ? '...' : salesStats?.totalProductsSold || 0}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Items Sold</p>
                </div>

                {/* Listed Products */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Listed</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{products?.length || 0}</p>
                  <p className="text-sm text-slate-500 mt-1">My Products</p>
                </div>
              </div>

              {/* Product Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Status Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Product Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Approved</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {products?.filter(p => p.status === 'approved').length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium text-amber-700">Pending</span>
                      </div>
                      <span className="text-lg font-bold text-amber-600">
                        {products?.filter(p => p.status === 'pending').length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-red-700">Rejected</span>
                      </div>
                      <span className="text-lg font-bold text-red-600">
                        {products?.filter(p => p.status === 'rejected').length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleCreateClick}
                      className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-blue-700">Add Product</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('products')}
                      className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                    >
                      <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-purple-700">View Products</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('orders')}
                      className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors group"
                    >
                      <div className="w-10 h-10 bg-amber-100 group-hover:bg-amber-200 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-amber-700">View Orders</span>
                    </button>
                    <button
                      onClick={() => setActiveSection('profile')}
                      className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                    >
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-700">My Profile</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Store Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{vendor?.businessName || 'Your Store'}</p>
                        <p className="text-xs text-slate-500">Business Name</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 capitalize">{accountStatusLabel}</p>
                        <p className="text-xs text-slate-500">Account Status</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{formatDate(vendor?.createdAt)}</p>
                        <p className="text-xs text-slate-500">Member Since</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800">Recent Products</h3>
                  <button 
                    onClick={() => setActiveSection('products')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 mt-4">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">No Products Yet</h4>
                    <p className="text-sm text-slate-500 mb-4">Start by adding your first product</p>
                    <button
                      onClick={handleCreateClick}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Add Product
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {products.slice(0, 5).map((product) => (
                      <div key={product._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-800 truncate">{product.name}</h4>
                          <p className="text-sm text-slate-500">₹{product.sellingPrice?.toLocaleString()}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          product.status === 'approved' ? 'bg-green-100 text-green-700' :
                          product.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.status}
                        </span>
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= PRODUCTS SECTION ================= */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              {/* Products Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">All Products</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Manage and organize your product listings
                    </p>
                  </div>
                  <button
                    onClick={handleCreateClick}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </button>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100">
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                    All ({products?.length || 0})
                  </span>
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    Approved ({products?.filter(p => p.status === 'approved').length || 0})
                  </span>
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                    Pending ({products?.filter(p => p.status === 'pending').length || 0})
                  </span>
                  <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                    Rejected ({products?.filter(p => p.status === 'rejected').length || 0})
                  </span>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-500 mt-4">Loading your products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">No Products Yet</h3>
                    <p className="text-sm text-slate-500 mb-4">Start selling by adding your first product</p>
                    <button
                      onClick={handleCreateClick}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="p-5">
                    <VendorProductsList
                      products={products}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= ADD PRODUCT SECTION ================= */}
          {activeSection === 'add-product' && (
            <div className="space-y-6" ref={formSectionRef}>
              {/* Form Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
                      <p className="text-sm text-slate-500">Fill in the details to list a new product</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelForm}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Product Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <ProductForm
                  key="new-product"
                  token={token}
                  vendor={vendor}
                  product={null}
                  onSaved={handleFormSaved}
                  onCancel={handleCancelForm}
                />
              </div>
            </div>
          )}

          {/* ================= EDIT PRODUCT SECTION ================= */}
          {activeSection === 'edit-product' && editingProduct && (
            <div className="space-y-6" ref={formSectionRef}>
              {/* Form Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Edit Product</h2>
                      <p className="text-sm text-slate-500">Editing: {editingProduct.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelForm}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium">Back to Products</span>
                  </button>
                </div>

                {/* Product Preview */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden">
                      {editingProduct.images?.[0] ? (
                        <img src={editingProduct.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{editingProduct.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-slate-600">₹{editingProduct.sellingPrice?.toLocaleString()}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          editingProduct.status === 'approved' ? 'bg-green-100 text-green-700' :
                          editingProduct.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {editingProduct.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <ProductForm
                  key={editingProduct._id}
                  token={token}
                  vendor={vendor}
                  product={editingProduct}
                  onSaved={handleFormSaved}
                  onCancel={handleCancelForm}
                />
              </div>
            </div>
          )}

          {/* ================= ORDERS SECTION ================= */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              {/* Orders Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Order Management</h2>
                    <p className="text-sm text-slate-500">Track and manage your customer orders</p>
                  </div>
                </div>
              </div>

              {/* Orders Component */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <VendorOrders token={token} />
              </div>
            </div>
          )}

          {/* ================= PROFILE SECTION ================= */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="profile-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                        <circle cx="10" cy="10" r="1.5" fill="white"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#profile-pattern)"/>
                  </svg>
                </div>
                <div className="relative flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold overflow-hidden border-2 border-white/30">
                    {vendor?.profilePicture ? (
                      <img src={vendor.profilePicture} className="w-full h-full object-cover" alt="" />
                    ) : (
                      getInitials(vendor?.name)
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{vendor?.name || 'Vendor'}</h2>
                    <p className="text-blue-100">{vendor?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        {vendor?.role || 'vendor'}
                      </span>
                      {vendor?.businessName && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                          🏪 {vendor.businessName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        📱
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Mobile Number</p>
                        <p className="font-medium text-slate-800">{vendor?.mobileNumber || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        📲
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Alternate Mobile</p>
                        <p className="font-medium text-slate-800">{vendor?.alternateMobileNumber || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                        ✉️
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email Address</p>
                        <p className="font-medium text-slate-800 break-all">{vendor?.email || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500">Gender</p>
                      <p className="font-medium text-slate-800">{genderLabel}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500">Date of Birth</p>
                      <p className="font-medium text-slate-800">{vendor?.dateOfBirth ? formatDate(vendor.dateOfBirth) : 'Not set'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500">Account Status</p>
                      <p className={`font-medium ${accountStatusLabel === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {accountStatusLabel === 'active' ? '✅ Active' : '❌ ' + accountStatusLabel}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500">Member Since</p>
                      <p className="font-medium text-slate-800">{vendor?.createdAt ? formatDate(vendor.createdAt) : 'Not set'}</p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                {(vendor?.businessName || vendor?.businessType) && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </span>
                      Business Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <p className="text-xs text-amber-600">Business Name</p>
                        <p className="font-semibold text-amber-900">{vendor?.businessName || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <p className="text-xs text-amber-600">Business Type</p>
                        <p className="font-semibold text-amber-900 capitalize">{vendor?.businessType || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address */}
                {vendor?.addresses && vendor.addresses.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      Business Address
                    </h3>
                    {(() => {
                      const addr = vendor.addresses.find(a => a.isDefault) || vendor.addresses[0];
                      return (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="font-semibold text-slate-800">{addr.fullName}</p>
                          <p className="text-slate-600 mt-1">{addr.houseNo}, {addr.streetArea}</p>
                          <p className="text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-slate-500 text-sm mt-2">📱 {addr.mobileNumber}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
