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

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 👇 NEW: dashboard section control
  const [activeSection, setActiveSection] = useState('profile');
  // profile | products | orders

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

  useEffect(() => {
    if (token && activeSection === 'products') {
      fetchProducts();
    }
  }, [token, activeSection]);

  const handleCreateClick = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product?')) return;
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vendor Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back, {vendor?.name}
          </p>
        </div>
      </div>

      {/* TOP NAV SECTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveSection('profile')}
          className={`p-4 rounded-xl border text-left transition ${
            activeSection === 'profile'
              ? 'bg-blue-50 border-blue-500'
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          <h3 className="font-semibold text-slate-900">Vendor Profile</h3>
          <p className="text-xs text-slate-500">
            View your account details
          </p>
        </button>

        <button
          onClick={() => setActiveSection('products')}
          className={`p-4 rounded-xl border text-left transition ${
            activeSection === 'products'
              ? 'bg-blue-50 border-blue-500'
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          <h3 className="font-semibold text-slate-900">My Products</h3>
          <p className="text-xs text-slate-500">
            Manage your product listings
          </p>
        </button>

        <button
          onClick={() => setActiveSection('orders')}
          className={`p-4 rounded-xl border text-left transition ${
            activeSection === 'orders'
              ? 'bg-blue-50 border-blue-500'
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          <h3 className="font-semibold text-slate-900">Orders</h3>
          <p className="text-xs text-slate-500">
            Track customer orders
          </p>
        </button>
      </div>

      {/* ================= PROFILE ================= */}
      {activeSection === 'profile' && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Vendor Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Name</span>
              <p className="font-medium text-slate-900">
                {vendor?.name}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Email</span>
              <p className="font-medium text-slate-900">
                {vendor?.email}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Role</span>
              <p className="font-medium text-slate-900 capitalize">
                {vendor?.role}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Status</span>
              <p className="font-medium text-emerald-600">
                Active
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      {activeSection === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">
              My Products
            </h2>
            <button
              onClick={handleCreateClick}
              className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              + Add Product
            </button>
          </div>

          {showForm && (
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <ProductForm
                token={token}
                product={editingProduct}
                onSaved={(p) => {
                  alert('Product saved. Pending admin approval.');
                  handleFormSaved(p);
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              />
            </div>
          )}

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            {loading ? (
              <div className="text-slate-500">Loading...</div>
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
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Orders
          </h2>
          <VendorOrders token={token} />
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
