import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [openHistory, setOpenHistory] = useState(null);

  const loadOrders = async () => {
    try {
      const res = await axiosClient.get('/api/orders/my');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          My Orders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your purchases and order progress
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            You haven’t placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div
              key={o._id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* ORDER HEADER */}
              <div className="flex flex-wrap items-start justify-between gap-4 p-5 border-b border-slate-200">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Order #{o._id.slice(-6)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Vendor: {o.vendor?.name || 'Vendor'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">
                    ₹{o.totalAmount}
                  </div>

                  <div className="flex justify-end gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        STATUS_COLORS[o.status]
                      }`}
                    >
                      {o.status}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600 capitalize">
                      {o.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div className="p-5">
                <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                  {o.items.map((it) => (
                    <div
                      key={it._id}
                      className="flex justify-between text-sm"
                    > 
                      <span className="text-slate-700">
                        {it.productName} × {it.quantity}
                      </span>
                      <span className="text-slate-600">
                        ₹{it.productPrice * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* TOGGLE HISTORY */}
                <button
                  onClick={() =>
                    setOpenHistory(openHistory === o._id ? null : o._id)
                  }
                  className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
                >
                  {openHistory === o._id
                    ? 'Hide Order Timeline ▲'
                    : 'View Order Timeline ▼'}
                </button>

                {/* STATUS HISTORY */}
                {openHistory === o._id && (
                  <div className="mt-5 border-t border-slate-200 pt-5 space-y-4">
                    <div className="text-xs font-semibold text-slate-600">
                      Order Status History
                    </div>

                    {o.statusHistory?.length > 0 ? (
                      o.statusHistory.map((h, idx) => (
                        <div
                          key={idx}
                          className="relative pl-5 border-l border-slate-300"
                        >
                          <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-blue-500" />

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-[12px] font-semibold text-slate-800 capitalize">
                              {h.previousStatus} → {h.newStatus}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {formatDate(h.changedAt)}
                            </div>
                          </div>

                          {h.note && (
                            <div className="mt-1 text-[11px] text-slate-600">
                              {h.note}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        No updates yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
