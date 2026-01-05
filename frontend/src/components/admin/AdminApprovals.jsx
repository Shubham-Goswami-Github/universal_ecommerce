// src/pages/admin/AdminApprovals.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

// Product Detail Modal Component
const ProductDetailModal = ({ product, onClose, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📦' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'stock', label: 'Stock', icon: '📊' },
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'returns', label: 'Returns & Warranty', icon: '🔄' },
    { id: 'images', label: 'Images', icon: '🖼️' },
  ];

  // Calculate discount percentage
  const discountPercentage = product.mrp && product.sellingPrice
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl animate-modal-in">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Product Review</h2>
              <p className="text-blue-100 text-sm">Review all details before approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Status Banner */}
        <div className={`px-6 py-3 flex items-center justify-between ${
          product.status === 'pending' ? 'bg-yellow-50 border-b border-yellow-200' :
          product.status === 'approved' ? 'bg-green-50 border-b border-green-200' :
          'bg-red-50 border-b border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              product.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
              product.status === 'approved' ? 'bg-green-200 text-green-800' :
              'bg-red-200 text-red-800'
            }`}>
              {product.status?.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">
              Submitted on {new Date(product.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>SKU: <strong>{product.sku || 'N/A'}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Code: <strong>{product.productCode || 'N/A'}</strong></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  {product.shortTitle && (
                    <p className="text-gray-500 mb-2">{product.shortTitle}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {product.brandName && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {product.brandName}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {product.productType || 'Physical'}
                    </span>
                    {product.category && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {product.category?.parent?.name ? `${product.category.parent.name} / ` : ''}
                        {product.category?.name || product.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard title="Basic Details">
                  <InfoRow label="Product Name" value={product.name} />
                  <InfoRow label="Short Title" value={product.shortTitle} />
                  <InfoRow label="Brand Name" value={product.brandName} />
                  <InfoRow label="SKU" value={product.sku} />
                  <InfoRow label="Product Code" value={product.productCode} />
                  <InfoRow label="Product Type" value={product.productType} highlight />
                </InfoCard>

                <InfoCard title="Additional Info">
                  <InfoRow label="Country of Origin" value={product.countryOfOrigin} />
                  <InfoRow label="HSN Code" value={product.hsnCode} />
                  <InfoRow label="Category" value={
                    product.category?.parent?.name 
                      ? `${product.category.parent.name} → ${product.category.name}`
                      : product.category?.name
                  } />
                  <InfoRow label="Active Status" value={product.isActive ? 'Active' : 'Inactive'} highlight />
                  <InfoRow label="Availability" value={product.availabilityStatus} />
                </InfoCard>
              </div>

              {/* Vendor Info */}
              <InfoCard title="Vendor Information">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {product.vendor?.name?.charAt(0).toUpperCase() || 'V'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{product.vendor?.name || 'Unknown Vendor'}</p>
                    <p className="text-sm text-gray-500">{product.vendor?.email || 'No email'}</p>
                    <p className="text-xs text-gray-400">Vendor ID: {product.vendor?._id || 'N/A'}</p>
                  </div>
                </div>
              </InfoCard>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Price Summary Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>💰</span> Price Summary
                </h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">MRP</p>
                    <p className="text-2xl font-bold text-gray-400 line-through">₹{product.mrp || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Selling Price</p>
                    <p className="text-2xl font-bold text-gray-800">₹{product.sellingPrice || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Discount</p>
                    <p className="text-2xl font-bold text-green-600">{discountPercentage}% OFF</p>
                  </div>
                  <div className="text-center p-4 bg-green-500 rounded-lg shadow-sm">
                    <p className="text-sm text-green-100 mb-1">Final Price</p>
                    <p className="text-2xl font-bold text-white">₹{product.finalPrice || product.sellingPrice || 0}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard title="Pricing Details">
                  <InfoRow label="MRP" value={`₹${product.mrp || 0}`} />
                  <InfoRow label="Selling Price" value={`₹${product.sellingPrice || 0}`} />
                  <InfoRow label="Final Price" value={`₹${product.finalPrice || 0}`} highlight />
                  <InfoRow label="Discount Type" value={product.discountType || 'None'} />
                  <InfoRow label="Discount Value" value={product.discountValue ? 
                    (product.discountType === 'percentage' ? `${product.discountValue}%` : `₹${product.discountValue}`)
                    : 'N/A'
                  } />
                </InfoCard>

                <InfoCard title="Tax Configuration">
                  <InfoRow 
                    label="GST Applicable" 
                    value={product.gstApplicable ? 'Yes' : 'No'} 
                    highlight={product.gstApplicable}
                  />
                  {product.gstApplicable && (
                    <InfoRow label="GST Percentage" value={`${product.gstPercentage || 0}%`} />
                  )}
                  <InfoRow 
                    label="Tax Type" 
                    value={product.taxInclusive ? 'Tax Inclusive' : 'Tax Exclusive'} 
                  />
                </InfoCard>
              </div>
            </div>
          )}

          {/* Stock Tab */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              {/* Stock Status Cards */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${
                  product.totalStock > product.lowStockAlertQty 
                    ? 'bg-green-50 border-green-200' 
                    : product.totalStock > 0 
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                }`}>
                  <p className="text-sm text-gray-500 mb-1">Total Stock</p>
                  <p className={`text-3xl font-bold ${
                    product.totalStock > product.lowStockAlertQty 
                      ? 'text-green-600' 
                      : product.totalStock > 0 
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {product.totalStock || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">units available</p>
                </div>

                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <p className="text-sm text-gray-500 mb-1">Low Stock Alert</p>
                  <p className="text-3xl font-bold text-orange-600">{product.lowStockAlertQty || 5}</p>
                  <p className="text-xs text-gray-400 mt-1">minimum threshold</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-sm text-gray-500 mb-1">Min Purchase</p>
                  <p className="text-3xl font-bold text-blue-600">{product.minPurchaseQty || 1}</p>
                  <p className="text-xs text-gray-400 mt-1">per order</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-sm text-gray-500 mb-1">Max Purchase</p>
                  <p className="text-3xl font-bold text-purple-600">{product.maxPurchaseQty || 5}</p>
                  <p className="text-xs text-gray-400 mt-1">per order</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard title="Stock Settings">
                  <InfoRow label="Total Stock" value={product.totalStock || 0} />
                  <InfoRow label="Low Stock Alert Qty" value={product.lowStockAlertQty || 5} />
                  <InfoRow 
                    label="Stock Status" 
                    value={product.stockStatus || 'in_stock'} 
                    highlight={product.stockStatus === 'in_stock'}
                  />
                  <InfoRow 
                    label="Availability Status" 
                    value={product.availabilityStatus || 'available'} 
                  />
                </InfoCard>

                <InfoCard title="Purchase Limits">
                  <InfoRow label="Min Purchase Qty" value={product.minPurchaseQty || 1} />
                  <InfoRow label="Max Purchase Qty" value={product.maxPurchaseQty || 5} />
                  <InfoRow 
                    label="Allow Backorders" 
                    value={product.allowBackorders ? 'Yes' : 'No'}
                    highlight={product.allowBackorders}
                  />
                </InfoCard>
              </div>
            </div>
          )}

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              {/* Short Description */}
              <div className="bg-gray-50 rounded-xl p-5 border">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📄</span> Short Description
                </h4>
                <p className="text-gray-600">
                  {product.shortDescription || <span className="text-gray-400 italic">No short description provided</span>}
                </p>
              </div>

              {/* Full Description */}
              <div className="bg-gray-50 rounded-xl p-5 border">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📝</span> Full Description
                </h4>
                <div 
                  className="text-gray-600 prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: product.fullDescription || '<span class="text-gray-400 italic">No full description provided</span>' 
                  }}
                />
              </div>

              {/* Key Features */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>✨</span> Key Features
                </h4>
                {product.keyFeatures?.length > 0 ? (
                  <ul className="space-y-2">
                    {product.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">No key features listed</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Usage Instructions */}
                <div className="bg-gray-50 rounded-xl p-5 border">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📋</span> Usage Instructions
                  </h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
                    {product.usageInstructions || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                </div>

                {/* Care Instructions */}
                <div className="bg-gray-50 rounded-xl p-5 border">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🧹</span> Care Instructions
                  </h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
                    {product.careInstructions || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                </div>
              </div>

              {/* Box Contents */}
              <div className="bg-gray-50 rounded-xl p-5 border">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📦</span> Box Contents
                </h4>
                <p className="text-gray-600 text-sm whitespace-pre-line">
                  {product.boxContents || <span className="text-gray-400 italic">Not specified</span>}
                </p>
              </div>
            </div>
          )}

          {/* Returns & Warranty Tab */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Return Card */}
                <div className={`p-5 rounded-xl border-2 ${
                  product.returnAvailable 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      product.returnAvailable ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <span className="text-white text-lg">↩️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Return</p>
                      <p className={`text-sm ${product.returnAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                        {product.returnAvailable ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                  {product.returnAvailable && product.returnDays && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-2xl font-bold text-green-600">{product.returnDays} Days</p>
                      <p className="text-xs text-gray-500">Return Window</p>
                    </div>
                  )}
                </div>

                {/* Replacement Card */}
                <div className={`p-5 rounded-xl border-2 ${
                  product.replacementAvailable 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      product.replacementAvailable ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      <span className="text-white text-lg">🔄</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Replacement</p>
                      <p className={`text-sm ${product.replacementAvailable ? 'text-blue-600' : 'text-gray-400'}`}>
                        {product.replacementAvailable ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Warranty Card */}
                <div className={`p-5 rounded-xl border-2 ${
                  product.warrantyAvailable 
                    ? 'bg-purple-50 border-purple-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      product.warrantyAvailable ? 'bg-purple-500' : 'bg-gray-300'
                    }`}>
                      <span className="text-white text-lg">🛡️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Warranty</p>
                      <p className={`text-sm ${product.warrantyAvailable ? 'text-purple-600' : 'text-gray-400'}`}>
                        {product.warrantyAvailable ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                  {product.warrantyAvailable && (
                    <div className="bg-white rounded-lg p-3 space-y-1">
                      <p className="text-lg font-bold text-purple-600">{product.warrantyPeriod || 'N/A'}</p>
                      <p className="text-xs text-gray-500 capitalize">{product.warrantyType || ''} Warranty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Table */}
              <InfoCard title="Policy Summary">
                <InfoRow label="Return Available" value={product.returnAvailable ? 'Yes' : 'No'} highlight={product.returnAvailable} />
                <InfoRow label="Return Days" value={product.returnDays ? `${product.returnDays} days` : 'N/A'} />
                <InfoRow label="Replacement Available" value={product.replacementAvailable ? 'Yes' : 'No'} highlight={product.replacementAvailable} />
                <InfoRow label="Warranty Available" value={product.warrantyAvailable ? 'Yes' : 'No'} highlight={product.warrantyAvailable} />
                <InfoRow label="Warranty Period" value={product.warrantyPeriod || 'N/A'} />
                <InfoRow label="Warranty Type" value={product.warrantyType || 'N/A'} />
              </InfoCard>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {product.images?.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="bg-gray-100 rounded-xl overflow-hidden h-80 flex items-center justify-center">
                    <img
                      src={product.images[activeImageIndex]}
                      alt={`Product ${activeImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                          activeImageIndex === idx 
                            ? 'border-blue-500 shadow-lg' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-sm text-gray-500">
                    {product.images.length} image{product.images.length > 1 ? 's' : ''} uploaded
                  </p>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No images uploaded</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer - Action Buttons */}
        <div className="bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Product ID: <span className="font-mono">{product._id}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Close
            </button>
            
            {product.status === 'pending' && (
              <>
                <button
                  onClick={() => onReject(product)}
                  className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
                
                <button
                  onClick={() => onApprove(product)}
                  className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Info Card Component
const InfoCard = ({ title, children }) => (
  <div className="bg-gray-50 rounded-xl p-4 border">
    <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">{title}</h4>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

// Info Row Component
const InfoRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-sm font-medium ${
      highlight ? 'text-green-600' : 'text-gray-800'
    }`}>
      {value || <span className="text-gray-300">N/A</span>}
    </span>
  </div>
);

// Vendor Block Component
const VendorBlock = ({ vendor, products, onViewProduct, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Vendor Header */}
      <div 
        className="bg-gradient-to-r from-gray-50 to-white p-4 border-b cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {vendor?.name?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{vendor?.name || 'Unknown Vendor'}</h3>
              <p className="text-sm text-gray-500">{vendor?.email || 'No email'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              {products.length} Pending
            </span>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Products List */}
      {expanded && (
        <div className="p-4 space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition group"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div 
                  className="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 border cursor-pointer group-hover:shadow-md transition"
                  onClick={() => onViewProduct(product)}
                >
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 
                        className="font-semibold text-gray-800 truncate cursor-pointer hover:text-blue-600 transition"
                        onClick={() => onViewProduct(product)}
                      >
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {product.category?.parent?.name ? `${product.category.parent.name} / ` : ''}
                        {product.category?.name || 'No Category'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(product.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>

                  {/* Price & Stock */}
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <span className="text-lg font-bold text-green-600">₹{product.sellingPrice || product.price || 0}</span>
                      {product.mrp && product.mrp !== product.sellingPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">₹{product.mrp}</span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600">
                      Stock: {product.totalStock || 0}
                    </span>
                    {product.brandName && (
                      <span className="text-xs px-2 py-1 bg-blue-100 rounded-full text-blue-600">
                        {product.brandName}
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  {product.shortDescription && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}

                  {/* Rejection Reason */}
                  {product.rejectionReason && product.status === 'rejected' && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs text-red-600">
                        <span className="font-semibold">Rejection Reason:</span> {product.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => onViewProduct(product)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    
                    <button
                      onClick={() => onApprove(product)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    
                    <button
                      onClick={() => onReject(product)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Admin Approvals Component
export default function AdminApprovals() {
  const { auth } = useAuth();
  const token = auth.token;

  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchGrouped = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/api/admin/pending-products-grouped', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrouped(res.data.grouped || []);
      
      // Calculate stats
      const allProducts = (res.data.grouped || []).flatMap(g => g.products);
      setStats({
        pending: allProducts.length,
        approved: 0,
        rejected: 0
      });
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

  const handleViewProduct = (product) => {
    setViewingProduct(product);
  };

  const handleApprove = async (product) => {
    const confirmed = window.confirm(`Are you sure you want to approve "${product.name}"?`);
    if (!confirmed) return;
    
    try {
      setSubmitting(true);
      await axiosClient.post(
        `/api/admin/products/${product._id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViewingProduct(null);
      fetchGrouped();
      // Show success toast or message
    } catch (err) {
      console.error('approve error', err);
      alert(err.response?.data?.message || 'Failed to approve product');
    } finally {
      setSubmitting(false);
    }
  };

  const startReject = (product) => {
    setRejecting(product);
    setReason('');
    setViewingProduct(null);
  };

  const submitReject = async () => {
    if (!rejecting) return;
    if (!reason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    
    try {
      setSubmitting(true);
      await axiosClient.post(
        `/api/admin/products/${rejecting._id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejecting(null);
      setReason('');
      fetchGrouped();
    } catch (err) {
      console.error('reject error', err);
      alert(err.response?.data?.message || 'Failed to reject product');
    } finally {
      setSubmitting(false);
    }
  };

  // Total pending products
  const totalPending = grouped.reduce((sum, g) => sum + g.products.length, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  📋
                </span>
                Product Approvals
              </h1>
              <p className="text-gray-500 mt-1">Review and approve vendor products</p>
            </div>

            <button
              onClick={fetchGrouped}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{totalPending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vendors</p>
                <p className="text-3xl font-bold text-blue-600">{grouped.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg per Vendor</p>
                <p className="text-3xl font-bold text-purple-600">
                  {grouped.length > 0 ? Math.round(totalPending / grouped.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-bold text-green-600">
                  {totalPending > 0 ? 'Action Required' : 'All Clear'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">{totalPending > 0 ? '🔔' : '✅'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500">Loading pending approvals...</p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">All Caught Up!</h2>
            <p className="text-gray-500">No pending products to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {grouped.map((g) => (
              <VendorBlock
                key={g.vendor?._id || 'unknown-' + Math.random()}
                vendor={g.vendor}
                products={g.products}
                onViewProduct={handleViewProduct}
                onApprove={handleApprove}
                onReject={startReject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onApprove={handleApprove}
          onReject={startReject}
        />
      )}

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-modal-in overflow-hidden">
            {/* Header */}
            <div className="bg-red-500 px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Reject Product</h3>
                <p className="text-red-100 text-sm">This action cannot be undone</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {rejecting.images?.[0] ? (
                    <img src={rejecting.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{rejecting.name}</p>
                  <p className="text-sm text-gray-500">by {rejecting.vendor?.name || 'Unknown Vendor'}</p>
                </div>
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for rejection (will be visible to vendor)..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This reason will be shown to the vendor so they can fix the issue...
                </p>
              </div>

              {/* Quick Reasons */}
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Incomplete product details',
                    'Low quality images',
                    'Incorrect pricing',
                    'Policy violation',
                    'Duplicate product',
                  ].map((quickReason) => (
                    <button
                      key={quickReason}
                      type="button"
                      onClick={() => setReason(quickReason)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejecting(null);
                  setReason('');
                }}
                disabled={submitting}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={submitting || !reason.trim()}
                className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out; 
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
}