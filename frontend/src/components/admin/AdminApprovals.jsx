import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const VendorBlock = ({ vendor, products, onApprove, onReject }) => {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-slate-900 font-semibold">
            {vendor?.name || 'Unknown Vendor'}
          </div>
          <div className="text-xs text-slate-500">{vendor?.email || ''}</div>
        </div>
        <div className="text-xs text-slate-500">
          {products.length} pending
        </div>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-slate-50 p-4 rounded-xl flex flex-col sm:flex-row items-start gap-4"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
              {p.images && p.images[0] ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  No image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {p.category}
                  </div>
                  <div className="text-sm font-bold text-blue-600 mt-1">
                    ₹{p.price}
                  </div>
                </div>
                <div className="ml-auto text-xs text-slate-400 whitespace-nowrap">
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>

              {p.description && (
                <div className="text-xs text-slate-500 mt-2 line-clamp-3">
                  {p.description}
                </div>
              )}

              {p.rejectionReason && p.status === 'rejected' && (
                <div className="mt-2 text-xs text-red-600">
                  Rejection: {p.rejectionReason}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => onApprove(p)}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-500"
                >
                  Approve
                </button>

                <button
                  onClick={() => onReject(p)}
                  className="px-4 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-500"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminApprovals() {
  const { auth } = useAuth();
  const token = auth.token;

  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const fetchGrouped = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/pending-products-grouped', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrouped(res.data.grouped || []);
    } catch (err) {
      console.error('fetchGrouped error', err);
      setGrouped([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchGrouped();
  }, [token]);

  const handleApprove = async (product) => {
    if (!confirm(`Approve product "${product.name}"?`)) return;
    try {
      await axiosClient.post(
        `/api/admin/products/${product._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGrouped();
      alert('Product approved');
    } catch (err) {
      console.error('approve error', err);
      alert(err.response?.data?.message || 'Approve failed');
    }
  };

  const startReject = (product) => {
    setRejecting(product);
    setReason('');
  };

  const submitReject = async () => {
    if (!rejecting) return;
    if (!reason.trim()) {
      alert('Please enter a reason');
      return;
    }
    try {
      await axiosClient.post(
        `/api/admin/products/${rejecting._id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejecting(null);
      setReason('');
      fetchGrouped();
      alert('Product rejected');
    } catch (err) {
      console.error('reject error', err);
      alert(err.response?.data?.message || 'Reject failed');
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-slate-900">
        Approvals
      </h2>

      {loading ? (
        <div className="text-slate-500">Loading pending approvals...</div>
      ) : grouped.length === 0 ? (
        <div className="text-slate-500">No pending products.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {grouped.map((g) => (
            <VendorBlock
              key={g.vendor?._id || 'unknown-' + Math.random()}
              vendor={g.vendor}
              products={g.products}
              onApprove={handleApprove}
              onReject={startReject}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl w-full max-w-md shadow-lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Reject: {rejecting.name}
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection"
              className="w-full rounded-md border border-slate-300 p-2 text-sm mb-3"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejecting(null);
                  setReason('');
                }}
                className="px-4 py-2 rounded-md border border-slate-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm"
              >
                Submit Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
