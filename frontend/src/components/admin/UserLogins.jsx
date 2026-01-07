// src/components/admin/UserLogins.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function UserLogins({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
  });

  // View details modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewIsActive, setViewIsActive] = useState(true);
  const [viewAccountStatus, setViewAccountStatus] = useState('active');
  const [viewSaving, setViewSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data.users || [];
      setItems(all.filter((u) => u.role === 'user'));
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      isActive: u.isActive ?? true,
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
        alert('User updated');
      } else {
        await axiosClient.post(
          '/api/admin/users',
          { ...form, role: 'user' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('User created');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try {
      await axiosClient.delete(`/api/admin/users/${u._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // ----- VIEW MODAL HELPERS -----
  const openView = (u) => {
    setViewUser(u);
    setViewIsActive(u.isActive ?? true);
    setViewAccountStatus(u.accountStatus || 'active');
    setShowViewModal(true);
  };

  const formatDate = (v) => {
    if (!v) return 'Not set';
    try {
      return new Date(v).toLocaleString();
    } catch {
      return 'Not set';
    }
  };

  const handleViewSave = async () => {
    if (!viewUser) return;
    try {
      setViewSaving(true);
      await axiosClient.patch(
        `/api/admin/users/${viewUser._id}`,
        {
          isActive: viewIsActive,
          accountStatus: viewAccountStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User status updated');
      setShowViewModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setViewSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const p = name.trim().split(' ');
    return p.length === 1
      ? p[0][0].toUpperCase()
      : (p[0][0] + p[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Manage application users</p>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500">No users found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((u) => (
            <div
              key={u._id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                  {u.profilePicture ? (
                    <img
                      src={u.profilePicture}
                      alt={u.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(u.name)}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {u.name}
                  </div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    u.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {u.isActive ? 'Active' : 'Blocked'}
                </span>

                <button
                  onClick={() => openView(u)}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"
                >
                  View
                </button>

                <button
                  onClick={() => openEdit(u)}
                  className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(u)}
                  className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 text-xs hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editing ? 'Edit User' : 'Create User'}
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

      {/* VIEW DETAILS MODAL */}
      {showViewModal && viewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                User Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 text-sm hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Header with avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                {viewUser.profilePicture ? (
                  <img
                    src={viewUser.profilePicture}
                    alt={viewUser.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(viewUser.name)}</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {viewUser.name}
                </div>
                <div className="text-xs text-slate-500">
                  {viewUser.email}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Role: <span className="font-medium">{viewUser.role}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-900 break-all">
                    {viewUser.email || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Mobile</p>
                  <p className="font-medium text-slate-900">
                    {viewUser.mobileNumber || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Alternate Mobile</p>
                  <p className="font-medium text-slate-900">
                    {viewUser.alternateMobileNumber || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Personal Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Gender</p>
                  <p className="font-medium text-slate-900 capitalize">
                    {viewUser.gender || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Date of Birth</p>
                  <p className="font-medium text-slate-900">
                    {viewUser.dateOfBirth
                      ? new Date(viewUser.dateOfBirth).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Analytics
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 border rounded-lg p-2 text-center">
                  <p className="text-slate-500 text-[11px]">Total Orders</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {viewUser.totalOrders ?? 0}
                  </p>
                </div>
                <div className="bg-slate-50 border rounded-lg p-2 text-center">
                  <p className="text-slate-500 text-[11px]">Total Spent</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    ₹{viewUser.totalSpent ?? 0}
                  </p>
                </div>
                <div className="bg-slate-50 border rounded-lg p-2 text-center">
                  <p className="text-slate-500 text-[11px]">Last Order</p>
                  <p className="text-[11px] font-medium text-slate-900">
                    {viewUser.lastOrderDate
                      ? new Date(viewUser.lastOrderDate).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Addresses
              </h4>
              {viewUser.addresses && viewUser.addresses.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {viewUser.addresses.map((a, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-2 bg-slate-50"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900">
                          {a.fullName}
                        </span>
                        {a.isDefault && (
                          <span className="text-[10px] px-2 py-[1px] rounded-full bg-emerald-100 text-emerald-700">
                            Default
                          </span>
                        )}
                      </div>
                      <p>
                        {a.houseNo}, {a.streetArea}
                      </p>
                      <p>
                        {a.city}, {a.state} - {a.pincode}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Mobile: {a.mobileNumber}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No addresses saved.
                </p>
              )}
            </div>

            {/* Status Controls */}
            <div className="pt-2 border-t mt-3 space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Admin Controls
              </h4>
              <div className="flex flex-col sm:flex-row gap-3 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={viewIsActive}
                    onChange={(e) => setViewIsActive(e.target.checked)}
                  />
                  <span>Active</span>
                </label>

                <label className="flex items-center gap-2">
                  <span>Account Status:</span>
                  <select
                    value={viewAccountStatus}
                    onChange={(e) => setViewAccountStatus(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="active">active</option>
                    <option value="blocked">blocked</option>
                    <option value="deleted">deleted</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 rounded-md border text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={viewSaving}
                  onClick={handleViewSave}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-xs disabled:opacity-60"
                >
                  {viewSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-slate-400">
              Created: {formatDate(viewUser.createdAt)} • Updated:{' '}
              {formatDate(viewUser.updatedAt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}