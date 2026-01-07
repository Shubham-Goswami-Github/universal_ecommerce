// src/components/product/ProductQuickView.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const ProductQuickView = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const { auth } = useAuth();
  const user = auth.user;
  const role = user?.role; // 'user' | 'vendor' | 'admin' | undefined
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setActiveTab('overview');
      setQuantity(product.minPurchaseQty || 1);
      setActionError('');
      setActionSuccess('');
    }
  }, [product?._id]);

  // Auto hide messages
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess('');
        setActionError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  if (!isOpen || !product) return null;

  // ============ ROLE CHECKS ============
  const isUser = role === 'user' || !role;
  const isVendor = role === 'vendor';
  const isAdmin = role === 'admin';
  
  const isOwnVendorProduct =
    isVendor &&
    product.vendor &&
    (product.vendor._id === user?._id || product.vendor === user?._id);

  const showAdvancedDetails = isAdmin || isVendor;
  const showUserActions = isUser;
  const showOwnerActions = isAdmin || isOwnVendorProduct;

  // ============ PRODUCT DATA ============
  const images = product.images?.length > 0 ? product.images : ['/placeholder.png'];
  const mainImage = images[activeImage] || images[0];

  const finalPrice = product.finalPrice || product.sellingPrice || product.price || 0;
  const mrp = product.mrp || 0;
  const hasDiscount = mrp && finalPrice && mrp > finalPrice;
  const discountPercent = hasDiscount ? Math.round(((mrp - finalPrice) / mrp) * 100) : null;

  const stockAvailable = product.totalStock > 0 || product.allowBackorders;
  const isOutOfStock = product.availabilityStatus === 'out_of_stock' || (!stockAvailable && !product.allowBackorders);
  const isComingSoon = product.availabilityStatus === 'coming_soon';
  const isLowStock = product.totalStock > 0 && product.totalStock <= (product.lowStockAlertQty || 5);

  // ============ HANDLERS ============
  const showMessage = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setActionSuccess('');
    } else {
      setActionSuccess(msg);
      setActionError('');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      onClose?.();
      return;
    }
    try {
      setActionLoading(true);
      await axiosClient.post('/api/cart/add', {
        productId: product._id,
        quantity: quantity,
      });
      showMessage('✓ Added to cart successfully!');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to add to cart', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/login');
      onClose?.();
      return;
    }
    try {
      setActionLoading(true);
      await axiosClient.post('/api/wishlist/add', { productId: product._id });
      setIsWishlisted(true);
      showMessage('♥ Added to wishlist!');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to add to wishlist', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      onClose?.();
      return;
    }
    try {
      setActionLoading(true);
      await axiosClient.post('/api/cart/add', {
        productId: product._id,
        quantity: quantity,
      });
      onClose?.();
      navigate('/cart');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to proceed', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(product);
      onClose?.();
      return;
    }
    if (isAdmin) {
      navigate(`/admin/products/${product._id}/edit`);
    } else if (isOwnVendorProduct) {
      navigate(`/vendor/products/${product._id}/edit`);
    }
    onClose?.();
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    if (onDelete) {
      onDelete(product._id);
      onClose?.();
      return;
    }

    try {
      setActionLoading(true);
      if (isAdmin) {
        await axiosClient.delete(`/api/admin/products/${product._id}`);
      } else if (isOwnVendorProduct) {
        await axiosClient.delete(`/api/products/${product._id}`);
      }
      showMessage('Product deleted successfully!');
      setTimeout(() => {
        onClose?.();
        onRefresh?.();
      }, 1000);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete product', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewFullDetails = () => {
    onClose?.();
    navigate(`/product/${product._id}`);
  };

  // ============ RENDER HELPERS ============
  const renderStars = (rating, size = 'sm') => {
    const sizeClasses = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderStatusBadge = () => {
    if (isComingSoon) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          Coming Soon
        </span>
      );
    }
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          Out of Stock
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
          Only {product.totalStock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        In Stock
      </span>
    );
  };

  // ============ TAB CONTENT RENDERERS ============
  const renderOverviewTab = () => (
    <div className="space-y-4">
      {/* Short Description */}
      {product.shortDescription && (
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">{product.shortDescription}</p>
        </div>
      )}

      {/* Key Features */}
      {product.keyFeatures?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Key Features
          </h4>
          <ul className="space-y-1.5">
            {product.keyFeatures.slice(0, 4).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-2">
        {product.returnAvailable && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800">{product.returnDays} Days Return</p>
            </div>
          </div>
        )}
        {product.warrantyAvailable && (
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800">{product.warrantyPeriod} Warranty</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">100% Genuine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">COD Available</p>
          </div>
        </div>
      </div>

      {/* Category Badge */}
      {product.category?.name && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Category:</span>
          <div className="flex items-center gap-1">
            {product.category.parent?.name && (
              <>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {product.category.parent.name}
                </span>
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
              {product.category.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // ============ ADMIN/VENDOR ONLY: Specifications Tab ============
  const renderSpecificationsTab = () => (
    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
      {/* Basic Information */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          Basic Information
        </h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-200">
              <SpecRow label="Product Name" value={product.name} />
              <SpecRow label="Short Title" value={product.shortTitle} />
              <SpecRow label="Brand" value={product.brandName} />
              <SpecRow label="SKU" value={product.sku} mono />
              <SpecRow label="Product Code" value={product.productCode} mono />
              <SpecRow label="Product Type" value={product.productType} capitalize />
              <SpecRow label="HSN Code" value={product.hsnCode} />
              <SpecRow label="Country of Origin" value={product.countryOfOrigin} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Details */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          Pricing Details
        </h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-200">
              <SpecRow label="MRP" value={product.mrp ? `₹${product.mrp}` : null} />
              <SpecRow label="Selling Price" value={product.sellingPrice ? `₹${product.sellingPrice}` : null} />
              <SpecRow label="Final Price" value={`₹${finalPrice}`} highlight />
              <SpecRow label="Discount Type" value={product.discountType} capitalize />
              <SpecRow 
                label="Discount Value" 
                value={product.discountValue 
                  ? (product.discountType === 'percentage' ? `${product.discountValue}%` : `₹${product.discountValue}`)
                  : null
                } 
              />
              <SpecRow label="GST Applicable" value={product.gstApplicable ? 'Yes' : 'No'} />
              <SpecRow label="GST %" value={product.gstApplicable ? `${product.gstPercentage}%` : null} />
              <SpecRow label="Tax Type" value={product.taxInclusive ? 'Inclusive' : 'Exclusive'} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Information */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          Stock & Inventory
        </h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-200">
              <SpecRow label="Total Stock" value={product.totalStock} />
              <SpecRow label="Stock Status" value={product.stockStatus?.replace(/_/g, ' ')} capitalize />
              <SpecRow label="Availability" value={product.availabilityStatus?.replace(/_/g, ' ')} capitalize />
              <SpecRow label="Min Order Qty" value={product.minPurchaseQty} />
              <SpecRow label="Max Order Qty" value={product.maxPurchaseQty || 'No limit'} />
              <SpecRow label="Low Stock Alert" value={product.lowStockAlertQty} />
              <SpecRow label="Backorders" value={product.allowBackorders ? 'Allowed' : 'Not Allowed'} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales & Analytics */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          Sales & Analytics
        </h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-200">
              <SpecRow label="Total Sales" value={product.totalSales || 0} />
              <SpecRow label="Total Reviews" value={product.totalReviews || 0} />
              <SpecRow label="Average Rating" value={product.ratingAverage ? `${product.ratingAverage} ★` : 'No ratings'} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Returns & Warranty */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
          Returns & Warranty
        </h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-200">
              <SpecRow label="Return Available" value={product.returnAvailable ? 'Yes' : 'No'} />
              <SpecRow label="Return Period" value={product.returnAvailable ? `${product.returnDays} Days` : null} />
              <SpecRow label="Replacement" value={product.replacementAvailable ? 'Available' : 'Not Available'} />
              <SpecRow label="Warranty" value={product.warrantyAvailable ? 'Yes' : 'No'} />
              <SpecRow label="Warranty Period" value={product.warrantyPeriod} />
              <SpecRow label="Warranty Type" value={product.warrantyType} capitalize />
            </tbody>
          </table>
        </div>
      </div>

      {/* Timestamps */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
          Timestamps
        </h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-200">
              <SpecRow 
                label="Created At" 
                value={product.createdAt ? new Date(product.createdAt).toLocaleString('en-IN') : null} 
              />
              <SpecRow 
                label="Updated At" 
                value={product.updatedAt ? new Date(product.updatedAt).toLocaleString('en-IN') : null} 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ============ ADMIN/VENDOR ONLY: Description Tab ============
  const renderDescriptionTab = () => (
    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
      {product.shortDescription && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Short Description
          </h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{product.shortDescription}</p>
        </div>
      )}

      {product.fullDescription && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Full Description
          </h4>
          <div 
            className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.fullDescription }}
          />
        </div>
      )}

      {product.usageInstructions && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Usage Instructions
          </h4>
          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg whitespace-pre-line">
            {product.usageInstructions}
          </p>
        </div>
      )}

      {product.careInstructions && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Care Instructions
          </h4>
          <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg whitespace-pre-line">
            {product.careInstructions}
          </p>
        </div>
      )}

      {product.boxContents && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            What's in the Box
          </h4>
          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg whitespace-pre-line">
            {product.boxContents}
          </p>
        </div>
      )}

      {product.keyFeatures?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            All Key Features
          </h4>
          <ul className="space-y-1 bg-blue-50 p-3 rounded-lg">
            {product.keyFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {idx + 1}
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!product.shortDescription && !product.fullDescription && !product.keyFeatures?.length && (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No description available</p>
        </div>
      )}
    </div>
  );

  // ============ MAIN RENDER ============
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 hover:bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* LEFT: Image Gallery */}
          <div className="w-full md:w-2/5 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Main Image */}
            <div className="relative flex-1 flex items-center justify-center p-4 min-h-[280px] md:min-h-[400px]">
              <img
                src={mainImage}
                alt={product.name}
                className="max-h-[260px] md:max-h-[350px] w-full object-contain"
              />

              {/* Discount Badge */}
              {discountPercent && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                  {discountPercent}% OFF
                </div>
              )}

              {/* Wishlist Button - Only for users */}
              {showUserActions && (
                <button
                  onClick={handleAddToWishlist}
                  disabled={actionLoading}
                  className={`absolute top-3 right-12 md:right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition ${
                    isWishlisted 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-600 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs">
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-gray-200 bg-white">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === idx 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details */}
          <div className="w-full md:w-3/5 flex flex-col max-h-[90vh] md:max-h-none">
            {/* Header Section */}
            <div className="p-4 md:p-5 border-b border-gray-100">
              {/* Role Badge - Admin/Vendor only */}
              {showAdvancedDetails && (
                <div className="flex items-center gap-2 mb-2">
                  {isAdmin && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">
                      Admin View
                    </span>
                  )}
                  {isOwnVendorProduct && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                      Your Product
                    </span>
                  )}
                  {product.isActive === false && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                      Inactive
                    </span>
                  )}
                </div>
              )}

              {/* Brand */}
              {product.brandName && (
                <Link 
                  to={`/brand/${product.brandName}`}
                  onClick={onClose}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  {product.brandName}
                </Link>
              )}

              {/* Product Name */}
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight line-clamp-2 mt-0.5">
                {product.name}
              </h2>

              {/* Short Title */}
              {product.shortTitle && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{product.shortTitle}</p>
              )}

              {/* Rating & Status */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {product.ratingAverage > 0 || product.totalReviews > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                      <span>{product.ratingAverage?.toFixed(1) || '0.0'}</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.totalReviews || 0} reviews)
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No reviews yet</span>
                )}
                {renderStatusBadge()}
              </div>

              {/* Price Block */}
              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-gray-900">₹{finalPrice}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-base text-gray-400 line-through">₹{mrp}</span>
                      <span className="text-sm font-bold text-green-600">{discountPercent}% off</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {product.taxInclusive ? 'Inclusive of all taxes' : 'Exclusive of taxes'}
                  {product.gstApplicable && showAdvancedDetails && ` • GST ${product.gstPercentage}%`}
                </p>
              </div>

              {/* Vendor Info - Admin/Vendor only */}
              {showAdvancedDetails && product.vendor?.name && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Sold by:</span>
                  <span className="font-medium text-gray-700">{product.vendor.name}</span>
                  {product.vendor.isVerified && (
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tabs - Different for User vs Admin/Vendor */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                    activeTab === 'overview'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                
                {/* Admin/Vendor only tabs */}
                {showAdvancedDetails && (
                  <>
                    <button
                      onClick={() => setActiveTab('specifications')}
                      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                        activeTab === 'specifications'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab('description')}
                      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                        activeTab === 'description'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Description
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'specifications' && showAdvancedDetails && renderSpecificationsTab()}
              {activeTab === 'description' && showAdvancedDetails && renderDescriptionTab()}
            </div>

            {/* Messages */}
            {(actionError || actionSuccess) && (
              <div className={`mx-4 mb-2 px-3 py-2 rounded-lg text-sm font-medium ${
                actionError 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {actionError || actionSuccess}
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
              {/* Quantity Selector - User only & in stock */}
              {showUserActions && !isOutOfStock && !isComingSoon && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">Qty:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(product.minPurchaseQty || 1, quantity - 1))}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition text-gray-700 font-bold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={product.minPurchaseQty || 1}
                      max={product.maxPurchaseQty || product.totalStock || 99}
                      value={quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 1;
                        const min = product.minPurchaseQty || 1;
                        const max = product.maxPurchaseQty || product.totalStock || 99;
                        setQuantity(Math.min(max, Math.max(min, val)));
                      }}
                      className="w-12 text-center py-1.5 font-semibold text-sm border-none outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.maxPurchaseQty || product.totalStock || 99, quantity + 1))}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 transition text-gray-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    (Max: {product.maxPurchaseQty || product.totalStock || '∞'})
                  </span>
                </div>
              )}

              {/* User Actions */}
              {showUserActions && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={actionLoading || isOutOfStock || isComingSoon}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition shadow-md shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={actionLoading || isOutOfStock || isComingSoon}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Buy Now
                  </button>
                </div>
              )}

              {/* Admin/Vendor Actions */}
              {showOwnerActions && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={handleEditClick}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Product
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* View Full Details Button */}
              <button
                onClick={handleViewFullDetails}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition border border-blue-200"
              >
                View Full Details →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};

// ============ SPECIFICATION ROW COMPONENT ============
const SpecRow = ({ label, value, highlight = false, capitalize = false, mono = false }) => {
  if (value === null || value === undefined || value === '') return null;
  
  return (
    <tr className="hover:bg-gray-100/50 transition">
      <td className="px-3 py-2 text-gray-500 font-medium bg-gray-100/70 w-32 whitespace-nowrap">
        {label}
      </td>
      <td className={`px-3 py-2 ${highlight ? 'text-green-600 font-bold' : 'text-gray-800'} ${capitalize ? 'capitalize' : ''} ${mono ? 'font-mono text-xs' : ''}`}>
        {String(value)}
      </td>
    </tr>
  );
};

export default ProductQuickView;