import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistProducts, loading, removeFromWishlist } = useWishlist();
  const [busyProductId, setBusyProductId] = useState(null);
  const [message, setMessage] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    window.clearTimeout(window.__wishlistToastTimer);
    window.__wishlistToastTimer = window.setTimeout(() => setMessage(''), 3000);
  };

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      const result = await removeFromWishlist(productId);
      showMessage(result.message || 'Removed from wishlist', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to remove item', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setBusyProductId(product._id);
      await axiosClient.post('/api/cart/add', {
        productId: product._id,
        quantity: product.minPurchaseQty || 1,
      });
      window.dispatchEvent(new Event('cart:updated'));
      showMessage(`Added to cart successfully!`, 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setBusyProductId(null);
    }
  };

  const handleAddAllToCart = async () => {
    let successCount = 0;
    for (const product of wishlistProducts) {
      try {
        await axiosClient.post('/api/cart/add', {
          productId: product._id,
          quantity: product.minPurchaseQty || 1,
        });
        successCount++;
      } catch (error) {
        console.error('Failed to add:', product.name);
      }
    }
    window.dispatchEvent(new Event('cart:updated'));
    showMessage(`${successCount} items added to cart!`, 'success');
  };

  const calculateDiscount = (mrp, price) => {
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const totalValue = wishlistProducts.reduce((sum, product) => {
    const price = product.finalPrice || product.sellingPrice || product.price || 0;
    return sum + price;
  }, 0);

  const totalSavings = wishlistProducts.reduce((sum, product) => {
    const price = product.finalPrice || product.sellingPrice || product.price || 0;
    const mrp = product.mrp || price;
    return sum + (mrp - price);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Enhanced Toast Notification */}
      {message && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 animate-[slideDown_0.4s_ease-out]">
          <div className={`flex items-center gap-3 rounded-2xl border px-6 py-4 shadow-2xl backdrop-blur-xl ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/95 dark:border-emerald-800 dark:bg-emerald-950/95'
              : 'border-rose-200 bg-rose-50/95 dark:border-rose-800 dark:bg-rose-950/95'
          }`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              message.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}>
              {message.type === 'success' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <p className={`font-semibold ${
              message.type === 'success'
                ? 'text-emerald-900 dark:text-emerald-100'
                : 'text-rose-900 dark:text-rose-100'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Enhanced Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Section */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
                    My Wishlist
                  </h1>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                    {wishlistProducts.length}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Save your favorite items and add them to cart when you're ready
                </p>
              </div>
            </div>

            {/* Right Section - Stats */}
            {wishlistProducts.length > 0 && (
              <div className="flex flex-wrap gap-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total Value
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{totalValue.toLocaleString()}
                  </p>
                </div>
                {totalSavings > 0 && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-950">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      You Save
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{totalSavings.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {wishlistProducts.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAddAllToCart}
                    className="group flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white shadow-lg shadow-gray-900/30 transition-all hover:scale-105 hover:bg-gray-800 hover:shadow-xl active:scale-95 dark:bg-white dark:text-gray-900 dark:shadow-white/20 dark:hover:bg-gray-100"
                  >
                    <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add All to Cart
                  </button>
                  <Link
                    to="/cart"
                    className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    View Cart
                  </Link>
                </div>
                <Link
                  to="/products"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-5 py-3 font-semibold text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="aspect-square animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800" />
                <div className="space-y-4 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="h-5 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-2/3 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                    <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          /* Enhanced Empty State */
          <div className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-12 text-center dark:from-rose-950/20 dark:to-pink-950/20">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 shadow-2xl dark:from-rose-900/30 dark:to-pink-900/30">
                  <svg className="h-16 w-16 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Your Wishlist is Empty
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  You haven't saved any products yet. Start exploring and add items you love!
                </p>
              </div>
              
              <div className="border-t border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                      <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Explore</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Browse amazing products</p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
                      <svg className="h-7 w-7 text-rose-600 dark:text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Save</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Click the heart icon</p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
                      <svg className="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Shop</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Add to cart anytime</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    to="/products"
                    className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-4 font-bold text-white shadow-xl shadow-gray-900/30 transition-all hover:scale-105 hover:shadow-2xl active:scale-95 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:shadow-white/20"
                  >
                    <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Start Shopping Now
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 font-bold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistProducts.map((product) => {
              const image = product.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image';
              const price = product.finalPrice || product.sellingPrice || product.price || 0;
              const isBusy = busyProductId === product._id;
              const isRemoving = removingId === product._id;
              const discount = calculateDiscount(product.mrp, price);

              return (
                <div
                  key={product._id}
                  className={`group relative overflow-hidden rounded-2xl border bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-900 ${
                    isRemoving
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={isRemoving}
                    className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/95 text-rose-600 opacity-0 shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-rose-50 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700/50 dark:bg-gray-900/95 dark:hover:bg-rose-900/30"
                    title="Remove from wishlist"
                  >
                    {isRemoving ? (
                      <svg className="h-5 w-5 animate-spin text-rose-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>

                  {/* Product Image */}
                  <Link
                    to={`/products/${product._id}`}
                    className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {discount > 0 && (
                      <div className="absolute left-3 top-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-500/50">
                        {discount}% OFF
                      </div>
                    )}
                    
                    {/* Stock Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-emerald-500/95 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
                      In Stock
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-5">
                    {/* Category */}
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {product.category?.name || 'General'}
                    </p>

                    {/* Product Name */}
                    <Link to={`/products/${product._id}`}>
                      <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition-colors hover:text-rose-600 dark:text-white dark:hover:text-rose-400">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Short Description */}
                    {product.shortDescription && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Price Section */}
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{Number(price).toLocaleString()}
                      </span>
                      {product.mrp > price && (
                        <span className="text-sm font-semibold text-gray-400 line-through">
                          ₹{Number(product.mrp).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 space-y-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isBusy}
                        className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3.5 font-bold text-white shadow-lg shadow-gray-900/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:shadow-white/20"
                      >
                        {isBusy ? (
                          <>
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-750"
                      >
                        View Details
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -1.5rem);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;