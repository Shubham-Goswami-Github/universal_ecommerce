// src/components/admin/AdminApprovals.jsx
import { useEffect, useState, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/* ICONS                                                                      */
/* -------------------------------------------------------------------------- */
const Icons = {
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Store: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Category: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  Info: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  DollarSign: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Image: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  CheckAll: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
};

/* -------------------------------------------------------------------------- */
/* STAT CARD                                                                  */
/* -------------------------------------------------------------------------- */
function StatCard({ icon: Icon, label, value, color = 'blue', subtext }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-500 to-amber-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtext && <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <span className="text-white">{Icon && <Icon />}</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CATEGORY BADGE                                                             */
/* -------------------------------------------------------------------------- */
function CategoryBadge({ category, count }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-medium text-purple-700">
      <Icons.Category />
      {category}
      {count > 1 && (
        <span className="px-1.5 py-0.5 bg-purple-200 rounded-full text-[10px]">{count}</span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* PRODUCT SELECTION CARD                                                     */
/* -------------------------------------------------------------------------- */
function ProductSelectionCard({ product, isSelected, onToggle, onView }) {
  const image = product.images?.[0] || null;
  const price = product.sellingPrice || product.price || 0;
  const discount = product.mrp && product.mrp > price
    ? Math.round(((product.mrp - price) / product.mrp) * 100)
    : 0;

  return (
    <div
      className={`relative bg-white border-2 rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(product._id)}
            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full">
            {discount}% OFF
          </span>
        </div>
      )}

      {/* Image */}
      <div
        className="h-36 bg-slate-100 cursor-pointer relative group"
        onClick={() => onView(product)}
      >
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Icons.Image />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-700 flex items-center gap-1">
            <Icons.Eye /> View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4
          className="text-sm font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors mb-1"
          onClick={() => onView(product)}
        >
          {product.name}
        </h4>

        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <Icons.Category />
          {product.category?.name || 'Uncategorized'}
        </p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-bold text-emerald-600">₹{price.toLocaleString()}</span>
          {product.mrp && product.mrp > price && (
            <span className="text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString()}</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${(product.totalStock || 0) > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            Stock: {product.totalStock || 0}
          </span>
          <span className="flex items-center gap-1">
            <Icons.Calendar />
            {new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-slate-100 p-2 flex gap-1">
        <button
          onClick={() => onView(product)}
          className="flex-1 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <Icons.Eye /> View
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VENDOR SECTION WITH DETAILS                                                */
/* -------------------------------------------------------------------------- */
function VendorSection({
  vendor,
  products,
  selectedProducts,
  onToggleProduct,
  onToggleAll,
  onView,
  onApproveSelected,
  onRejectSelected,
}) {
  const [expanded, setExpanded] = useState(true);
  const [showVendorDetails, setShowVendorDetails] = useState(false);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const categories = {};
    products.forEach((p) => {
      const catName = p.category?.name || 'Uncategorized';
      categories[catName] = (categories[catName] || 0) + 1;
    });
    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const selectedCount = products.filter((p) => selectedProducts.includes(p._id)).length;
  const allSelected = selectedCount === products.length && products.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Vendor Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Vendor Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                {vendor?.name?.charAt(0).toUpperCase() || 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">{vendor?.name || 'Unknown Vendor'}</h3>
                  <button
                    onClick={() => setShowVendorDetails(!showVendorDetails)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View vendor details"
                  >
                    <Icons.Info />
                  </button>
                </div>
                <p className="text-xs text-slate-500 truncate">{vendor?.email || 'No email'}</p>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                  {products.length} Pending
                </span>
                {selectedCount > 0 && (
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {selectedCount} Selected
                  </span>
                )}
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {expanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
              </button>
            </div>
          </div>

          {/* Vendor Details Expanded */}
          {showVendorDetails && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icons.Mail />
                <span className="truncate">{vendor?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icons.Phone />
                <span>{vendor?.mobileNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icons.Calendar />
                <span>Joined: {vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Categories Applied:</p>
              <div className="flex flex-wrap gap-1.5">
                {categoryBreakdown.map(([cat, count]) => (
                  <CategoryBadge key={cat} category={cat} count={count} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selection Controls */}
        {expanded && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleAll(vendor?._id, products.map((p) => p._id))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-slate-600">Select All ({products.length})</span>
            </label>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApproveSelected(products.filter((p) => selectedProducts.includes(p._id)))}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1"
                >
                  <Icons.Check /> Approve ({selectedCount})
                </button>
                <button
                  onClick={() => onRejectSelected(products.filter((p) => selectedProducts.includes(p._id)))}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <Icons.X /> Reject ({selectedCount})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {expanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductSelectionCard
                key={product._id}
                product={product}
                isSelected={selectedProducts.includes(product._id)}
                onToggle={onToggleProduct}
                onView={onView}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRODUCT DETAIL MODAL                                                       */
/* -------------------------------------------------------------------------- */
function ProductDetailModal({ product, onClose, onApprove, onReject }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <Icons.Info /> },
    { id: 'pricing', label: 'Pricing', icon: <Icons.DollarSign /> },
    { id: 'stock', label: 'Stock', icon: <Icons.Package /> },
    { id: 'images', label: 'Images', icon: <Icons.Image /> },
  ];

  const discountPercentage = product.mrp && product.sellingPrice
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icons.Clipboard />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Product Review</h2>
              <p className="text-blue-100 text-xs">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                PENDING REVIEW
              </span>
              <span className="text-xs text-slate-500">
                Submitted {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>SKU: <strong>{product.sku || 'N/A'}</strong></span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-slate-50 overflow-x-auto flex-shrink-0">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Icons.Image />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{product.shortTitle}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.brandName && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {product.brandName}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Vendor Information</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {product.vendor?.name?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{product.vendor?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{product.vendor?.email}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.shortDescription && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
                  <p className="text-sm text-slate-600">{product.shortDescription}</p>
                </div>
              )}

              {/* Key Features */}
              {product.keyFeatures?.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Features</h4>
                  <ul className="space-y-1">
                    {product.keyFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Price Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">MRP</p>
                  <p className="text-xl font-bold text-slate-400 line-through">₹{product.mrp || 0}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Selling Price</p>
                  <p className="text-xl font-bold text-slate-800">₹{product.sellingPrice || 0}</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-xs text-slate-500 mb-1">Discount</p>
                  <p className="text-xl font-bold text-emerald-600">{discountPercentage}% OFF</p>
                </div>
                <div className="text-center p-4 bg-green-500 rounded-xl">
                  <p className="text-xs text-green-100 mb-1">Final Price</p>
                  <p className="text-xl font-bold text-white">₹{product.finalPrice || product.sellingPrice || 0}</p>
                </div>
              </div>

              {/* Tax Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Tax Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">GST Applicable</p>
                    <p className="font-medium text-slate-900">{product.gstApplicable ? 'Yes' : 'No'}</p>
                  </div>
                  {product.gstApplicable && (
                    <div>
                      <p className="text-slate-500">GST Rate</p>
                      <p className="font-medium text-slate-900">{product.gstPercentage || 0}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border-2 ${
                  (product.totalStock || 0) > 10 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}>
                  <p className="text-xs text-slate-500">Total Stock</p>
                  <p className={`text-2xl font-bold ${(product.totalStock || 0) > 10 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {product.totalStock || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                  <p className="text-xs text-slate-500">Min Purchase</p>
                  <p className="text-2xl font-bold text-blue-600">{product.minPurchaseQty || 1}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-200">
                  <p className="text-xs text-slate-500">Max Purchase</p>
                  <p className="text-2xl font-bold text-purple-600">{product.maxPurchaseQty || 5}</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border-2 border-orange-200">
                  <p className="text-xs text-slate-500">Low Stock Alert</p>
                  <p className="text-2xl font-bold text-orange-600">{product.lowStockAlertQty || 5}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              {product.images?.length > 0 ? (
                <>
                  <div className="bg-slate-100 rounded-xl overflow-hidden h-64 flex items-center justify-center">
                    <img
                      src={product.images[activeImageIndex]}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                          activeImageIndex === idx ? 'border-blue-500' : 'border-slate-200'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Icons.Image />
                  <p className="mt-2">No images uploaded</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t px-6 py-4 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-500 truncate">
            ID: <span className="font-mono">{product._id}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition text-sm font-medium"
            >
              Close
            </button>
            <button
              onClick={() => onReject(product)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium flex items-center gap-1.5"
            >
              <Icons.XCircle /> Reject
            </button>
            <button
              onClick={() => onApprove(product)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium flex items-center gap-1.5"
            >
              <Icons.CheckCircle /> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* BULK REJECT MODAL                                                          */
/* -------------------------------------------------------------------------- */
function BulkRejectModal({ products, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState('');

  const quickReasons = [
    'Incomplete product details',
    'Low quality images',
    'Incorrect pricing information',
    'Policy violation',
    'Duplicate product listing',
    'Misleading description',
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Icons.Warning />
          </div>
          <div>
            <h3 className="font-semibold text-white">Reject Products</h3>
            <p className="text-red-100 text-xs">{products.length} product(s) selected</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selected Products Summary */}
          <div className="bg-slate-50 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
            <p className="text-xs font-medium text-slate-500 mb-2">Products to reject:</p>
            <div className="space-y-1">
              {products.map((p) => (
                <div key={p._id} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none text-sm"
            />
          </div>

          {/* Quick Reasons */}
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((qr) => (
                <button
                  key={qr}
                  onClick={() => setReason(qr)}
                  className="px-2.5 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={submitting || !reason.trim()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Rejecting...
              </>
            ) : (
              <>
                <Icons.XCircle /> Reject All
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */
function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icons.CheckCircle />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto">
        No pending products to review. All submissions have been processed.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING STATE                                                              */
/* -------------------------------------------------------------------------- */
function LoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="bg-slate-100 rounded-xl h-48"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */
export default function AdminApprovals() {
  const { auth } = useAuth();
  const token = auth.token;

  // State
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [rejectingProducts, setRejectingProducts] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const fetchGrouped = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/pending-products-grouped', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrouped(res.data.grouped || []);
      setSelectedProducts([]);
    } catch (err) {
      console.error(err);
      setGrouped([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchGrouped();
  }, [token]);

  // Get all categories for filter
  const allCategories = useMemo(() => {
    const cats = new Set();
    grouped.forEach((g) => {
      g.products.forEach((p) => {
        if (p.category?.name) cats.add(p.category.name);
      });
    });
    return Array.from(cats).sort();
  }, [grouped]);

  // Filtered data
  const filteredGrouped = useMemo(() => {
    return grouped
      .map((g) => ({
        ...g,
        products: g.products.filter((p) => {
          const matchesSearch =
            !searchQuery ||
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesCategory =
            !categoryFilter || p.category?.name === categoryFilter;

          return matchesSearch && matchesCategory;
        }),
      }))
      .filter((g) => g.products.length > 0);
  }, [grouped, searchQuery, categoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const allProducts = grouped.flatMap((g) => g.products);
    return {
      totalPending: allProducts.length,
      totalVendors: grouped.length,
      totalCategories: allCategories.length,
    };
  }, [grouped, allCategories]);

  const hasFilters = searchQuery || categoryFilter;

  // Handlers
  const handleToggleProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleAll = (vendorId, productIds) => {
    const allSelected = productIds.every((id) => selectedProducts.includes(id));
    if (allSelected) {
      setSelectedProducts((prev) => prev.filter((id) => !productIds.includes(id)));
    } else {
      setSelectedProducts((prev) => [...new Set([...prev, ...productIds])]);
    }
  };

  const handleApprove = async (product) => {
    if (!window.confirm(`Approve "${product.name}"?`)) return;
    try {
      setSubmitting(true);
      await axiosClient.post(
        `/api/admin/products/${product._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViewingProduct(null);
      fetchGrouped();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveSelected = async (products) => {
    if (!window.confirm(`Approve ${products.length} product(s)?`)) return;
    try {
      setSubmitting(true);
      await Promise.all(
        products.map((p) =>
          axiosClient.post(
            `/api/admin/products/${p._id}/approve`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      fetchGrouped();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve some products');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSelected = (products) => {
    setRejectingProducts(products);
  };

  const submitBulkReject = async (reason) => {
    if (!rejectingProducts || !reason.trim()) return;
    try {
      setSubmitting(true);
      await Promise.all(
        rejectingProducts.map((p) =>
          axiosClient.post(
            `/api/admin/products/${p._id}/reject`,
            { reason },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setRejectingProducts(null);
      fetchGrouped();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject some products');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white"><Icons.Clipboard /></span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Product Approvals</h1>
              <p className="text-sm text-slate-500">Review and approve vendor product submissions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-sm text-slate-600">
                  {selectedProducts.length} selected
                </span>
                <button
                  onClick={() => {
                    const allProducts = filteredGrouped.flatMap((g) => g.products);
                    const selected = allProducts.filter((p) => selectedProducts.includes(p._id));
                    handleApproveSelected(selected);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1"
                >
                  <Icons.Check /> Approve All
                </button>
                <button
                  onClick={() => {
                    const allProducts = filteredGrouped.flatMap((g) => g.products);
                    const selected = allProducts.filter((p) => selectedProducts.includes(p._id));
                    handleRejectSelected(selected);
                  }}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <Icons.X /> Reject All
                </button>
              </div>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                showFilters || hasFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icons.Filter />
              <span className="text-sm font-medium hidden sm:inline">Filters</span>
              {hasFilters && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
            </button>

            <button
              onClick={fetchGrouped}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Icons.Refresh />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-amber-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icons.Search />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Icons.Close />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Icons.Clock}
          label="Total Pending"
          value={stats.totalPending}
          color="amber"
        />
        <StatCard
          icon={Icons.Store}
          label="Vendors"
          value={stats.totalVendors}
          color="blue"
        />
        <StatCard
          icon={Icons.Category}
          label="Categories"
          value={stats.totalCategories}
          color="purple"
        />
        <StatCard
          icon={Icons.CheckAll}
          label="Selected"
          value={selectedProducts.length}
          color="green"
          subtext={selectedProducts.length > 0 ? 'Ready to process' : 'None selected'}
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : filteredGrouped.length === 0 ? (
        hasFilters ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 mb-4">No products match your filters</p>
            <button onClick={clearFilters} className="text-blue-600 hover:underline font-medium">
              Clear filters
            </button>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <div className="space-y-4">
          {filteredGrouped.map((g) => (
            <VendorSection
              key={g.vendor?._id || 'unknown'}
              vendor={g.vendor}
              products={g.products}
              selectedProducts={selectedProducts}
              onToggleProduct={handleToggleProduct}
              onToggleAll={handleToggleAll}
              onView={setViewingProduct}
              onApproveSelected={handleApproveSelected}
              onRejectSelected={handleRejectSelected}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      {!loading && filteredGrouped.length > 0 && (
        <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600">
          <span>
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {filteredGrouped.reduce((acc, g) => acc + g.products.length, 0)}
            </span>{' '}
            products from{' '}
            <span className="font-semibold text-slate-900">{filteredGrouped.length}</span> vendors
          </span>
          {hasFilters && (
            <button onClick={clearFilters} className="text-blue-600 hover:underline font-medium">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Product Detail Modal */}
      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onApprove={handleApprove}
          onReject={(p) => {
            setViewingProduct(null);
            setRejectingProducts([p]);
          }}
        />
      )}

      {/* Bulk Reject Modal */}
      {rejectingProducts && (
        <BulkRejectModal
          products={rejectingProducts}
          onClose={() => setRejectingProducts(null)}
          onSubmit={submitBulkReject}
          submitting={submitting}
        />
      )}
    </div>
  );
}