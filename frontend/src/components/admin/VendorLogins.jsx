// src/components/admin/VendorLogins.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function VendorLogins({ token }) {
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
  const [viewVendor, setViewVendor] = useState(null);
  const [viewIsActive, setViewIsActive] = useState(true);
  const [viewAccountStatus, setViewAccountStatus] = useState('active');
  const [viewSaving, setViewSaving] = useState(false);
  const [vendorStats, setVendorStats] = useState({});

  // NEW: vendor application status
  const [vendorApplicationStatus, setVendorApplicationStatus] = useState('pending');

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

  const openView = (v) => {
    setViewVendor(v);
    setViewIsActive(v.isActive ?? true);
    setViewAccountStatus(v.accountStatus || 'active');
    setVendorApplicationStatus(v.vendorApplicationStatus || 'pending');
    fetchVendorStats(v._id);
    setShowViewModal(true);
  };

  const getInitials = (name) => {
    if (!name) return 'V';
    const p = name.trim().split(' ');
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[1][0]).toUpperCase();
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
    if (!viewVendor) return;

    let vendorActive = false;
    if (vendorApplicationStatus === 'approved') {
      vendorActive = true;
    }

    try {
      setViewSaving(true);
      await axiosClient.patch(
        `/api/admin/users/${viewVendor._id}`,
        {
          isActive: viewIsActive,
          accountStatus: viewAccountStatus,
          vendorApplicationStatus,
          vendorActive,
          role: vendorApplicationStatus === 'approved' ? 'vendor' : 'user',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Vendor status updated');
      setShowViewModal(false);
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setViewSaving(false);
    }
  };

  const fetchVendorStats = async (vendorId) => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        axiosClient.get(`/api/admin/vendors/${vendorId}/sales-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosClient.get(`/api/admin/vendors/${vendorId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const stats = statsRes.data;
      const products = productsRes.data.products || [];

      setVendorStats({
        ...stats,
        totalProductsListed: products.length,
      });
    } catch (err) {
      console.error(err);
      setVendorStats({
        totalOrders: 0,
        totalProductsSold: 0,
        totalRevenue: 0,
        lastOrderDate: null,
        totalProductsListed: 0,
      });
    }
  };

  const statusBadge = (v) => {
    if (v.vendorApplicationStatus === 'pending') {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (v.vendorApplicationStatus === 'approved') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (v.vendorApplicationStatus === 'rejected') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-slate-100 text-slate-600';
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
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                  {v.profilePicture ? (
                    <img
                      src={v.profilePicture}
                      alt={v.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(v.name)}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{v.name}</div>
                  <div className="text-xs text-slate-500">{v.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    v.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {v.isActive ? 'Active' : 'Blocked'}
                </span>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(v)}`}
                >
                  {v.vendorApplicationStatus || 'pending'}
                </span>

                <button
                  onClick={() => openView(v)}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"
                >
                  View
                </button>

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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editing ? 'Edit Vendor' : 'Create Vendor'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                type="password"
                placeholder={editing ? 'Change password (optional)' : 'Password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
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
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">
                  {editing ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && viewVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Vendor Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 text-sm hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Avatar + Basic */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                {viewVendor.profilePicture ? (
                  <img
                    src={viewVendor.profilePicture}
                    alt={viewVendor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(viewVendor.name)}</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{viewVendor.name}</div>
                <div className="text-xs text-slate-500">{viewVendor.email}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Role: <span className="font-medium">{viewVendor.role}</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-900 break-all">
                    {viewVendor.email || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Mobile</p>
                  <p className="font-medium text-slate-900">
                    {viewVendor.mobileNumber || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Alternate Mobile</p>
                  <p className="font-medium text-slate-900">
                    {viewVendor.alternateMobileNumber || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Personal Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Gender</p>
                  <p className="font-medium text-slate-900 capitalize">
                    {viewVendor.gender || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Date of Birth</p>
                  <p className="font-medium text-slate-900">
                    {viewVendor.dateOfBirth
                      ? new Date(viewVendor.dateOfBirth).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Analytics */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Vendor Analytics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                <div className="bg-slate-50 border rounded-lg p-2 text-center">
                  <p className="text-slate-500 text-[11px]">Total Orders</p>
                  <p className="text-sm font-semibold text-slate-900">{vendorStats.totalOrders ?? 0}</p>
                </div>
                <div className="bg-slate-50 border rounded-lg p-2 text-center">
                  <p className="text-slate-500 text-[11px]">Total Sales</p>
                  <p className="text-sm font-semibold text-emerald-600">₹{vendorStats.totalRevenue ?? 0}</p>
                </div>
                <div className="bg-slate-50 border rounded-lg p-2 text-center">
                  <p className="text-slate-500 text-[11px]">Products Sold</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {vendorStats.totalProductsSold ?? 0}
                  </p>
                </div>
                <div className="bg-slate-50 border rounded-lg p-2 text-center">
                  <p className="text-slate-500 text-[11px]">Last Vendor Order</p>
                  <p className="text-[11px] font-medium text-slate-900">
                    {vendorStats.lastOrderDate
                      ? new Date(vendorStats.lastOrderDate).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                <div className="bg-slate-50 border rounded-lg p-2 text-center">
                  <p className="text-slate-500 text-[11px]">Total Products Listed</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {vendorStats.totalProductsListed ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Status controls */}
            <div className="pt-2 border-t mt-3 space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Admin Controls</h4>

              {/* NEW: Vendor Application Status */}
              <div className="flex flex-col gap-2 text-xs">
                <label className="block">
                  <span className="mr-2">Vendor Application Status</span>
                  <select
                    value={vendorApplicationStatus}
                    onChange={(e) => setVendorApplicationStatus(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                </label>
              </div>

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
              Created: {formatDate(viewVendor.createdAt)} • Updated: {formatDate(viewVendor.updatedAt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}