import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminCategories({ token }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('super');
  const [parent, setParent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('fetchCategories error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(); // ✅ FIXED
  }, [token]); // ✅ token dependency added

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post(
        '/api/categories',
        {
          name: name.trim(),
          type,
          parent: type === 'sub' ? parent : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setName('');
      setParent('');
      setType('super');
      fetchCategories();
    } catch (err) {
      console.error('create category error', err);
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const superCategories = categories.filter(c => c.type === 'super');

  return (
    <div className="space-y-8">
      {/* CREATE FORM */}
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <h3 className="text-lg font-semibold text-slate-900">
          Create Category
        </h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="w-full border border-slate-300 rounded px-3 py-2"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2"
        >
          <option value="super">Super Category</option>
          <option value="sub">Sub Category</option>
        </select>

        {type === 'sub' && (
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2"
            required
          >
            <option value="">Select Super Category</option>
            {superCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Create Category
        </button>
      </form>

      {/* LIST */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">
          Existing Categories
        </h3>

        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : superCategories.length === 0 ? (
          <div className="text-sm text-slate-500">No categories yet</div>
        ) : (
          superCategories.map((sc) => (
            <div key={sc._id} className="mb-4">
              <div className="font-medium text-slate-800">
                {sc.name}
              </div>

              <ul className="ml-5 mt-1 text-sm text-slate-600 list-disc">
                {categories
                  .filter((c) => c.parent === sc._id)
                  .map((sub) => (
                    <li key={sub._id}>{sub.name}</li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
