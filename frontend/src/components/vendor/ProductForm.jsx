import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ProductForm = ({ token, product = null, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [''],
    stock: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        category: product.category || '',
        images: product.images && product.images.length ? product.images : [''],
        stock: product.stock ?? 0,
        isActive: product.isActive ?? true,
      });
    } else {
      setForm({
        name: '',
        description: '',
        price: '',
        category: '',
        images: [''],
        stock: 0,
        isActive: true,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (index, value) => {
    setForm((f) => {
      const imgs = [...f.images];
      imgs[index] = value;
      return { ...f, images: imgs };
    });
  };

  const addImageField = () => {
    setForm((f) => ({ ...f, images: [...f.images, ''] }));
  };

  const removeImageField = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.price === '') {
      alert('Name and price are required');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (product && product._id) {
        // update
        const res = await axiosClient.put(`/api/products/${product._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onSaved(res.data.product);
      } else {
        // create
        const res = await axiosClient.post('/api/products', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onSaved(res.data.product);
      }
    } catch (err) {
      console.error('Save product error:', err);
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {product && (
        <div className="text-xs text-yellow-300 mb-1">
          Note: Editing will send the product back to <strong>pending</strong> for admin review.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-300">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-300">Price (₹)</label>
          <input
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-300">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs text-slate-300">Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100"
            placeholder="e.g. Clothing, Electronics"
          />
        </div>

        <div>
          <label className="text-xs text-slate-300">Stock</label>
          <input
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-300">Visible (isActive)</label>
          <div className="mt-1">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="rounded" />
              <span className="text-slate-300">Product visible to users when approved</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-300">Images (URLs)</label>
        <div className="space-y-2 mt-2">
          {form.images.map((img, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                value={img}
                onChange={(e) => handleImageChange(idx, e.target.value)}
                className="flex-1 rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                placeholder="https://example.com/image.jpg"
              />
              {form.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(idx)}
                  className="px-3 py-2 rounded-md bg-red-500/10 text-red-400 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={addImageField}
              className="mt-1 px-3 py-2 rounded-md bg-slate-800 text-slate-200 text-sm"
            >
              + Add Image URL
            </button>

            {/* Small preview of first image */}
            {form.images[0] && (
              <div className="ml-3 h-12 w-20 bg-slate-800 rounded overflow-hidden flex items-center justify-center">
                <img src={form.images[0]} alt="preview" className="object-cover h-full w-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-teal-400 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-teal-300 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
