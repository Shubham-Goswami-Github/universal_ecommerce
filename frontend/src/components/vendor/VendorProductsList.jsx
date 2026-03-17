// src/components/vendor/VendorProductsList.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductQuickView from '../product/ProductQuickView';

const statusConfig = {
  approved: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

const VendorProductsList = ({ products, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No Products Yet</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          You haven't added any products yet. Start by adding your first product to begin selling.
        </p>
      </div>
    );
  }

  const handleViewDetails = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  const calculateDiscount = (mrp, price) => {
    if (mrp && mrp > price) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle & Stats Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{products.length}</span> products
          </span>
          <div className="hidden sm:flex items-center gap-1">
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              {products.filter(p => p.status === 'approved').length} Active
            </span>
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              {products.filter(p => p.status === 'pending').length} Pending
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Products List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {products.map((product) => {
            const image = product.images?.[0] || 'https://via.placeholder.com/80x80?text=No+Image';
            const price = product.finalPrice ?? product.sellingPrice ?? product.price ?? 0;
            const status = product.status || 'pending';
            const statusStyle = statusConfig[status] || statusConfig.pending;
            const discount = calculateDiscount(product.mrp, price);

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Product Image */}
                  <div
                    className="relative w-full md:w-24 h-40 md:h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer group/image"
                    onClick={() => handleViewDetails(product)}
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300"
                    />
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                        {discount}% OFF
                      </span>
                    )}
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                        Quick View
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Name & Status Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-slate-800 text-base cursor-pointer hover:text-blue-600 transition truncate"
                          onClick={() => handleViewDetails(product)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {product.category?.parent
                            ? `${product.category.parent.name} → ${product.category.name}`
                            : product.category?.name || 'Uncategorized'}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border flex-shrink-0
                        ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}
                      `}>
                        {statusStyle.icon}
                        <span className="capitalize">{status}</span>
                      </span>
                    </div>

                    {/* Price & Stock Row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-slate-800">
                          ₹{price.toLocaleString()}
                        </span>
                        {product.mrp && product.mrp > price && (
                          <span className="text-sm text-slate-400 line-through">
                            ₹{product.mrp.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Divider */}
                      <span className="hidden sm:block w-px h-4 bg-slate-200"></span>

                      {/* Stock */}
                      <div className={`
                        flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
                        ${(product.totalStock ?? 0) > 10 
                          ? 'bg-green-50 text-green-700' 
                          : (product.totalStock ?? 0) > 0 
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }
                      `}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        {(product.totalStock ?? 0) > 0 
                          ? `${product.totalStock} in stock` 
                          : 'Out of stock'
                        }
                      </div>

                      {/* Savings */}
                      {product.mrp && product.mrp > price && (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 font-medium">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Save ₹{(product.mrp - price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      {product.sku && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          SKU: <span className="font-mono font-medium text-slate-600">{product.sku}</span>
                        </span>
                      )}
                      {product.createdAt && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Added: {formatDate(product.createdAt)}
                        </span>
                      )}
                      {product.brandName && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {product.brandName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-4">
                    {/* View Details */}
                    <button
                      onClick={() => handleViewDetails(product)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden sm:inline">View</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(product)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(product._id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const image = product.images?.[0] || 'https://via.placeholder.com/200x200?text=No+Image';
            const price = product.finalPrice ?? product.sellingPrice ?? product.price ?? 0;
            const status = product.status || 'pending';
            const statusStyle = statusConfig[status] || statusConfig.pending;
            const discount = calculateDiscount(product.mrp, price);

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200"
              >
                {/* Image */}
                <div
                  className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
                  onClick={() => handleViewDetails(product)}
                >
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Status Badge */}
                  <span className={`
                    absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm
                    ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                    <span className="capitalize">{status}</span>
                  </span>

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {discount}% OFF
                    </span>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <button
                        className="w-full py-2 bg-white/90 backdrop-blur-sm text-slate-800 text-sm font-medium rounded-lg hover:bg-white transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(product);
                        }}
                      >
                        Quick View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <div>
                    <h3
                      className="font-semibold text-slate-800 text-sm line-clamp-2 cursor-pointer hover:text-blue-600 transition min-h-[40px]"
                      onClick={() => handleViewDetails(product)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {product.category?.parent
                        ? `${product.category.parent.name} → ${product.category.name}`
                        : product.category?.name || 'Uncategorized'}
                    </p>
                  </div>

                  {/* Price & Stock */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-800">
                        ₹{price.toLocaleString()}
                      </span>
                      {product.mrp && product.mrp > price && (
                        <span className="text-xs text-slate-400 line-through ml-1.5">
                          ₹{product.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className={`
                      text-xs font-medium px-2 py-1 rounded-lg
                      ${(product.totalStock ?? 0) > 10 
                        ? 'bg-green-50 text-green-700' 
                        : (product.totalStock ?? 0) > 0 
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }
                    `}>
                      {(product.totalStock ?? 0) > 0 
                        ? `${product.totalStock} left` 
                        : 'Out of stock'
                      }
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product._id)}
                      className="flex items-center justify-center p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleViewDetails(product)}
                      className="flex items-center justify-center p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default VendorProductsList;