import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import ProductQuickView from '../product/ProductQuickView';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const PAYMENT_OPTIONS = ['pending', 'paid', 'failed', 'refunded'];

const STATUS_COLORS = {
  pending: 'text-yellow-600',
  confirmed: 'text-blue-600',
  shipped: 'text-indigo-600',
  delivered: 'text-green-600',
  cancelled: 'text-red-600',
};

const VendorOrders = ({ token, onEditProduct, onDeleteProduct }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [form, setForm] = useState({});
  const [openHistory, setOpenHistory] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/orders/vendor', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Fetch vendor orders error:', err);
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
          note: data.note,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('✅ Order updated successfully');
      fetchOrders();
    } catch (err) {
      console.error('Update order error:', err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formatGender = (g) => {
    if (!g) return null;
    const v = g.toLowerCase();
    if (v === 'male') return 'Male';
    if (v === 'female') return 'Female';
    if (v === 'other') return 'Other';
    return g;
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading orders...</p>;
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => {
        const local = form[order._id] || {};
        const addr = order.shippingAddress || {};
        const user = order.user || {};

        const subtotal = order.subtotal ?? 0;
        const shippingFee = order.shippingFee ?? 0;
        const totalAmount = order.totalAmount ?? subtotal + shippingFee;

        const displayPhone =
          user.mobileNumber || addr.phone || addr.mobileNumber || 'N/A';
        const genderLabel = formatGender(user.gender);

        return (
          <div
            key={order._id}
            className="rounded-xl border bg-white shadow-sm p-5"
          >
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500">
                  Placed on{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>

              <div className="flex flex-col items-end text-xs">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                    STATUS_COLORS[order.status] || 'text-slate-600'
                  } border-slate-200 bg-slate-50`}
                >
                  {order.status.toUpperCase()}
                </span>
                <span className="mt-1 text-slate-500">
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* CUSTOMER + ADDRESS */}
            <div className="grid md:grid-cols-2 gap-4 mb-4 text-xs text-slate-700">
              {/* Customer details with avatar */}
              <div className="border rounded-lg p-3 bg-slate-50/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                  Customer
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name || 'Customer'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user.name || addr.fullName)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {user.name || addr.fullName || 'N/A'}
                    </p>
                    {genderLabel && (
                      <span className="inline-flex items-center rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-semibold px-2 py-[1px] mt-0.5">
                        {genderLabel}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mb-0.5">
                  <span className="text-slate-500">Email: </span>
                  <a
                    href={user.email ? `mailto:${user.email}` : '#'}
                    className="font-medium text-blue-600 break-all"
                  >
                    {user.email || addr.email || 'N/A'}
                  </a>
                </p>
                <p>
                  <span className="text-slate-500">Phone: </span>
                  <a
                    href={displayPhone !== 'N/A' ? `tel:${displayPhone}` : '#'}
                    className="font-medium"
                  >
                    {displayPhone}
                  </a>
                </p>
                {addr.alternatePhone && (
                  <p>
                    <span className="text-slate-500">Alt. Phone: </span>
                    <a
                      href={`tel:${addr.alternatePhone}`}
                      className="font-medium"
                    >
                      {addr.alternatePhone}
                    </a>
                  </p>
                )}
              </div>

              {/* Shipping Address */}
              <div className="border rounded-lg p-3 bg-slate-50/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                  Shipping Address
                </div>
                {addr.fullName || addr.addressLine1 ? (
                  <>
                    <p className="font-medium">
                      {addr.fullName || user.name || 'N/A'}
                    </p>
                    <p>
                      {addr.addressLine1 || ''}
                      {addr.locality ? `, ${addr.locality}` : ''}
                    </p>
                    <p>
                      {addr.city || 'City'}, {addr.state || 'State'} -{' '}
                      {addr.postalCode || addr.pincode || 'Pincode'}
                    </p>
                    <p className="text-slate-500 mt-1">
                      {addr.country || 'India'}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500">No shipping address found.</p>
                )}
              </div>
            </div>

            {/* ITEMS */}
            <div className="rounded-lg bg-slate-50 p-3 mb-4 text-sm">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">
                Products Purchased
              </div>
              {order.items.map((i, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    {/* Product image */}
                    <div
                      className="h-10 w-10 rounded-md overflow-hidden bg-white border border-slate-200 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => i.product && navigate(`/products/${i.product}`)}
                    >
                      {i.productImage ? (
                        <img
                          src={i.productImage}
                          alt={i.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Product name clickable */}
                      <p
                        className="font-medium text-slate-800 cursor-pointer hover:text-blue-600"
                        onClick={() => i.product && navigate(`/products/${i.product}`)}
                      >
                        {i.productName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {i.quantity} • Price: ₹{i.productPrice}
                      </p>
                      {i.product && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await axiosClient.get(`/api/products/${i.product}`);
                              setQuickViewProduct(res.data.product);
                              setQuickViewOpen(true);
                            } catch (err) {
                              console.error('Failed to fetch product:', err);
                            }
                          }}
                          className="mt-0.5 text-[11px] text-blue-600 hover:underline"
                        >
                          View product details
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="font-semibold text-slate-900">
                    ₹{i.productPrice * i.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="grid sm:grid-cols-3 gap-3 mb-4 text-xs">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-[11px] uppercase mb-1">
                  Subtotal
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  ₹{subtotal}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-[11px] uppercase mb-1">
                  Shipping
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {shippingFee ? `₹${shippingFee}` : 'Free'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-slate-500 text-[11px] uppercase mb-1">
                  Total / Payment
                </p>
                <p className="text-sm font-semibold text-emerald-600">
                  ₹{totalAmount}
                </p>
                <p className="text-[11px] text-slate-600">
                  Method: {order.paymentMethod?.toUpperCase() || 'N/A'}
                </p>
              </div>
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
              Status: {order.status} · Payment: {order.paymentStatus} · View
              history
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
                          {h.changedAt
                            ? new Date(h.changedAt).toLocaleString()
                            : ''}
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

      <ProductQuickView
        product={quickViewProduct}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onEdit={onEditProduct}
        onDelete={onDeleteProduct}
      />
    </div>
  );
};

export default VendorOrders;