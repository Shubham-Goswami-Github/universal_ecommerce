import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ProductForm = ({ token, product = null, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '', // 👈 sub-category ID only
    images: [''],
    stock: 0,
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);

  /* ------------------ CATEGORY STATE ------------------ */
  const [categories, setCategories] = useState([]);
  const [superCategory, setSuperCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  const [superSearch, setSuperSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  /* ------------------ LOAD PRODUCT (EDIT) ------------------ */
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        category: product.category?._id || product.category || '',
        images: product.images?.length ? product.images : [''],
        stock: product.stock ?? 0,
        isActive: product.isActive ?? true,
      });

      if (product.category?.parent) {
        setSuperCategory(product.category.parent);
        setSubCategory(product.category._id);
      }
    }
  }, [product]);

  /* ------------------ FETCH CATEGORIES ------------------ */
  useEffect(() => {
    axiosClient
      .get('/api/categories/public')
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error('Category fetch error', err));
  }, []);

  /* ------------------ FILTERED CATEGORIES ------------------ */
  const superCategories = categories.filter(
    (c) =>
      c.type === 'super' &&
      c.name.toLowerCase().includes(superSearch.toLowerCase())
  );

  const subCategories = categories.filter(
    (c) =>
      c.type === 'sub' &&
      c.parent === superCategory &&
      c.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  /* ------------------ HANDLERS ------------------ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.price === '' || !subCategory) {
      alert('Name, price and category are required');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...form,
        category: subCategory, // ✅ ONLY sub category ID
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (product?._id) {
        const res = await axiosClient.put(
          `/api/products/${product._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onSaved(res.data.product);
      } else {
        const res = await axiosClient.post('/api/products', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onSaved(res.data.product);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {product && (
        <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
          Editing will send this product back to <b>pending</b> for admin review.
        </div>
      )}

      {/* BASIC INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Price (₹)</label>
          <input
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-xs font-medium text-slate-600">Description</label>
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* CATEGORY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SUPER CATEGORY */}
        <div>
          <label className="text-xs font-medium text-slate-600">
            Super Category
          </label>

          <input
            placeholder="Search super category..."
            value={superSearch}
            onChange={(e) => setSuperSearch(e.target.value)}
            className="w-full border rounded px-2 py-1 text-xs mb-1"
          />

          <select
            value={superCategory}
            onChange={(e) => {
              setSuperCategory(e.target.value);
              setSubCategory('');
            }}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          >
            <option value="">Select</option>
            {superCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* SUB CATEGORY */}
        <div>
          <label className="text-xs font-medium text-slate-600">
            Sub Category
          </label>

          <input
            placeholder="Search sub category..."
            value={subSearch}
            onChange={(e) => setSubSearch(e.target.value)}
            className="w-full border rounded px-2 py-1 text-xs mb-1"
          />

          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
            disabled={!superCategory}
          >
            <option value="">Select</option>
            {subCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STOCK */}
      <div>
        <label className="text-xs font-medium text-slate-600">Stock</label>
        <input
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-5 py-2 rounded text-sm"
        >
          {submitting
            ? 'Saving...'
            : product
            ? 'Update Product'
            : 'Create Product'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="border px-4 py-2 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
