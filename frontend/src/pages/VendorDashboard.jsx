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
    // If updated or created, update list
    const exists = products.some((p) => p._id === savedProduct._id);
    if (exists) {
      setProducts((p) => p.map((x) => (x._id === savedProduct._id ? savedProduct : x)));
    } else {
      setProducts((p) => [savedProduct, ...p]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">Vendor Dashboard</h1>
        <button onClick={handleCreateClick} className="rounded-md bg-teal-400 text-slate-900 px-3 py-2">+ Add Product</button>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <ProductForm
            token={token}
            product={editingProduct}
            onSaved={(p) => {
              // when vendor creates/updates, product.status will be 'pending'
              alert('Product saved. It is now pending admin approval.');
              handleFormSaved(p);
            }}
            onCancel={() => { setShowForm(false); setEditingProduct(null); }}
          />
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <h2 className="text-lg text-slate-100 mb-3">My Products</h2>
        {loading ? (
          <div className="text-slate-400">Loading...</div>
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
