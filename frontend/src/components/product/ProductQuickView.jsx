// src/components/product/ProductQuickView.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const ProductQuickView = ({
  product,
  isOpen,
  onClose,
  onEdit,    // optional: parent se aayega
  onDelete,  // optional: parent se aayega
}) => {
  const { auth } = useAuth();
  const user = auth.user;
  const role = user?.role;
  const navigate = useNavigate();

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!isOpen || !product) return null;

  const mainImage = product.images?.[0] || '/placeholder.png';
  const otherImages = (product.images || []).slice(1);

  const price = product.finalPrice || product.sellingPrice;
  const mrp = product.mrp;
  const hasDiscount = mrp && price && mrp > price;
  const discountPercent =
    hasDiscount && mrp
      ? Math.round(((mrp - price) / mrp) * 100)
      : null;

  const isOwnVendorProduct =
    role === 'vendor' &&
    product.vendor &&
    (product.vendor._id === user?._id || product.vendor === user?._id);

  const isAdmin = role === 'admin';

  const showUserActions = role === 'user' || !role;
  const showOwnerActions = isAdmin || isOwnVendorProduct;

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setActionLoading(true);
      setActionError('');
      // 🔥 apne actual add-to-cart route ke hisaab se adjust karo
      await axiosClient.post('/api/cart/add', {
        productId: product._id,
        quantity: 1,
      });
      alert('Added to cart');
    } catch (err) {
      console.error('Add to cart error:', err);
      setActionError(
        err.response?.data?.message || 'Failed to add to cart'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setActionLoading(true);
      setActionError('');
      // 🔥 apne wishlist route ke hisaab se adjust karo
      await axiosClient.post('/api/wishlist', {
        productId: product._id,
      });
      alert('Added to wishlist');
    } catch (err) {
      console.error('Add to wishlist error:', err);
      setActionError(
        err.response?.data?.message || 'Failed to add to wishlist'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setActionLoading(true);
      setActionError('');
      // Simple approach: add to cart and redirect to cart
      await axiosClient.post('/api/cart/add', {
        productId: product._id,
        quantity: 1,
      });
      onClose?.();
      navigate('/cart');
    } catch (err) {
      console.error('Buy now error:', err);
      setActionError(
        err.response?.data?.message || 'Failed to start checkout'
      );
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
    // default: navigate to edit page based on role
    if (isAdmin) {
      navigate(`/admin/products/${product._id}/edit`);
    } else if (isOwnVendorProduct) {
      navigate(`/vendor/products/${product._id}/edit`);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(product._id);
      onClose?.();
      return;
    }
    // default simple confirm + API call (optional)
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    (async () => {
      try {
        setActionLoading(true);
        setActionError('');
        if (isAdmin) {
          await axiosClient.delete(`/api/admin/products/${product._id}`);
        } else if (isOwnVendorProduct) {
          await axiosClient.delete(`/api/products/${product._id}`);
        }
        alert('Product deleted');
        onClose?.();
        // parent ko list reload karwana hoga
      } catch (err) {
        console.error('Delete product error:', err);
        setActionError(
          err.response?.data?.message || 'Failed to delete product'
        );
      } finally {
        setActionLoading(false);
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Backdrop click closes */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT: images */}
        <div className="w-full md:w-1/2 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={mainImage}
              alt={product.name}
              className="max-h-[320px] w-full object-contain"
            />
          </div>
          {otherImages.length > 0 && (
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
              {otherImages.map((img, idx) => (
                <div
                  key={idx}
                  className="h-14 w-14 rounded-md overflow-hidden bg-white border border-slate-200 flex-shrink-0"
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: details */}
        <div className="w-full md:w-1/2 flex flex-col p-4 md:p-5">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full bg-white/90 border border-slate-200 w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 text-sm"
          >
            ✕
          </button>

          {/* Title & Vendor */}
          <div className="mb-2">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 line-clamp-2">
              {product.name}
            </h2>
            {product.vendor?.name && (
              <p className="text-xs text-slate-500 mt-0.5">
                Sold by{' '}
                <span className="font-medium text-slate-700">
                  {product.vendor.name}
                </span>
              </p>
            )}
          </div>

          {/* Price block */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-slate-900">
                ₹{price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    ₹{mrp}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {discountPercent}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Inclusive of all taxes
            </p>
          </div>

          {/* Short highlights */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase mb-1">
              Highlights
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• 100% genuine product</li>
              <li>• Free delivery on orders above ₹499</li>
              <li>• 7 days replacement / return policy</li>
              <li>• Cash on Delivery available</li>
            </ul>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-slate-700 uppercase mb-1">
                Description
              </h3>
              <p className="text-xs md:text-sm text-slate-600 max-h-[120px] overflow-y-auto whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Extra meta (category/brand/stock) */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-3">
            {product.category?.name && (
              <div>
                <span className="block text-slate-400">Category</span>
                <span className="font-medium">{product.category.name}</span>
              </div>
            )}
            {product.brand && (
              <div>
                <span className="block text-slate-400">Brand</span>
                <span className="font-medium">{product.brand}</span>
              </div>
            )}
            {product.stock != null && (
              <div>
                <span className="block text-slate-400">Stock</span>
                <span className="font-medium">
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            )}
            {product.createdAt && (
              <div>
                <span className="block text-slate-400">Added on</span>
                <span className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {actionError && (
            <div className="mb-2 text-[11px] text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded">
              {actionError}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="mt-auto pt-2 space-y-2">
            {/* User actions */}
            {showUserActions && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  disabled={actionLoading}
                  onClick={handleAddToCart}
                  className="flex-1 px-3 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm font-semibold disabled:opacity-60"
                >
                  Add to Cart
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleBuyNow}
                  className="flex-1 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-semibold disabled:opacity-60"
                >
                  Buy Now
                </button>
              </div>
            )}

            {showUserActions && (
              <button
                disabled={actionLoading}
                onClick={handleAddToWishlist}
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-700 text-xs md:text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
              >
                Add to Wishlist
              </button>
            )}

            {/* Vendor/Admin actions */}
            {showOwnerActions && (
              <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="flex-1 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-semibold"
                >
                  Edit Product
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleDeleteClick}
                  className="flex-1 px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm font-semibold disabled:opacity-60"
                >
                  Delete Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;