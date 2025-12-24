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
  const [activeImage, setActiveImage] = useState(0);

  const loadProduct = async () => {
    try {
      const res = await axiosClient.get(`/api/products/${id}`);
      setProduct(res.data.product || res.data);
      setActiveImage(0);
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
      setMessage(err.response?.data?.message || 'Login as user to add to cart');
    }
  };

  const addToWishlist = async () => {
    setMessage('');
    try {
      await axiosClient.post('/api/wishlist/add', { productId: id });
      setMessage('Added to wishlist ❤️');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login as user to wishlist');
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
      setMessage(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (!product) {
    return <p className="text-sm text-gray-500">Loading product...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[1.2fr,1fr]">
      {/* LEFT: IMAGE + INFO */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        {/* MAIN IMAGE */}
        <div className="w-full h-[380px] bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img
            src={
              product.images?.length
                ? product.images[activeImage]
                : 'https://via.placeholder.com/600x400?text=No+Image'
            }
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* THUMBNAILS */}
        {product.images?.length > 1 && (
          <div className="flex gap-3 mb-6">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-16 h-16 rounded border overflow-hidden ${
                  activeImage === idx ? 'ring-2 ring-emerald-500' : ''
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

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
        </div>

        {message && (
          <div className="mb-4 text-sm text-emerald-600 font-medium">
            {message}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value) || 1)}
            className="w-20 rounded-md border px-2 py-1 text-sm"
          />

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
            Wishlist ❤️
          </button>
        </div>
      </div>

      {/* RIGHT: REVIEWS */}
      <div className="bg-white rounded-xl border shadow-sm p-6 h-fit sticky top-24">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Reviews
        </h3>

        {reviews.length === 0 && (
          <p className="text-sm text-gray-500 mb-4">No reviews yet.</p>
        )}

        <div className="space-y-4 mb-6">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-lg border bg-gray-50 p-4">
              <div className="flex justify-between text-sm mb-1">
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

        {auth.user && auth.user.role === 'user' ? (
          <form onSubmit={submitReview} className="space-y-3 text-sm">
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

            <textarea
              rows={3}
              placeholder="Write your review..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((f) => ({ ...f, comment: e.target.value }))
              }
              className="w-full rounded-md border px-2 py-2"
            />

            <button
              type="submit"
              className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">
            Login as <b>user</b> to write a review.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
