// src/pages/VendorDashboard.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/vendor/ProductForm';
import VendorProductsList from '../components/vendor/VendorProductsList';
import VendorOrders from '../components/vendor/VendorOrders';

const VendorDashboard = () => {
  const { auth } = useAuth();
  const token = auth.token;
  const vendor = auth.user;

  /* ================= STATES ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [activeSection, setActiveSection] = useState('profile');
  // 'profile' | 'products' | 'orders'

  /* 🔥 SALES STATS (FROM /api/vendor/sales-stats) */
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

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!token) return;

    if (activeSection === 'products') {
      fetchProducts();
    }

    if (activeSection === 'profile') {
      fetchSalesStats();
    }
  }, [token, activeSection]);

  /* ================= HANDLERS ================= */
  const handleCreateClick = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setActiveSection('products');
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
  };

  /* ================= HELPERS ================= */
  const getInitials = (name) => {
    if (!name) return 'V';
    const p = name.trim().split(' ');
    return p.length === 1
      ? p[0][0].toUpperCase()
      : (p[0][0] + p[1][0]).toUpperCase();
  };

  const formatDate = (v) => {
    if (!v) return 'Not set';
    try {
      return new Date(v).toLocaleDateString();
    } catch {
      return 'Not set';
    }
  };

  const genderLabel = vendor?.gender
    ? vendor.gender.charAt(0).toUpperCase() + vendor.gender.slice(1)
    : 'Not set';

  const accountStatusLabel = vendor?.accountStatus || 'active';
  const isActiveLabel = vendor?.isActive ? 'Active' : 'Inactive';

  const statusColor =
    accountStatusLabel === 'active'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
      : accountStatusLabel === 'blocked'
      ? 'text-red-600 bg-red-50 border-red-100'
      : 'text-slate-600 bg-slate-50 border-slate-200';

  const activeTabClass = (key) =>
    `p-4 rounded-xl border transition text-left ${
      activeSection === key
        ? 'bg-blue-50 border-blue-500'
        : 'bg-white hover:bg-slate-50 border-slate-200'
    }`;

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
            {vendor?.profilePicture ? (
              <img
                src={vendor.profilePicture}
                className="w-full h-full object-cover rounded-full"
                alt={vendor.name || 'Vendor'}
              />
            ) : (
              getInitials(vendor?.name)
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              Vendor Dashboard
            </h1>
            <p className="text-xs text-slate-300">
              Welcome,{' '}
              <span className="font-medium">{vendor?.name}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-100 border border-blue-400/40">
            {vendor?.role}
          </span>
          <span className={`px-3 py-1 rounded-full border ${statusColor}`}>
            {accountStatusLabel}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-700 text-white">
            {isActiveLabel}
          </span>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveSection('profile')}
          className={activeTabClass('profile')}
        >
          Vendor Profile
        </button>
        <button
          onClick={() => setActiveSection('products')}
          className={activeTabClass('products')}
        >
          My Products
        </button>
        <button
          onClick={() => setActiveSection('orders')}
          className={activeTabClass('orders')}
        >
          Orders
        </button>
      </div>

      {/* ================= PROFILE ================= */}
      {activeSection === 'profile' && (
        <div className="bg-white border rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold">Vendor Details</h2>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border">
              <p className="text-slate-500">Name</p>
              <p className="font-semibold">{vendor?.name}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border">
              <p className="text-slate-500">Email</p>
              <p className="font-semibold break-all">{vendor?.email}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border">
              <p className="text-slate-500">Mobile</p>
              <p className="font-semibold">{vendor?.mobileNumber}</p>
            </div>
          </div>

          {/* ACCOUNT + PERSONAL INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm mt-4">
            {/* Account Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase">
                Account Info
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Role</p>
                  <p className="font-medium text-slate-900 capitalize">
                    {vendor?.role || 'vendor'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Account Status</p>
                  <p className="font-medium text-slate-900 capitalize">
                    {accountStatusLabel}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Active</p>
                  <p className="font-medium text-slate-900">
                    {vendor?.isActive ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Alternate Mobile</p>
                  <p className="font-medium text-slate-900">
                    {vendor?.alternateMobileNumber || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase">
                Personal Info
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Gender</p>
                  <p className="font-medium text-slate-900">
                    {genderLabel}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Date of Birth</p>
                  <p className="font-medium text-slate-900">
                    {vendor?.dateOfBirth
                      ? formatDate(vendor.dateOfBirth)
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SALES STATS (TOTAL ORDERS / PRODUCTS SOLD / TOTAL REVENUE) */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold uppercase text-slate-600 mb-3">
              Sales Performance
            </h3>

            {statsLoading ? (
              <div className="text-xs text-slate-500">Loading stats…</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Total Orders */}
                <div className="bg-slate-50 p-3 rounded-xl border text-center">
                  <p className="text-slate-500 text-[11px] uppercase">
                    Total Orders
                  </p>
                  <p className="text-lg font-bold">
                    {salesStats?.totalOrders ?? 0}
                  </p>
                </div>

                {/* Products Sold */}
                <div className="bg-slate-50 p-3 rounded-xl border text-center">
                  <p className="text-slate-500 text-[11px] uppercase">
                    Products Sold
                  </p>
                  <p className="text-lg font-bold">
                    {salesStats?.totalProductsSold ?? 0}
                  </p>
                </div>

                {/* Total Revenue */}
                <div className="bg-slate-50 p-3 rounded-xl border text-center">
                  <p className="text-slate-500 text-[11px] uppercase">
                    Total Revenue
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    ₹{salesStats?.totalRevenue ?? 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      {activeSection === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">My Products</h2>
            <button
              onClick={handleCreateClick}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-500"
            >
              + Add Product
            </button>
          </div>

          {showForm && (
            <div className="bg-white border rounded-2xl p-5">
              <ProductForm
                token={token}
                product={editingProduct}
                onSaved={handleFormSaved}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              />
            </div>
          )}

          <div className="bg-white border rounded-2xl p-5">
            {loading ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : (
              <VendorProductsList
                products={products}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      )}

      {/* ================= ORDERS ================= */}
      {activeSection === 'orders' && (
        <div className="bg-white border rounded-2xl p-5">
          <VendorOrders token={token} />
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;