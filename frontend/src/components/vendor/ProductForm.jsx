import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const ProductForm = ({ token, product = null, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    isActive: true,
  });

  const [images, setImages] = useState([]); // 🔥 FILES
  const [existingImages, setExistingImages] = useState([]); // edit mode

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
        stock: product.stock ?? 0,
        isActive: product.isActive ?? true,
      });

      setExistingImages(product.images || []);

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

      const formData = new FormData();

      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', Number(form.price));
      formData.append('stock', Number(form.stock));
      formData.append('category', subCategory);

      // 🔥 NEW IMAGES
      if (images.length) {
        Array.from(images).forEach((file) => {
          formData.append('images', file);
        });
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const res = product?._id
        ? await axiosClient.put(
            `/api/products/${product._id}`,
            formData,
            config
          )
        : await axiosClient.post('/api/products', formData, config);

      onSaved(res.data.product);
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

      {/* CATEGORY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* IMAGE UPLOAD */}
      <div>
        <label className="text-xs font-medium text-slate-600">
          Product Images
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(e.target.files)}
          className="w-full text-sm"
        />

        {/* EXISTING IMAGES (EDIT MODE) */}
        {existingImages.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {existingImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="product"
                className="w-16 h-16 object-cover rounded border"
              />
            ))}
          </div>
        )}
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
