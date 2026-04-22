import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistProducts, loading, removeFromWishlist } = useWishlist();
  const [busyProductId, setBusyProductId] = useState(null);
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);
    window.clearTimeout(window.__wishlistToastTimer);
    window.__wishlistToastTimer = window.setTimeout(() => setMessage(''), 2500);
  };

  const handleRemove = async (productId) => {
    try {
      setBusyProductId(productId);
      const result = await removeFromWishlist(productId);
      showMessage(result.message || 'Removed from wishlist');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setBusyProductId(null);
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
      showMessage(`${product.name} added to cart`);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {message && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-xl dark:bg-gray-100 dark:text-gray-900">
          {message}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Your Wishlist</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Saved Products</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Keep your favorite products here and move them to cart anytime.
            </p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-5 py-4 text-center dark:bg-rose-500/10">
            <p className="text-3xl font-bold text-rose-600">{wishlistProducts.length}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Items</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="h-60 bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-6 w-full rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10">
              <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your wishlist is empty</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Start saving products from cards, quick view, or product details.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 dark:bg-white dark:text-gray-900 dark:hover:bg-rose-100"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {wishlistProducts.map((product) => {
              const image = product.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image';
              const price = product.finalPrice || product.sellingPrice || product.price || 0;
              const isBusy = busyProductId === product._id;

              return (
                <div
                  key={product._id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                >
                  <Link to={`/products/${product._id}`} className="block bg-gray-100 dark:bg-gray-800">
                    <img src={image} alt={product.name} className="h-64 w-full object-cover" />
                  </Link>

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                      {product.category?.name || 'General'}
                    </p>
                    <Link to={`/products/${product._id}`}>
                      <h2 className="mt-2 line-clamp-2 text-xl font-bold text-gray-900 transition hover:text-rose-500 dark:text-white">
                        {product.name}
                      </h2>
                    </Link>
                    {product.shortDescription && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {product.shortDescription}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        Rs {Number(price).toLocaleString()}
                      </span>
                      {product.mrp > price && (
                        <span className="text-sm text-gray-400 line-through">
                          Rs {Number(product.mrp).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={isBusy}
                        className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-emerald-100"
                      >
                        {isBusy ? 'Please wait...' : 'Add to Cart'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(product._id)}
                        disabled={isBusy}
                        className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                      >
                        Remove
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
