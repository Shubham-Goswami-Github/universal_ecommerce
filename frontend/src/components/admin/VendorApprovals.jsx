import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function VendorApprovals({ token }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/vendor-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('fetchPendingVendors', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (id) => {
    try {
      setActionLoading(id);
      await axiosClient.patch(
        `/api/admin/vendors/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectVendor = async (id) => {
    try {
      const reason = prompt('Enter rejection reason');
      if (!reason) return;

      setActionLoading(id);
      await axiosClient.patch(
        `/api/admin/vendors/${id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingVendors();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading vendor requests...</p>;
  }

  if (vendors.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        No pending vendor requests 🎉
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vendors.map((v) => (
        <div
          key={v._id}
          className="border border-slate-200 rounded-xl p-4 flex justify-between items-start"
        >
          <div>
            <h3 className="font-semibold text-slate-900">{v.name}</h3>
            <p className="text-sm text-slate-500">{v.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Mobile: {v.mobileNumber}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Status: {v.vendorApplicationStatus}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              disabled={actionLoading === v._id}
              onClick={() => approveVendor(v._id)}
              className="px-3 py-1 text-sm rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              Approve
            </button>

            <button
              disabled={actionLoading === v._id}
              onClick={() => rejectVendor(v._id)}
              className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
