// src/components/admin/AdminApprovals.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const VendorBlock = ({ vendor, products, onApprove, onReject }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-slate-300 font-semibold">{vendor?.name || 'Unknown Vendor'}</div>
          <div className="text-xs text-slate-500">{vendor?.email || ''}</div>
        </div>
        <div className="text-xs text-slate-400">{products.length} pending</div>
      </div>

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p._id} className="bg-slate-950/20 p-3 rounded flex flex-col sm:flex-row items-start gap-3">
            <div className="w-20 h-20 bg-slate-800 rounded overflow-hidden flex-shrink-0">
              {p.images && p.images[0] ? (
                <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
              ) : (
                <div className="p-2 text-xs text-slate-500 flex items-center justify-center h-full">No image</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 truncate">{p.name}</div>
                  <div className="text-xs text-slate-400 truncate">{p.category}</div>
                  <div className="text-sm text-teal-300 mt-1">₹{p.price}</div>
                </div>
                <div className="ml-auto text-xs text-slate-400 whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</div>
              </div>

              {p.description && <div className="text-xs text-slate-400 mt-2 line-clamp-3">{p.description}</div>}

              {p.rejectionReason && p.status === 'rejected' && (
                <div className="mt-2 text-xs text-red-300">Rejection: {p.rejectionReason}</div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onApprove(p)}
                  className="px-3 py-1 rounded bg-emerald-400 text-black text-sm"
                >
                  Approve
                </button>

                <button
                  onClick={() => onReject(p)}
                  className="px-3 py-1 rounded bg-red-500 text-white text-sm"
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
  const [rejecting, setRejecting] = useState(null); // product being rejected
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleApprove = async (product) => {
    if (!confirm(`Approve product "${product.name}"?`)) return;
    try {
      await axiosClient.post(`/api/admin/products/${product._id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      await axiosClient.post(`/api/admin/products/${rejecting._id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    <div className="space-y-4">
      <h2 className="text-lg text-slate-100 font-semibold">Approvals</h2>

      {loading ? (
        <div className="text-slate-400">Loading pending approvals...</div>
      ) : grouped.length === 0 ? (
        <div className="text-slate-400">No pending products.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <div className="bg-slate-900 border border-slate-800 p-4 rounded w-full max-w-md">
            <h3 className="text-sm text-slate-100 mb-2">Reject: {rejecting.name}</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full rounded bg-slate-950 border border-slate-700 p-2 text-sm text-slate-100 mb-3"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setRejecting(null); setReason(''); }} className="px-3 py-2 rounded border border-slate-700 text-sm text-slate-300">Cancel</button>
              <button onClick={submitReject} className="px-3 py-2 rounded bg-red-500 text-white text-sm">Submit Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
