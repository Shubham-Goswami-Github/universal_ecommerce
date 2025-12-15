// src/pages/ProductDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { auth } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const loadProduct = async () => {
    try {
      const res = await axiosClient.get(`/api/products/${id}`);
      setProduct(res.data.product || res.data);
    } catch (err) {
      console.error(err);
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

  const addToCart = async () => {
    setMessage('');
    try {
      await axiosClient.post('/api/cart/add', {
        productId: id,
        quantity: qty,
      });
      setMessage('Added to cart ✅');
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || 'Failed to add to cart. Login as user?'
      );
    }
  };

  const addToWishlist = async () => {
    setMessage('');
    try {
      await axiosClient.post('/api/wishlist/add', {
        productId: id,
      });
      setMessage('Added to wishlist ❤️');
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          'Failed to add to wishlist. Login as user?'
      );
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axiosClient.post('/api/reviews', {
        productId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: 5, comment: '' });
      await loadReviews();
      await loadProduct();
      setMessage('Review submitted ✅');
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          'Failed to submit review. Maybe login as user?'
      );
    }
  };

  if (!product) {
    return <p className="text-sm text-slate-400">Loading product...</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      {/* Left column: product info */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 mb-2">
          {product.name}
        </h1>
        <p className="text-sm text-slate-400 mb-3">
          {product.description || 'No description.'}
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
          <span className="text-teal-300 font-semibold text-lg">
            ₹{product.price}
          </span>
          {product.category && (
            <span className="px-2 py-1 rounded-md bg-slate-800 text-[11px] uppercase text-slate-300">
              {product.category}
            </span>
          )}
          <span className="text-xs text-slate-500">
            Stock: {product.stock ?? 0}
          </span>
          {product.avgRating > 0 && (
            <span className="text-xs text-amber-300">
              ★ {product.avgRating.toFixed(1)} ({product.totalReviews} reviews)
            </span>
          )}
        </div>

        {message && (
          <div className="mb-3 text-xs text-teal-300">{message}</div>
        )}

        {/* Add to cart / wishlist */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300">Qty</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
              className="w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>
          <button
            onClick={addToCart}
            className="px-4 py-2 rounded-md bg-teal-400 text-slate-900 text-sm font-semibold hover:bg-teal-300"
          >
            Add to Cart
          </button>
          <button
            onClick={addToWishlist}
            className="px-4 py-2 rounded-md border border-pink-500 text-pink-300 text-sm hover:bg-pink-500/10"
          >
            Add to Wishlist
          </button>
        </div>

        {/* Reviews list */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-2">
            Reviews
          </h2>
          {reviews.length === 0 && (
            <p className="text-xs text-slate-500">No reviews yet.</p>
          )}
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold">
                    {r.user?.name || 'User'}
                  </span>
                  <span className="text-amber-300">★ {r.rating}</span>
                </div>
                {r.comment && (
                  <p className="text-xs text-slate-400">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column: review form (for logged-in users) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 h-fit sticky top-20">
        <h3 className="text-sm font-semibold text-slate-100 mb-2">
          Write a Review
        </h3>
        {auth.user && auth.user.role === 'user' ? (
          <form onSubmit={submitReview} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((f) => ({
                    ...f,
                    rating: Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v} star{v > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, comment: e.target.value }))
                }
                rows={3}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-400"
                placeholder="Share your experience..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-teal-400 text-slate-900 text-sm font-semibold py-2 hover:bg-teal-300"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <p className="text-xs text-slate-400">
            Please login as a <span className="text-teal-300">user</span> to
            write a review.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
