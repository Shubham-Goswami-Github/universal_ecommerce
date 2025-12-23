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
      setMessage(
        err.response?.data?.message || 'Failed to add to cart. Login as user?'
      );
    }
  };

  const addToWishlist = async () => {
    setMessage('');
    try {
      await axiosClient.post('/api/wishlist/add', { productId: id });
      setMessage('Added to wishlist ❤️');
    } catch (err) {
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
      setMessage(
        err.response?.data?.message ||
          'Failed to submit review. Maybe login as user?'
      );
    }
  };

  if (!product) {
    return <p className="text-sm text-gray-500">Loading product...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[2fr,1fr]">
      {/* LEFT SECTION */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          {product.description || 'No description available.'}
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
          <span className="text-2xl font-bold text-emerald-600">
            ₹{product.price}
          </span>

          {product.category && (
            <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
              {product.category.parent?.name
                ? `${product.category.parent.name} / ${product.category.name}`
                : product.category.name}
            </span>
          )}

          <span className="text-gray-500 text-xs">
            Stock: {product.stock ?? 0}
          </span>

          {product.avgRating > 0 && (
            <span className="text-amber-500 text-xs font-medium">
              ★ {product.avgRating.toFixed(1)} ({product.totalReviews} reviews)
            </span>
          )}
        </div>

        {message && (
          <div className="mb-4 text-sm text-emerald-600 font-medium">
            {message}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Qty</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
              className="w-20 rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <button
            onClick={addToCart}
            className="px-6 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm"
          >
            Add to Cart
          </button>

          <button
            onClick={addToWishlist}
            className="px-6 py-2 rounded-md border border-pink-500 text-pink-600 hover:bg-pink-50 text-sm font-semibold"
          >
            Add to Wishlist
          </button>
        </div>

        {/* REVIEWS */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Customer Reviews
          </h2>

          {reviews.length === 0 && (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          )}

          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="rounded-lg border bg-gray-50 p-4"
              >
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-semibold text-gray-800">
                    {r.user?.name || 'User'}
                  </span>
                  <span className="text-amber-500">★ {r.rating}</span>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-600">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="bg-white rounded-xl border shadow-sm p-6 h-fit sticky top-24">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Write a Review
        </h3>

        {auth.user && auth.user.role === 'user' ? (
          <form onSubmit={submitReview} className="space-y-4 text-sm">
            <div>
              <label className="block mb-1 text-gray-700">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((f) => ({
                    ...f,
                    rating: Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border px-2 py-2"
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v} star{v > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Comment</label>
              <textarea
                rows={3}
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, comment: e.target.value }))
                }
                className="w-full rounded-md border px-2 py-2"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">
            Please login as a <span className="font-semibold">user</span> to write a review.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
