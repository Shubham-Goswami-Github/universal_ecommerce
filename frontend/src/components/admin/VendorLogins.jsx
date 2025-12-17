// src/components/admin/VendorLogins.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function VendorLogins({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.vendors || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchVendors();
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      name: v.name || '',
      email: v.email || '',
      password: '',
      isActive: v.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axiosClient.patch(`/api/admin/users/${editing._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Vendor updated');
      } else {
        await axiosClient.post(
          '/api/admin/users',
          { ...form, role: 'vendor' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Vendor created');
      }
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (v) => {
    if (!confirm(`Delete vendor "${v.name}"?`)) return;
    try {
      await axiosClient.delete(`/api/admin/users/${v._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Manage vendor accounts</p>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
        >
          + Add Vendor
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500">No vendors found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((v) => (
            <div
              key={v._id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {v.name}
                </div>
                <div className="text-xs text-slate-500">{v.email}</div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    v.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {v.isActive ? 'Active' : 'Blocked'}
                </span>

                <button
                  onClick={() => openEdit(v)}
                  className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(v)}
                  className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 text-xs hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editing ? 'Edit Vendor' : 'Create Vendor'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                type="password"
                placeholder={
                  editing ? 'Change password (optional)' : 'Password'
                }
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                Active
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md border text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
                >
                  {editing ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
