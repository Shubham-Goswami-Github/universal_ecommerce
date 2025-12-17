import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/vendor/ProductForm';
import VendorProductsList from '../components/vendor/VendorProductsList';

const VendorDashboard = () => {
  const { auth } = useAuth();
  const token = auth.token;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
    if (token) fetchProducts();
  }, [token]);

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
      console.error(err);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vendor Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Manage your products and listings
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-500"
        >
          + Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <ProductForm
            token={token}
            product={editingProduct}
            onSaved={(p) => {
              alert('Product saved. It is now pending admin approval.');
              handleFormSaved(p);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      {/* Product List */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          My Products
        </h2>

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
  );
};

export default VendorDashboard;
