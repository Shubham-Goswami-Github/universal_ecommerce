import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

const PAYMENT_OPTIONS = [
  'pending',
  'paid',
  'failed',
  'refunded',
];

const STATUS_COLORS = {
  pending: 'text-yellow-600',
  confirmed: 'text-blue-600',
  shipped: 'text-indigo-600',
  delivered: 'text-green-600',
  cancelled: 'text-red-600',
};

const VendorOrders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [form, setForm] = useState({});
  const [openHistory, setOpenHistory] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/orders/vendor', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleChange = (orderId, field, value) => {
    setForm((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (order) => {
    const data = form[order._id];

    if (!data?.note || !data.note.trim()) {
      alert('Vendor note / reason is mandatory');
      return;
    }

    try {
      setSavingId(order._id);

      await axiosClient.patch(
        `/api/orders/vendor/${order._id}/status`,
        {
          status: data.status || order.status,
          paymentStatus: data.paymentStatus || order.paymentStatus,
          note: data.note, // 🔥 BACKEND EXPECTS `note`
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('✅ Order updated successfully');
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading orders...</p>;
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => {
        const local = form[order._id] || {};

        return (
          <div
            key={order._id}
            className="rounded-xl border bg-white shadow-sm p-5"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Order #{order._id.slice(-6)}
              </h3>
              <span className="text-xs text-slate-500">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>

            {/* CUSTOMER */}
            <div className="text-xs text-slate-600 mb-3">
              Customer:{' '}
              <span className="font-medium">{order.user?.name}</span> (
              {order.user?.email})
            </div>

            {/* ITEMS */}
            <div className="rounded-lg bg-slate-50 p-3 mb-4 text-sm">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {i.productName} × {i.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{i.productPrice * i.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* STATUS TOGGLE */}
            <button
              onClick={() =>
                setOpenHistory(openHistory === order._id ? null : order._id)
              }
              className={`text-xs font-semibold underline mb-3 ${
                STATUS_COLORS[order.status]
              }`}
            >
              Status: {order.status} · Payment: {order.paymentStatus}
            </button>

            {/* STATUS HISTORY */}
            {openHistory === order._id && (
              <div className="mb-4 border rounded-lg bg-slate-50 p-3 text-xs">
                <div className="font-semibold text-slate-700 mb-2">
                  Status History
                </div>

                {order.statusHistory?.length > 0 ? (
                  order.statusHistory.map((h, idx) => (
                    <div
                      key={idx}
                      className="mb-2 border-b last:border-b-0 pb-2 last:pb-0"
                    >
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">
                          {h.previousStatus} → {h.newStatus}
                        </span>
                        <span className="text-slate-500">
                          {new Date(h.changedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-slate-500">
                        Payment: {h.previousPaymentStatus} →{' '}
                        {h.newPaymentStatus}
                      </div>

                      <div className="text-slate-600 mt-1">
                        <strong>{h.changedBy} note:</strong> {h.note}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No history yet.</p>
                )}
              </div>
            )}

            {/* CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <select
                className="rounded-md border px-2 py-1 text-sm"
                value={local.status || order.status}
                onChange={(e) =>
                  handleChange(order._id, 'status', e.target.value)
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>

              <select
                className="rounded-md border px-2 py-1 text-sm"
                value={local.paymentStatus || order.paymentStatus}
                onChange={(e) =>
                  handleChange(order._id, 'paymentStatus', e.target.value)
                }
              >
                {PAYMENT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    Payment: {p}
                  </option>
                ))}
              </select>

              <input
                placeholder="Mandatory note / reason"
                className="rounded-md border px-2 py-1 text-sm"
                value={local.note || ''}
                onChange={(e) =>
                  handleChange(order._id, 'note', e.target.value)
                }
              />
            </div>

            {/* SAVE */}
            <button
              disabled={savingId === order._id}
              onClick={() => handleSave(order)}
              className="rounded-md bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 text-sm font-medium disabled:opacity-60"
            >
              {savingId === order._id ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        );
      })}

      {orders.length === 0 && (
        <p className="text-sm text-slate-500 text-center">
          No orders yet.
        </p>
      )}
    </div>
  );
};

export default VendorOrders;
