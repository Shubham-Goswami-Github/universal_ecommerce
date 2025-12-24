// src/pages/Orders.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  out_for_delivery: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICONS = {
  pending: '🕐',
  confirmed: '✅',
  processing: '⚙️',
  shipped: '📦',
  out_for_delivery: '🚚',
  delivered: '🎉',
  cancelled: '❌',
};

const PAYMENT_COLORS = {
  pending: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cod: 'bg-blue-100 text-blue-700',
};

const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const formatDateShort = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openHistory, setOpenHistory] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showNewOrderBanner, setShowNewOrderBanner] = useState(false);

  // Check if redirected from successful order
  useEffect(() => {
    if (location.state?.orderSuccess) {
      setShowNewOrderBanner(true);
      // Clear the state
      window.history.replaceState({}, document.title);
      
      // Hide banner after 5 seconds
      setTimeout(() => {
        setShowNewOrderBanner(false);
      }, 5000);
    }
  }, [location]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/orders/my');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Get order counts
  const orderCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success Banner */}
      {showNewOrderBanner && (
        <div className="bg-green-500 text-white py-3 px-4 animate-slide-down">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold">🎉 Order placed successfully! Thank you for your purchase.</span>
            </div>
            <button 
              onClick={() => setShowNewOrderBanner(false)}
              className="text-white hover:text-green-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
              <p className="text-gray-500 text-sm mt-1">
                Track, manage and view all your orders
              </p>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'pending', label: 'Pending' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'shipped', label: 'Shipped' },
              { key: 'delivered', label: 'Delivered' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 ${
                  filter === tab.key
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {orderCounts[tab.key] > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {orderCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? "Looks like you haven't placed any orders yet."
                : `You don't have any ${filter} orders at the moment.`}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <div
                key={order._id}
                className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                  showNewOrderBanner && index === 0 ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                }`}
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Order Placed</p>
                      <p className="font-medium text-gray-800">{formatDateShort(order.createdAt)}</p>
                    </div>
                    
                    <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                    
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                      <p className="font-bold text-gray-800">₹{order.totalAmount}</p>
                    </div>
                    
                    <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
                    
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Ship To</p>
                      <p className="font-medium text-gray-800">{order.shippingAddress?.fullName || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                    <p className="font-mono text-sm text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${STATUS_COLORS[order.status]}`}>
                      <span>{STATUS_ICONS[order.status]}</span>
                      <span className="capitalize">{order.status.replace(/_/g, ' ')}</span>
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[order.paymentStatus] || PAYMENT_COLORS.pending}`}>
                      Payment: {order.paymentStatus || 'COD'}
                    </span>

                    {order.vendor?.name && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Sold by: {order.vendor.name}
                      </span>
                    )}
                  </div>

                  {/* Delivery Status Message */}
                  {order.status === 'shipped' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-3">
                      <span className="text-2xl">🚚</span>
                      <div>
                        <p className="font-semibold text-blue-800">Your order is on the way!</p>
                        <p className="text-sm text-blue-600">Expected delivery in 2-3 business days</p>
                      </div>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="font-semibold text-green-800">Order Delivered Successfully!</p>
                        <p className="text-sm text-green-600">Delivered on {formatDateShort(order.deliveredAt || order.updatedAt)}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
                        <img
  src={
    item.productImage
      ? item.productImage
      : 'https://via.placeholder.com/80?text=No+Image'
  }
  alt={item.productName}
  className="w-full h-full object-cover"
/>

                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Qty: {item.quantity} × ₹{item.productPrice}
                          </p>
                          <p className="font-bold text-gray-800">
                            ₹{item.productPrice * item.quantity}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                            View Product
                          </button>
                          {order.status === 'delivered' && (
                            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline">
                              Write Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Timeline Toggle */}
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => setOpenHistory(openHistory === order._id ? null : order._id)}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${openHistory === order._id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {openHistory === order._id ? 'Hide Order Timeline' : 'View Order Timeline'}
                    </button>

                    {/* Status History Timeline */}
                    {openHistory === order._id && (
                      <div className="mt-4 pl-4 border-l-2 border-blue-200 space-y-4 animate-fade-in">
                        {/* Current Status */}
                        <div className="relative">
                          <span className="absolute -left-[21px] w-4 h-4 rounded-full bg-blue-600 border-4 border-blue-100"></span>
                          <div className="ml-4">
                            <p className="font-semibold text-gray-800 capitalize flex items-center gap-2">
                              {STATUS_ICONS[order.status]} {order.status.replace(/_/g, ' ')}
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                          </div>
                        </div>

                        {/* Status History */}
                        {order.statusHistory?.length > 0 ? (
                          [...order.statusHistory].reverse().map((h, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-[21px] w-4 h-4 rounded-full bg-gray-300 border-4 border-gray-100"></span>
                              <div className="ml-4">
                                <p className="font-medium text-gray-700 capitalize">
                                  {h.previousStatus} → {h.newStatus}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(h.changedAt)}</p>
                                {h.note && (
                                  <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                                    📝 {h.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="relative">
                            <span className="absolute -left-[21px] w-4 h-4 rounded-full bg-gray-300 border-4 border-gray-100"></span>
                            <div className="ml-4">
                              <p className="font-medium text-gray-700">Order Placed</p>
                              <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t">
                      <details className="group">
                        <summary className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-800">
                          <svg className="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Delivery Address
                        </summary>
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.shippingAddress.addressLine1}
                            {order.shippingAddress.locality && `, ${order.shippingAddress.locality}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            📞 {order.shippingAddress.phone}
                            {order.shippingAddress.alternatePhone && `, ${order.shippingAddress.alternatePhone}`}
                          </p>
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
                    {order.status === 'pending' && (
                      <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition">
                        Cancel Order
                      </button>
                    )}
                    
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                      Need Help?
                    </button>
                    
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition">
                        Return/Exchange
                      </button>
                    )}
                    
                    <button 
                      onClick={() => navigate(`/`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition ml-auto"
                    >
                      Buy Again
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{orderCounts.delivered}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {orderCounts.pending + orderCounts.confirmed + orderCounts.shipped}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">
                  ₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Orders;