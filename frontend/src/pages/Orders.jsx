// src/pages/Orders.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const Orders = () => {
  const [orders, setOrders] = useState([]);

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
    <div>
      <h1 className="text-xl font-semibold text-slate-100 mb-4">
        My Orders
      </h1>
      {orders.length === 0 ? (
        <p className="text-sm text-slate-400">You have no orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <div className="text-slate-200 font-semibold text-sm">
                    Order #{o._id.slice(-6)}
                  </div>
                  <div className="text-slate-400">
                    Vendor: {o.vendor?.name || 'Vendor'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-teal-300 font-semibold">
                    ₹{o.totalAmount}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Status: {o.status} · Payment: {o.paymentStatus}
                  </div>
                </div>
              </div>
              <ul className="mt-2 space-y-1">
                {o.items.map((it) => (
                  <li key={it._id} className="flex justify-between">
                    <span className="text-slate-300">
                      {it.productName} × {it.quantity}
                    </span>
                    <span className="text-slate-400">
                      ₹{it.productPrice * it.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
