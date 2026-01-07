// src/components/vendor/VendorOrders.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import ProductQuickView from '../product/ProductQuickView';

/* ================= STATUS FLOW LOGIC ================= */
// Status can only move forward, not backward (except cancel from any stage)
const getNextAllowedStatuses = (currentStatus) => {
  switch (currentStatus) {
    case 'pending':
      return ['pending', 'confirmed', 'cancelled'];
    case 'confirmed':
      return ['confirmed', 'shipped', 'cancelled'];
    case 'shipped':
      return ['shipped', 'delivered', 'cancelled'];
    case 'delivered':
      return ['delivered']; // Final state - can't change
    case 'cancelled':
      return ['cancelled']; // Final state - can't change
    default:
      return [currentStatus];
  }
};

// Payment: pending → paid/failed, paid → refunded only
const getNextAllowedPaymentStatuses = (currentPaymentStatus, orderStatus) => {
  // If order is cancelled, payment can be refunded if it was paid
  if (orderStatus === 'cancelled') {
    if (currentPaymentStatus === 'paid') return ['paid', 'refunded'];
    return [currentPaymentStatus];
  }
  
  switch (currentPaymentStatus) {
    case 'pending':
      return ['pending', 'paid', 'failed'];
    case 'paid':
      return ['paid', 'refunded'];
    case 'failed':
      return ['failed', 'pending']; // Can retry
    case 'refunded':
      return ['refunded']; // Final state
    default:
      return [currentPaymentStatus];
  }
};

/* ================= CONSTANTS ================= */
const STATUS_TABS = [
  { key: 'all', label: 'All Orders', icon: 'grid' },
  { key: 'pending', label: 'Pending', icon: 'clock' },
  { key: 'confirmed', label: 'Confirmed', icon: 'check' },
  { key: 'shipped', label: 'Shipped', icon: 'truck' },
  { key: 'delivered', label: 'Delivered', icon: 'package' },
  { key: 'cancelled', label: 'Cancelled', icon: 'x' },
];

const PAYMENT_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

const STATUS_CONFIG = {
  pending: { 
    color: 'text-amber-600', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200',
    icon: '⏳',
    label: 'Pending'
  },
  confirmed: { 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    icon: '✓',
    label: 'Confirmed'
  },
  shipped: { 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50', 
    border: 'border-indigo-200',
    icon: '🚚',
    label: 'Shipped'
  },
  delivered: { 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200',
    icon: '📦',
    label: 'Delivered'
  },
  cancelled: { 
    color: 'text-red-600', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    icon: '✕',
    label: 'Cancelled'
  },
};

const PAYMENT_CONFIG = {
  pending: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Payment Pending' },
  paid: { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Paid' },
  failed: { color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
  refunded: { color: 'text-purple-600', bg: 'bg-purple-50', label: 'Refunded' },
};

/* ================= ICONS ================= */
const Icons = {
  grid: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  truck: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  package: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

/* ================= MAIN COMPONENT ================= */
const VendorOrders = ({ token, onEditProduct, onDeleteProduct }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [form, setForm] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  
  // Tab states
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [activePaymentTab, setActivePaymentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  /* ================= FETCH ORDERS ================= */
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

  /* ================= FILTERED ORDERS ================= */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (activeStatusTab !== 'all' && order.status !== activeStatusTab) {
        return false;
      }
      // Payment filter
      if (activePaymentTab !== 'all' && order.paymentStatus !== activePaymentTab) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const orderId = order._id.toLowerCase();
        const customerName = (order.user?.name || order.shippingAddress?.fullName || '').toLowerCase();
        const customerEmail = (order.user?.email || '').toLowerCase();
        return orderId.includes(query) || customerName.includes(query) || customerEmail.includes(query);
      }
      return true;
    });
  }, [orders, activeStatusTab, activePaymentTab, searchQuery]);

  /* ================= ORDER COUNTS ================= */
  const orderCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    return counts;
  }, [orders]);

  const paymentCounts = useMemo(() => {
    const baseOrders = activeStatusTab === 'all' 
      ? orders 
      : orders.filter(o => o.status === activeStatusTab);
    
    const counts = {
      all: baseOrders.length,
      pending: 0,
      paid: 0,
      failed: 0,
      refunded: 0,
    };
    baseOrders.forEach((order) => {
      if (counts[order.paymentStatus] !== undefined) {
        counts[order.paymentStatus]++;
      }
    });
    return counts;
  }, [orders, activeStatusTab]);

  /* ================= HANDLERS ================= */
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
      alert('Please provide a note/reason for this update');
      return;
    }

    const newStatus = data.status || order.status;
    const newPaymentStatus = data.paymentStatus || order.paymentStatus;

    // Validate status transition
    const allowedStatuses = getNextAllowedStatuses(order.status);
    if (!allowedStatuses.includes(newStatus)) {
      alert(`Cannot change status from "${order.status}" to "${newStatus}". Allowed: ${allowedStatuses.join(', ')}`);
      return;
    }

    // Validate payment status transition
    const allowedPaymentStatuses = getNextAllowedPaymentStatuses(order.paymentStatus, newStatus);
    if (!allowedPaymentStatuses.includes(newPaymentStatus)) {
      alert(`Cannot change payment status from "${order.paymentStatus}" to "${newPaymentStatus}". Allowed: ${allowedPaymentStatuses.join(', ')}`);
      return;
    }

    try {
      setSavingId(order._id);

      await axiosClient.patch(
        `/api/orders/vendor/${order._id}/status`,
        {
          status: newStatus,
          paymentStatus: newPaymentStatus,
          note: data.note,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear form and refresh
      setForm((prev) => {
        const newForm = { ...prev };
        delete newForm[order._id];
        return newForm;
      });
      
      fetchOrders();
    } catch (err) {
      console.error('Update order error:', err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  /* ================= HELPERS ================= */
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center gap-3">
          <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500">Loading orders...</span>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* ========== HEADER WITH SEARCH ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by order ID, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
          />
        </div>
      </div>

      {/* ========== STATUS TABS ========== */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveStatusTab(tab.key);
                setActivePaymentTab('all');
              }}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all
                ${activeStatusTab === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className={activeStatusTab === tab.key ? 'text-gray-900' : 'text-gray-400'}>
                {Icons[tab.icon]}
              </span>
              <span>{tab.label}</span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs
                ${activeStatusTab === tab.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {orderCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ========== PAYMENT SUB-TABS ========== */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Payment:</span>
        {PAYMENT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActivePaymentTab(tab.key)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full transition-all
              ${activePaymentTab === tab.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {tab.label}
            <span className="ml-1.5 opacity-70">({paymentCounts[tab.key]})</span>
          </button>
        ))}
      </div>

      {/* ========== STATUS FLOW GUIDE ========== */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium text-gray-700">Order Status Flow</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Pending</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Confirmed</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">Shipped</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Delivered</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Cancel anytime</span>
        </div>
      </div>

      {/* ========== ORDERS LIST ========== */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No orders found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here when customers make purchases'
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              form={form}
              expandedOrder={expandedOrder}
              showHistory={showHistory}
              savingId={savingId}
              onExpand={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              onToggleHistory={() => setShowHistory(showHistory === order._id ? null : order._id)}
              onChange={handleChange}
              onSave={handleSave}
              onViewProduct={async (productId) => {
                try {
                  const res = await axiosClient.get(`/api/products/${productId}`);
                  setQuickViewProduct(res.data.product);
                  setQuickViewOpen(true);
                } catch (err) {
                  console.error('Failed to fetch product:', err);
                }
              }}
              navigate={navigate}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              getInitials={getInitials}
            />
          ))
        )}
      </div>

      {/* ========== PRODUCT QUICK VIEW ========== */}
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

/* ================= ORDER CARD COMPONENT ================= */
const OrderCard = ({
  order,
  form,
  expandedOrder,
  showHistory,
  savingId,
  onExpand,
  onToggleHistory,
  onChange,
  onSave,
  onViewProduct,
  navigate,
  formatDate,
  formatCurrency,
  getInitials,
}) => {
  const local = form[order._id] || {};
  const addr = order.shippingAddress || {};
  const user = order.user || {};
  const isExpanded = expandedOrder === order._id;
  const isHistoryOpen = showHistory === order._id;
  const isSaving = savingId === order._id;

  const subtotal = order.subtotal ?? 0;
  const shippingFee = order.shippingFee ?? 0;
  const totalAmount = order.totalAmount ?? subtotal + shippingFee;

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const paymentConfig = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.pending;

  const displayPhone = user.mobileNumber || addr.phone || addr.mobileNumber || 'N/A';

  const allowedStatuses = getNextAllowedStatuses(order.status);
  const allowedPaymentStatuses = getNextAllowedPaymentStatuses(
    order.paymentStatus,
    local.status || order.status
  );

  const canEdit = allowedStatuses.length > 1 || allowedPaymentStatuses.length > 1;
  const hasChanges = local.status || local.paymentStatus || local.note;

  return (
    <div className={`
      bg-white rounded-xl border transition-all duration-200
      ${isExpanded ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:border-gray-300'}
    `}>
      {/* ========== ORDER HEADER ========== */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onExpand}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Order Info */}
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-xl
              ${statusConfig.bg} ${statusConfig.border} border
            `}>
              {statusConfig.icon}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-900">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h3>
                <span className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
                  ${statusConfig.bg} ${statusConfig.color}
                `}>
                  {statusConfig.label}
                </span>
                <span className={`
                  inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                  ${paymentConfig.bg} ${paymentConfig.color}
                `}>
                  {paymentConfig.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Center: Customer */}
          <div className="flex items-center gap-3 lg:flex-1 lg:justify-center">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-gray-600">
                  {getInitials(user.name || addr.fullName)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user.name || addr.fullName || 'Customer'}
              </p>
              <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
            </div>
          </div>

          {/* Right: Amount & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
            </div>
            
            <button className={`
              p-2 rounded-lg transition-colors
              ${isExpanded ? 'bg-gray-100' : 'hover:bg-gray-100'}
            `}>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ========== EXPANDED CONTENT ========== */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Customer & Address Grid */}
          <div className="grid md:grid-cols-2 gap-4 p-4">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Customer Details
              </h4>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {getInitials(user.name || addr.fullName)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{user.name || addr.fullName || 'N/A'}</p>
                  {user.gender && (
                    <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded mt-1 capitalize">
                      {user.gender}
                    </span>
                  )}
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${user.email}`} className="text-gray-600 hover:text-gray-900">
                        {user.email || 'N/A'}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${displayPhone}`} className="text-gray-600 hover:text-gray-900">
                        {displayPhone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Shipping Address
              </h4>
              {addr.addressLine1 ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-medium text-gray-900">{addr.fullName || user.name}</p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  {addr.locality && <p>{addr.locality}</p>}
                  <p>
                    {addr.city}, {addr.state} - {addr.postalCode || addr.pincode}
                  </p>
                  <p className="text-gray-500">{addr.country || 'India'}</p>
                  {addr.phone && (
                    <p className="pt-2">
                      <span className="text-gray-500">Phone:</span> {addr.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No shipping address provided</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Order Items ({order.items?.length || 0})
              </h4>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100"
                  >
                    {/* Product Image */}
                    <div 
                      className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-gray-300 transition"
                      onClick={() => item.product && onViewProduct(item.product)}
                    >
                      {item.productImage ? (
                        <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-medium text-gray-900 hover:text-gray-600 cursor-pointer truncate"
                        onClick={() => item.product && onViewProduct(item.product)}
                      >
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        <span>×</span>
                        <span>{formatCurrency(item.productPrice)}</span>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.productPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{shippingFee ? formatCurrency(shippingFee) : 'Free'}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Payment Method</span>
                      <span className="uppercase">{order.paymentMethod || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status History Toggle */}
          <div className="px-4 pb-4">
            <button
              onClick={onToggleHistory}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              <svg className={`w-4 h-4 transition-transform ${isHistoryOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Status History ({order.statusHistory?.length || 0})</span>
            </button>

            {isHistoryOpen && (
              <div className="mt-3 bg-gray-50 rounded-xl p-4">
                {order.statusHistory?.length > 0 ? (
                  <div className="space-y-3">
                    {order.statusHistory.map((h, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                          {idx < order.statusHistory.length - 1 && (
                            <div className="w-px flex-1 bg-gray-300"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[h.previousStatus]?.bg} ${STATUS_CONFIG[h.previousStatus]?.color}`}>
                              {h.previousStatus}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[h.newStatus]?.bg} ${STATUS_CONFIG[h.newStatus]?.color}`}>
                              {h.newStatus}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(h.changedAt)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            <span className="text-gray-500">Payment:</span>{' '}
                            {h.previousPaymentStatus} → {h.newPaymentStatus}
                          </div>
                          {h.note && (
                            <p className="mt-1 text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                              <span className="font-medium">{h.changedBy}:</span> {h.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No status changes yet</p>
                )}
              </div>
            )}
          </div>

          {/* Update Controls */}
          {canEdit && (
            <div className="border-t border-gray-100 p-4 bg-gray-50/50">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Update Order Status
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {/* Status Select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Order Status</label>
                  <select
                    className={`
                      w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10
                      ${allowedStatuses.length <= 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    `}
                    value={local.status || order.status}
                    onChange={(e) => onChange(order._id, 'status', e.target.value)}
                    disabled={allowedStatuses.length <= 1}
                  >
                    {allowedStatuses.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s]?.label || s}
                        {s === order.status ? ' (current)' : ''}
                      </option>
                    ))}
                  </select>
                  {allowedStatuses.length <= 1 && (
                    <p className="text-xs text-gray-400 mt-1">Final status - cannot change</p>
                  )}
                </div>

                {/* Payment Status Select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Payment Status</label>
                  <select
                    className={`
                      w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10
                      ${allowedPaymentStatuses.length <= 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    `}
                    value={local.paymentStatus || order.paymentStatus}
                    onChange={(e) => onChange(order._id, 'paymentStatus', e.target.value)}
                    disabled={allowedPaymentStatuses.length <= 1}
                  >
                    {allowedPaymentStatuses.map((p) => (
                      <option key={p} value={p}>
                        {PAYMENT_CONFIG[p]?.label || p}
                        {p === order.paymentStatus ? ' (current)' : ''}
                      </option>
                    ))}
                  </select>
                  {allowedPaymentStatuses.length <= 1 && (
                    <p className="text-xs text-gray-400 mt-1">Cannot change</p>
                  )}
                </div>

                {/* Note Input */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Note / Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Required: Add a note..."
                    className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    value={local.note || ''}
                    onChange={(e) => onChange(order._id, 'note', e.target.value)}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {hasChanges ? 'You have unsaved changes' : 'Make changes above to update'}
                </p>
                <button
                  disabled={isSaving || !hasChanges}
                  onClick={() => onSave(order)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                    ${hasChanges
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Final Status Message */}
          {!canEdit && (
            <div className="border-t border-gray-100 p-4 bg-gray-50/50">
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg}`}>
                  <span className="text-lg">{statusConfig.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Order {order.status === 'delivered' ? 'Completed' : 'Cancelled'}
                  </p>
                  <p className="text-gray-500">
                    This order has reached its final status and cannot be modified.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;