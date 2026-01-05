// src/pages/ProductDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

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
  const [isWishlisted, setIsWishlisted] = useState(false);
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
      showMessage('Please login to add to wishlist', 'error');
      return;
    }
    
    setAddingToWishlist(true);
    try {
      await axiosClient.post('/api/wishlist/add', { productId: id });
      setIsWishlisted(true);
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

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

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

  // Render star rating
  const renderStars = (rating, size = 'sm') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    
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

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4">
              <div className="animate-pulse">
                <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-16 h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex gap-4 mt-6">
                  <div className="h-12 bg-gray-200 rounded flex-1"></div>
                  <div className="h-12 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate discount from database
  const calculateDiscount = () => {
    if (product.discountType && product.discountValue) {
      if (product.discountType === 'percentage') {
        return `${product.discountValue}%`;
      } else if (product.discountType === 'flat') {
        return `₹${product.discountValue}`;
      }
    }
    if (product.mrp && product.sellingPrice && product.mrp > product.sellingPrice) {
      return `${Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}%`;
    }
    return null;
  };

  const discountDisplay = calculateDiscount();
  const finalPrice = product.finalPrice || product.sellingPrice || product.price;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-down ${
          messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message}
        </div>
      )}

      {/* Zoom Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setShowZoomModal(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 z-10">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className="text-white font-semibold min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                  activeImage === idx ? 'border-white shadow-lg' : 'border-white/30 opacity-60 hover:opacity-100'
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
                className="absolute left-20 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setActiveImage((prev) => (prev + 1) % product.images.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
            <span className="text-gray-400">/</span>
            {product.category?.parent?.name && (
              <>
                <Link to={`/category/${product.category.parent._id}`} className="text-gray-500 hover:text-blue-600">
                  {product.category.parent.name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            {product.category?.name && (
              <>
                <Link to={`/category/${product.category._id}`} className="text-gray-500 hover:text-blue-600">
                  {product.category.name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* LEFT SECTION - Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              {/* Main Image */}
              <div className="relative w-full h-[400px] md:h-[500px] bg-gray-50 rounded-lg overflow-hidden mb-4 group">
                <img
                  src={product.images?.length ? product.images[activeImage] : 'https://via.placeholder.com/600x600?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />

                {/* Discount Badge */}
                {discountDisplay && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                    {discountDisplay} OFF
                  </div>
                )}

                {/* Availability Badge */}
                {product.availabilityStatus === 'coming_soon' && (
                  <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                    Coming Soon
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={addToWishlist}
                  disabled={addingToWishlist}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition ${
                    isWishlisted 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-600 hover:text-red-500'
                  }`}
                >
                  {addingToWishlist ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                  ) : (
                    <svg className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>

                {/* Zoom Button */}
                <button
                  onClick={openZoomModal}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg transition group-hover:scale-110"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>

                {/* Image Counter */}
                {product.images?.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {activeImage + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition ${
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

              {/* Mobile Action Buttons */}
              <div className="lg:hidden grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={addToCart}
                  disabled={addingToCart || product.totalStock === 0 || product.availabilityStatus === 'out_of_stock'}
                  className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      ADD TO CART
                    </>
                  )}
                </button>
                <button
                  onClick={buyNow}
                  disabled={product.totalStock === 0 || product.availabilityStatus === 'out_of_stock'}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - Product Info */}
          <div className="space-y-4">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Brand & Title */}
              {product.brandName && (
                <Link to={`/brand/${product.brandName}`} className="text-blue-600 font-medium text-sm hover:underline">
                  {product.brandName}
                </Link>
              )}
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
                {product.name}
              </h1>
              {product.shortTitle && (
                <p className="text-gray-500 text-sm mb-3">{product.shortTitle}</p>
              )}

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {reviewStats.total > 0 ? (
                  <>
                    <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded text-sm font-semibold">
                      <span>{reviewStats.average}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {reviewStats.total} Ratings & {product.totalSales || 0} Orders
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">No reviews yet • {product.totalSales || 0} Orders</span>
                )}
              </div>

              {/* Price Section */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl mb-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-800">₹{finalPrice}</span>
                  {product.mrp && product.mrp > finalPrice && (
                    <span className="text-xl text-gray-400 line-through">₹{product.mrp}</span>
                  )}
                  {discountDisplay && (
                    <span className="text-lg text-green-600 font-bold">{discountDisplay} off</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {product.taxInclusive ? 'Inclusive of all taxes' : 'Exclusive of taxes'}
                  {product.gstApplicable && ` • GST ${product.gstPercentage}%`}
                </p>
              </div>

              {/* Stock & Availability Status */}
              <div className="mb-4">
                {product.availabilityStatus === 'available' && product.totalStock > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-green-600 font-semibold">In Stock</span>
                    </span>
                    {product.totalStock <= product.lowStockAlertQty && (
                      <span className="text-orange-500 text-sm font-medium bg-orange-50 px-2 py-1 rounded-full">
                        Only {product.totalStock} left - Hurry!
                      </span>
                    )}
                  </div>
                ) : product.availabilityStatus === 'coming_soon' ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span className="text-purple-600 font-semibold">Coming Soon</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                    {product.allowBackorders && (
                      <span className="text-blue-600 text-sm">(Backorder Available)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {(product.totalStock > 0 || product.allowBackorders) && product.availabilityStatus !== 'coming_soon' && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-600 font-medium">Quantity:</span>
                  <div className="flex items-center border-2 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(product.minPurchaseQty || 1, qty - 1))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition font-bold text-lg"
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
                      className="w-16 text-center py-2 font-semibold text-lg border-none outline-none"
                    />
                    <button
                      onClick={() => setQty(Math.min(product.maxPurchaseQty || product.totalStock, qty + 1))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    (Min: {product.minPurchaseQty || 1}, Max: {product.maxPurchaseQty || 'No limit'})
                  </span>
                </div>
              )}

              {/* Desktop Action Buttons */}
              <div className="hidden lg:grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={addToCart}
                  disabled={addingToCart || (product.totalStock === 0 && !product.allowBackorders) || product.availabilityStatus === 'coming_soon'}
                  className="flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      ADD TO CART
                    </>
                  )}
                </button>
                <button
                  onClick={buyNow}
                  disabled={(product.totalStock === 0 && !product.allowBackorders) || product.availabilityStatus === 'coming_soon'}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  BUY NOW
                </button>
              </div>

              {/* Key Features */}
              {product.keyFeatures?.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">✨</span> Key Features
                  </h3>
                  <ul className="space-y-2">
                    {product.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-lg">🎁</span> Available Offers
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">Free Delivery</p>
                    <p className="text-sm text-gray-500">On orders above ₹499</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive</p>
                  </div>
                </div>

                {product.returnAvailable && (
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{product.returnDays} Days Return</p>
                      <p className="text-sm text-gray-500">Easy return policy</p>
                    </div>
                  </div>
                )}

                {product.warrantyAvailable && (
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{product.warrantyPeriod} Warranty</p>
                      <p className="text-sm text-gray-500 capitalize">{product.warrantyType} warranty</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========== FIXED PRODUCT DETAILS SECTION ========== */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-lg">📋</span> Product Details
              </h3>
              
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {product.brandName && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-100 w-40">Brand</td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">{product.brandName}</td>
                      </tr>
                    )}
                { /*   {product.sku && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-100 w-40">SKU</td>
                        <td className="px-4 py-3 text-sm text-gray-800 break-all font-mono">{product.sku}</td>
                      </tr>
                    )}*/}
                    {product.productCode && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-100 w-40">Product Code</td>
                        <td className="px-4 py-3 text-sm text-gray-800 break-all font-mono">{product.productCode}</td>
                      </tr>
                    )}
                    {product.productType && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-100 w-40">Type</td>
                        <td className="px-4 py-3 text-sm text-gray-800 capitalize">{product.productType}</td>
                      </tr>
                    )}
                    {product.countryOfOrigin && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-100 w-40">Country of Origin</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{product.countryOfOrigin}</td>
                      </tr>
                    )}
                    {product.hsnCode && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-100 w-40">HSN Code</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{product.hsnCode}</td>
                      </tr>
                    )}
                    {product.category && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-100 w-40">Category</td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="flex items-center gap-2 flex-wrap">
                            {product.category.parent?.name && (
                              <>
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                  {product.category.parent.name}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </>
                            )}
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                              {product.category.name}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Seller Info */}
            {product.vendor && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-lg">🏪</span> Seller Information
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {product.vendor.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{product.vendor.name || 'Official Store'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          ✓ Verified Seller
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
                    View Store
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description, Specifications & Reviews Tabs */}
        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b overflow-x-auto">
            {[
              { key: 'description', label: 'Description' },
              { key: 'specifications', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 md:px-8 py-4 font-semibold transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                {/* Short Description */}
                {product.shortDescription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Overview</h3>
                    <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
                  </div>
                )}

                {/* Full Description */}
                {product.fullDescription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Description</h3>
                    <div 
                      className="text-gray-600 leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                    />
                  </div>
                )}

                {/* Key Features Detailed */}
                {product.keyFeatures?.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      ✨ Key Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {product.keyFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Instructions */}
                {product.usageInstructions && (
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      📖 Usage Instructions
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">{product.usageInstructions}</p>
                  </div>
                )}

                {/* Care Instructions */}
                {product.careInstructions && (
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      🧹 Care Instructions
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">{product.careInstructions}</p>
                  </div>
                )}

                {/* Box Contents */}
                {product.boxContents && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      📦 What's in the Box
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">{product.boxContents}</p>
                  </div>
                )}

                {/* No description fallback */}
                {!product.shortDescription && !product.fullDescription && !product.keyFeatures?.length && (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No description available for this product.</p>
                  </div>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="space-y-6">
                {/* General Specifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">General Information</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
                        <SpecRow label="Product Name" value={product.name} />
                        <SpecRow label="Short Title" value={product.shortTitle} />
                        <SpecRow label="Brand" value={product.brandName} />
                        <SpecRow label="SKU" value={product.sku} />
                        <SpecRow label="Product Code" value={product.productCode} />
                        <SpecRow label="Product Type" value={product.productType} capitalize />
                        <SpecRow label="Category" value={
                          product.category?.parent?.name 
                            ? `${product.category.parent.name} → ${product.category.name}`
                            : product.category?.name
                        } />
                        <SpecRow label="Country of Origin" value={product.countryOfOrigin} />
                        <SpecRow label="HSN Code" value={product.hsnCode} />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pricing Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Details</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
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
                        {product.gstApplicable && (
                          <SpecRow label="GST Percentage" value={`${product.gstPercentage}%`} />
                        )}
                        <SpecRow label="Tax Type" value={product.taxInclusive ? 'Inclusive' : 'Exclusive'} />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock & Availability</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
                        <SpecRow label="Total Stock" value={product.totalStock} />
                        <SpecRow label="Stock Status" value={product.stockStatus?.replace('_', ' ')} capitalize />
                        <SpecRow label="Availability" value={product.availabilityStatus?.replace('_', ' ')} capitalize />
                        <SpecRow label="Min Purchase Qty" value={product.minPurchaseQty} />
                        <SpecRow label="Max Purchase Qty" value={product.maxPurchaseQty} />
                        <SpecRow label="Backorders" value={product.allowBackorders ? 'Allowed' : 'Not Allowed'} />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Returns & Warranty */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Returns & Warranty</h3>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
                        <SpecRow label="Return Available" value={product.returnAvailable ? 'Yes' : 'No'} />
                        {product.returnAvailable && (
                          <SpecRow label="Return Period" value={`${product.returnDays} Days`} />
                        )}
                        <SpecRow label="Replacement" value={product.replacementAvailable ? 'Available' : 'Not Available'} />
                        <SpecRow label="Warranty" value={product.warrantyAvailable ? 'Yes' : 'No'} />
                        {product.warrantyAvailable && (
                          <>
                            <SpecRow label="Warranty Period" value={product.warrantyPeriod} />
                            <SpecRow label="Warranty Type" value={product.warrantyType} capitalize />
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {/* Review Statistics */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="text-5xl font-bold text-gray-800 mb-2">
                      {reviewStats.average}
                    </div>
                    <div className="flex justify-center mb-2">
                      {renderStars(Math.round(Number(reviewStats.average)), 'lg')}
                    </div>
                    <p className="text-gray-500 text-sm">
                      Based on {reviewStats.total} reviews
                    </p>
                  </div>

                  <div className="md:col-span-2 p-6 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-4">Rating Distribution</h4>
                    <div className="space-y-2">
                      {reviewStats.distribution.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-12">{star} ★</span>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                star >= 4 ? 'bg-green-500' : star >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Write Review Form */}
                {auth.user && auth.user.role === 'user' ? (
                  <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      ✍️ Write a Review
                    </h4>
                    
                    <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                              className="focus:outline-none transform hover:scale-110 transition"
                            >
                              <svg
                                className={`w-10 h-10 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                          <span className="ml-3 text-gray-600 font-medium">
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
                          className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {submittingReview ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="mb-8 p-6 bg-gray-50 rounded-xl text-center">
                    <p className="text-gray-600">
                      {auth.user ? (
                        'Only customers can write reviews.'
                      ) : (
                        <>
                          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
                          {' '}to write a review
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 text-lg">Customer Reviews ({reviews.length})</h4>

                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="border rounded-xl p-5 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold ${
                            review.rating >= 4 ? 'bg-green-100 text-green-700' :
                            review.rating >= 3 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <span>{review.rating}</span>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                        )}

                        <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Helpful
                          </button>
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                            Report
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Total Price</p>
            <p className="text-xl font-bold text-gray-800">₹{finalPrice * qty}</p>
          </div>
          <button
            onClick={addToCart}
            disabled={addingToCart || (product.totalStock === 0 && !product.allowBackorders)}
            className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {addingToCart ? 'Adding...' : 'ADD TO CART'}
          </button>
        </div>
      </div>

      {/* Bottom Padding for Mobile Sticky Bar */}
      <div className="lg:hidden h-24"></div>

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
      `}</style>
    </div>
  );
};

// Specification Row Component
const SpecRow = ({ label, value, highlight = false, capitalize = false }) => {
  if (!value && value !== 0) return null;
  
  return (
    <tr className="hover:bg-gray-100 transition">
      <td className="px-4 py-3 text-sm text-gray-500 font-medium bg-gray-100 w-40 whitespace-nowrap">{label}</td>
      <td className={`px-4 py-3 text-sm ${highlight ? 'text-green-600 font-bold' : 'text-gray-800'} ${capitalize ? 'capitalize' : ''} break-words`}>
        {value}
      </td>
    </tr>
  );
};

export default ProductDetails;