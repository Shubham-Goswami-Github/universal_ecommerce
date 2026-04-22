// src/pages/ProductDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

/* ─────────────────────────────────────────────────────────────
   STAR RATING COMPONENT (Matching Home.jsx)
───────────────────────────────────────────────────────────── */
const StarRating = ({ rating = 0, size = 'sm', interactive = false, onChange }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <svg
            className={`${sizeClasses[size]} ${star <= rating ? 'text-amber-400' : 'text-gray-300'} transition-colors`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   PRODUCT DETAILS
───────────────────────────────────────────────────────────── */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  // Zoom Modal State
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/api/products/${id}`);
      setProduct(res.data.product || res.data);
      setActiveImage(0);
      showMessage(result?.message || 'Wishlist updated', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await axiosClient.get(`/api/reviews/product/${id}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  // Auto hide message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
  };

  const addToCart = async () => {
    if (!auth.user) {
      showMessage('Please login to add items to cart', 'error');
      return;
    }
    
    setAddingToCart(true);
    try {
      await axiosClient.post('/api/cart/add', {
        productId: id,
        quantity: qty,
      });
      showMessage('Added to cart successfully! 🛒', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    if (!auth.user) {
      showMessage('Please login to continue', 'error');
      return;
    }
    
    try {
      await axiosClient.post('/api/cart/add', {
        productId: id,
        quantity: qty,
      });
      navigate('/cart');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to proceed', 'error');
    }
  };

  const addToWishlist = async () => {
    if (!auth.user) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    if (auth.user.role !== 'user') {
      showMessage('Wishlist is available for customers only', 'error');
      return;
    }
    
    setAddingToWishlist(true);
    try {
      const result = await toggleWishlist(id);
      showMessage(result?.message || 'Wishlist updated', 'success');
      showMessage('Added to wishlist! ❤️', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to add to wishlist', 'error');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      showMessage('Please write a review comment', 'error');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await axiosClient.post('/api/reviews', {
        productId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: 5, comment: '' });
      await loadReviews();
      await loadProduct();
      showMessage('Review submitted successfully! ⭐', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Zoom Modal Handlers
  const openZoomModal = () => {
    setShowZoomModal(true);
    setZoomLevel(1);
    setZoomPosition({ x: 50, y: 50 });
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));

  const handleZoomMouseMove = (e) => {
    if (zoomLevel > 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    }
  };

  // Calculate review statistics
  const reviewStats = {
    average: product?.ratingAverage || (reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : 0),
    total: product?.totalReviews || reviews.length,
    distribution: [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      percentage: reviews.length > 0 
        ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
        : 0
    }))
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm p-6 dark:bg-slate-900">
              <div className="animate-pulse">
                <div className="h-[400px] bg-gray-200 rounded-xl mb-4"></div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Info Skeleton */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm p-6 dark:bg-slate-900">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/3"></div>
                  <div className="h-12 bg-gray-200 rounded-xl w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                  <div className="flex gap-4 mt-6">
                    <div className="h-14 bg-gray-200 rounded-xl flex-1"></div>
                    <div className="h-14 bg-gray-200 rounded-xl flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product Not Found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Product Not Found</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate discount
  const calculateDiscount = () => {
    if (product.discountType && product.discountValue) {
      if (product.discountType === 'percentage') return `${product.discountValue}%`;
      else if (product.discountType === 'flat') return `₹${product.discountValue}`;
    }
    if (product.mrp && product.sellingPrice && product.mrp > product.sellingPrice) {
      return `${Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}%`;
    }
    return null;
  };

  const discountDisplay = calculateDiscount();
  const finalPrice = product.finalPrice || product.sellingPrice || product.price;
  const wishlistActive = isWishlisted(id);
  const canUseWishlist = !auth.user || auth.user.role === 'user';

  return (
    <div className="product-details-page min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 lg:pb-8">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg animate-slide-down flex items-center gap-2 ${
          messageType === 'success' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {messageType === 'success' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Zoom Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setShowZoomModal(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 z-10">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-white font-semibold min-w-[60px] text-center text-sm">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Thumbnail Navigation */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === idx ? 'border-white shadow-lg scale-110' : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Zoom Image */}
          <div 
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
            onMouseMove={handleZoomMouseMove}
          >
            <img
              src={product.images?.[activeImage] || 'https://via.placeholder.com/800x800?text=No+Image'}
              alt={product.name}
              className="max-w-none transition-transform duration-100"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              }}
            />
          </div>

          {/* Navigation Arrows */}
          {product.images?.length > 1 && (
            <>
              <button
                onClick={() => setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                className="absolute left-24 top-1/2 transform -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setActiveImage((prev) => (prev + 1) % product.images.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-gray-500 hover:text-emerald-600 transition-colors">Home</Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {product.category?.parent?.name && (
              <>
                <Link to={`/category/${product.category.parent._id}`} className="text-gray-500 hover:text-emerald-600 transition-colors">
                  {product.category.parent.name}
                </Link>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            {product.category?.name && (
              <>
                <Link to={`/category/${product.category._id}`} className="text-gray-500 hover:text-emerald-600 transition-colors">
                  {product.category.name}
                </Link>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT SECTION - Images
          ═══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              {/* Main Image */}
              <div className="relative w-full h-[380px] sm:h-[450px] bg-gray-50 rounded-xl overflow-hidden group">
                <img
                  src={product.images?.length ? product.images[activeImage] : 'https://via.placeholder.com/600x600?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Discount Badge */}
                {discountDisplay && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
                    -{discountDisplay}
                  </div>
                )}

                {/* Coming Soon Badge */}
                {product.availabilityStatus === 'coming_soon' && (
                  <div className="absolute top-3 left-3 bg-violet-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
                    Coming Soon
                  </div>
                )}

                {/* Wishlist Button */}
                {canUseWishlist && (
                  <button
                    onClick={addToWishlist}
                    disabled={addingToWishlist}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 ${
                      wishlistActive
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-500 hover:text-red-500'
                    }`}
                  >
                    {addingToWishlist ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                    ) : (
                      <svg className="w-5 h-5" fill={wishlistActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Zoom Button */}
                <button
                  onClick={openZoomModal}
                  className="absolute bottom-3 right-3 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>

                {/* Image Counter */}
                {product.images?.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-gray-900/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {activeImage + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        activeImage === idx 
                          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100' 
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Mobile Action Buttons */}
              <div className={`lg:hidden grid gap-3 mt-5 ${canUseWishlist ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <button
                  onClick={addToCart}
                  disabled={addingToCart || product.totalStock === 0 || product.availabilityStatus === 'out_of_stock'}
                  className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                {canUseWishlist && (
                  <button
                    onClick={addToWishlist}
                    disabled={addingToWishlist}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-colors border ${
                      wishlistActive
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={wishlistActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {wishlistActive ? 'Saved' : 'Wishlist'}
                  </button>
                )}
                <button
                  onClick={buyNow}
                  disabled={product.totalStock === 0 || product.availabilityStatus === 'out_of_stock'}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT SECTION - Product Info
          ═══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* Main Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Brand */}
              {product.brandName && (
                <Link 
                  to={`/brand/${product.brandName}`} 
                  className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3 hover:bg-emerald-100 transition-colors"
                >
                  {product.brandName}
                </Link>
              )}
              
              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.shortTitle && (
                <p className="text-gray-500 text-sm mt-1">{product.shortTitle}</p>
              )}

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(Number(reviewStats.average))} size="sm" />
                  {reviewStats.total > 0 ? (
                    <span className="text-sm text-gray-500">
                      {reviewStats.average} ({reviewStats.total} reviews)
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">No reviews yet</span>
                  )}
                </div>
                {product.totalSales > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {product.totalSales} sold
                  </span>
                )}
              </div>

              {/* Price Section */}
              <div className="mt-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-extrabold text-gray-900">₹{finalPrice?.toLocaleString()}</span>
                  {product.mrp && product.mrp > finalPrice && (
                    <span className="text-lg text-gray-400 line-through">₹{product.mrp?.toLocaleString()}</span>
                  )}
                  {discountDisplay && (
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {discountDisplay} OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {product.taxInclusive ? '✓ Inclusive of all taxes' : 'Exclusive of taxes'}
                  {product.gstApplicable && ` • GST ${product.gstPercentage}%`}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mt-5">
                {product.availabilityStatus === 'available' && product.totalStock > 0 ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-emerald-600 font-semibold text-sm">In Stock</span>
                    </span>
                    {product.totalStock <= product.lowStockAlertQty && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        ⚡ Only {product.totalStock} left!
                      </span>
                    )}
                  </div>
                ) : product.availabilityStatus === 'coming_soon' ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-violet-500 rounded-full"></span>
                    <span className="text-violet-600 font-semibold text-sm">Coming Soon</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
                    {product.allowBackorders && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Backorder Available</span>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {(product.totalStock > 0 || product.allowBackorders) && product.availabilityStatus !== 'coming_soon' && (
                <div className="mt-5 flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(product.minPurchaseQty || 1, qty - 1))}
                      className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition font-bold text-gray-600"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={product.minPurchaseQty || 1}
                      max={product.maxPurchaseQty || product.totalStock}
                      value={qty}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 1;
                        const min = product.minPurchaseQty || 1;
                        const max = product.maxPurchaseQty || product.totalStock;
                        setQty(Math.min(max, Math.max(min, val)));
                      }}
                      className="w-14 text-center py-2.5 font-semibold text-gray-900 border-none outline-none"
                    />
                    <button
                      onClick={() => setQty(Math.min(product.maxPurchaseQty || product.totalStock, qty + 1))}
                      className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition font-bold text-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    Min: {product.minPurchaseQty || 1} | Max: {product.maxPurchaseQty || 'No limit'}
                  </span>
                </div>
              )}

              {/* Desktop Action Buttons */}
              <div className={`hidden lg:grid gap-4 mt-6 ${canUseWishlist ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <button
                  onClick={addToCart}
                  disabled={addingToCart || (product.totalStock === 0 && !product.allowBackorders) || product.availabilityStatus === 'coming_soon'}
                  className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                {canUseWishlist && (
                  <button
                    onClick={addToWishlist}
                    disabled={addingToWishlist}
                    className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all border ${
                      wishlistActive
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    {addingToWishlist ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill={wishlistActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {wishlistActive ? 'Remove Wishlist' : 'Add Wishlist'}
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={buyNow}
                  disabled={(product.totalStock === 0 && !product.allowBackorders) || product.availabilityStatus === 'coming_soon'}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </button>
              </div>

              {/* Key Features */}
              {product.keyFeatures?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <span className="text-lg">✨</span> Key Features
                  </h3>
                  <ul className="space-y-2">
                    {product.keyFeatures.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Offers & Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <span className="text-lg">🎁</span> Available Offers
              </h3>
              <div className="grid gap-3">
                {[
                  { icon: '🚚', title: 'Free Delivery', desc: 'On orders above ₹499', color: 'emerald' },
                  { icon: '💵', title: 'Cash on Delivery', desc: 'Pay when you receive', color: 'sky' },
                  product.returnAvailable && { icon: '↩️', title: `${product.returnDays} Days Return`, desc: 'Easy return policy', color: 'amber' },
                  product.warrantyAvailable && { icon: '🛡️', title: `${product.warrantyPeriod} Warranty`, desc: `${product.warrantyType} warranty`, color: 'violet' },
                ].filter(Boolean).map((offer, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 bg-${offer.color}-50 rounded-xl border border-${offer.color}-100`}>
                    <span className="text-xl">{offer.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{offer.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{offer.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <span className="text-lg">📋</span> Product Details
              </h3>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    {[
                      product.brandName && { label: 'Brand', value: product.brandName },
                      product.productCode && { label: 'Product Code', value: product.productCode, mono: true },
                      product.productType && { label: 'Type', value: product.productType, capitalize: true },
                      product.countryOfOrigin && { label: 'Country of Origin', value: product.countryOfOrigin },
                      product.hsnCode && { label: 'HSN Code', value: product.hsnCode },
                      product.category && { 
                        label: 'Category', 
                        value: (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {product.category.parent?.name && (
                              <>
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">
                                  {product.category.parent.name}
                                </span>
                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </>
                            )}
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                              {product.category.name}
                            </span>
                          </div>
                        )
                      },
                    ].filter(Boolean).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-100 transition">
                        <td className="px-4 py-3 text-gray-500 font-medium bg-gray-100/50 w-36">{row.label}</td>
                        <td className={`px-4 py-3 text-gray-800 ${row.mono ? 'font-mono text-xs' : ''} ${row.capitalize ? 'capitalize' : ''}`}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Seller Info */}
            {product.vendor && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <span className="text-lg">🏪</span> Seller Information
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {product.vendor.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{product.vendor.name || 'Official Store'}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Seller
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 border-2 border-emerald-200 text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition">
                    View Store
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TABS SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {[
              { key: 'description', label: 'Description', icon: '📝' },
              { key: 'specifications', label: 'Specifications', icon: '📊' },
              { key: 'reviews', label: `Reviews (${reviews.length})`, icon: '⭐' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* ─── Description Tab ─── */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                {product.shortDescription && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Overview</h3>
                    <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
                  </div>
                )}

                {product.fullDescription && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Product Description</h3>
                    <div 
                      className="text-gray-600 leading-relaxed prose prose-emerald max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                    />
                  </div>
                )}

                {product.keyFeatures?.length > 0 && (
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      ✨ Key Features
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {product.keyFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.usageInstructions && (
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      📖 Usage Instructions
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{product.usageInstructions}</p>
                  </div>
                )}

                {product.careInstructions && (
                  <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      🧹 Care Instructions
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{product.careInstructions}</p>
                  </div>
                )}

                {product.boxContents && (
                  <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      📦 What's in the Box
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{product.boxContents}</p>
                  </div>
                )}

                {!product.shortDescription && !product.fullDescription && !product.keyFeatures?.length && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No description available for this product.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Specifications Tab ─── */}
            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <SpecSection title="General Information">
                  <SpecRow label="Product Name" value={product.name} />
                  <SpecRow label="Short Title" value={product.shortTitle} />
                  <SpecRow label="Brand" value={product.brandName} />
                  <SpecRow label="SKU" value={product.sku} mono />
                  <SpecRow label="Product Code" value={product.productCode} mono />
                  <SpecRow label="Product Type" value={product.productType} capitalize />
                  <SpecRow label="Category" value={
                    product.category?.parent?.name 
                      ? `${product.category.parent.name} → ${product.category.name}`
                      : product.category?.name
                  } />
                  <SpecRow label="Country of Origin" value={product.countryOfOrigin} />
                  <SpecRow label="HSN Code" value={product.hsnCode} />
                </SpecSection>

                <SpecSection title="Pricing Details">
                  <SpecRow label="MRP" value={product.mrp ? `₹${product.mrp}` : null} />
                  <SpecRow label="Selling Price" value={product.sellingPrice ? `₹${product.sellingPrice}` : null} />
                  <SpecRow label="Final Price" value={`₹${finalPrice}`} highlight />
                  <SpecRow label="Discount Type" value={product.discountType} capitalize />
                  <SpecRow label="Discount Value" value={
                    product.discountValue 
                      ? (product.discountType === 'percentage' ? `${product.discountValue}%` : `₹${product.discountValue}`)
                      : null
                  } />
                  <SpecRow label="GST Applicable" value={product.gstApplicable ? 'Yes' : 'No'} />
                  {product.gstApplicable && <SpecRow label="GST Percentage" value={`${product.gstPercentage}%`} />}
                  <SpecRow label="Tax Type" value={product.taxInclusive ? 'Inclusive' : 'Exclusive'} />
                </SpecSection>

                <SpecSection title="Stock & Availability">
                  <SpecRow label="Total Stock" value={product.totalStock} />
                  <SpecRow label="Stock Status" value={product.stockStatus?.replace('_', ' ')} capitalize />
                  <SpecRow label="Availability" value={product.availabilityStatus?.replace('_', ' ')} capitalize />
                  <SpecRow label="Min Purchase Qty" value={product.minPurchaseQty} />
                  <SpecRow label="Max Purchase Qty" value={product.maxPurchaseQty} />
                  <SpecRow label="Backorders" value={product.allowBackorders ? 'Allowed' : 'Not Allowed'} />
                </SpecSection>

                <SpecSection title="Returns & Warranty">
                  <SpecRow label="Return Available" value={product.returnAvailable ? 'Yes' : 'No'} />
                  {product.returnAvailable && <SpecRow label="Return Period" value={`${product.returnDays} Days`} />}
                  <SpecRow label="Replacement" value={product.replacementAvailable ? 'Available' : 'Not Available'} />
                  <SpecRow label="Warranty" value={product.warrantyAvailable ? 'Yes' : 'No'} />
                  {product.warrantyAvailable && (
                    <>
                      <SpecRow label="Warranty Period" value={product.warrantyPeriod} />
                      <SpecRow label="Warranty Type" value={product.warrantyType} capitalize />
                    </>
                  )}
                </SpecSection>
              </div>
            )}

            {/* ─── Reviews Tab ─── */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Statistics */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                    <div className="text-5xl font-extrabold text-gray-900 mb-2">
                      {reviewStats.average}
                    </div>
                    <div className="flex justify-center mb-2">
                      <StarRating rating={Math.round(Number(reviewStats.average))} size="lg" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Based on {reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="md:col-span-2 p-6 bg-gray-50 rounded-2xl">
                    <h4 className="font-bold text-gray-900 mb-4 text-sm">Rating Distribution</h4>
                    <div className="space-y-2.5">
                      {reviewStats.distribution.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-10 flex items-center gap-1">
                            {star} <span className="text-amber-400">★</span>
                          </span>
                          <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                star >= 4 ? 'bg-emerald-500' : star >= 3 ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Write Review Form */}
                {auth.user && auth.user.role === 'user' ? (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      ✍️ Write a Review
                    </h4>
                    
                    <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div className="flex items-center gap-3">
                          <StarRating 
                            rating={reviewForm.rating} 
                            size="xl" 
                            interactive 
                            onChange={(rating) => setReviewForm((f) => ({ ...f, rating }))}
                          />
                          <span className="text-gray-600 font-medium text-sm">
                            {reviewForm.rating} star{reviewForm.rating > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                        <textarea
                          rows={4}
                          placeholder="Share your experience with this product..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none resize-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {submittingReview ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Submit Review
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-2xl text-center">
                    <p className="text-gray-600">
                      {auth.user ? (
                        'Only customers can write reviews.'
                      ) : (
                        <>
                          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Login</Link>
                          {' '}to write a review
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Customer Reviews ({reviews.length})</h4>

                  {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review._id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                                {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              review.rating >= 4 ? 'bg-emerald-100 text-emerald-700' :
                              review.rating >= 3 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              <span>{review.rating}</span>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </div>

                          {review.comment && (
                            <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                          )}

                          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 transition">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              Helpful
                            </button>
                            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                              </svg>
                              Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-40">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Price</p>
            <p className="text-xl font-extrabold text-gray-900">₹{(finalPrice * qty).toLocaleString()}</p>
          </div>
          <button
            onClick={addToCart}
            disabled={addingToCart || (product.totalStock === 0 && !product.allowBackorders)}
            className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addingToCart ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        html.dark .product-details-page [class*="bg-white"] {
          background-color: #0f172a !important;
        }
        html.dark .product-details-page [class*="bg-gray-50"] {
          background-color: #111827 !important;
        }
        html.dark .product-details-page [class*="bg-gray-100"] {
          background-color: #1f2937 !important;
        }
        html.dark .product-details-page [class*="border-gray-100"],
        html.dark .product-details-page [class*="border-gray-200"],
        html.dark .product-details-page [class*="border-gray-300"] {
          border-color: #334155 !important;
        }
        html.dark .product-details-page [class*="text-gray-900"],
        html.dark .product-details-page [class*="text-gray-800"],
        html.dark .product-details-page [class*="text-gray-700"] {
          color: #f8fafc !important;
        }
        html.dark .product-details-page [class*="text-gray-600"],
        html.dark .product-details-page [class*="text-gray-500"],
        html.dark .product-details-page [class*="text-gray-400"] {
          color: #94a3b8 !important;
        }
        html.dark .product-details-page input,
        html.dark .product-details-page select,
        html.dark .product-details-page textarea {
          background-color: #111827 !important;
          border-color: #334155 !important;
          color: #f8fafc !important;
        }
        html.dark .product-details-page input::placeholder,
        html.dark .product-details-page textarea::placeholder {
          color: #64748b !important;
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────────────────────── */
const SpecSection = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  </div>
);

const SpecRow = ({ label, value, highlight = false, capitalize = false, mono = false }) => {
  if (!value && value !== 0) return null;
  
  return (
    <tr className="hover:bg-gray-100/50 transition">
      <td className="px-4 py-3 text-gray-500 font-medium bg-gray-100/50 w-40 whitespace-nowrap">{label}</td>
      <td className={`px-4 py-3 ${highlight ? 'text-emerald-600 font-bold' : 'text-gray-800'} ${capitalize ? 'capitalize' : ''} ${mono ? 'font-mono text-xs' : ''} break-words`}>
        {value}
      </td>
    </tr>
  );
};

export default ProductDetails;
