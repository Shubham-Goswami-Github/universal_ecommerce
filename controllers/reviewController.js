const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

// Helper: recalculate product rating
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      avgRating: stats[0].avgRating,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      avgRating: 0,
      totalReviews: 0
    });
  }
};

// USER: add or update review
exports.addOrUpdateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'productId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    let review = await Review.findOne({ product: productId, user: userId });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: userId,
        rating,
        comment
      });
    }

    await recalculateProductRating(productId);

    res.json({
      message: 'Review saved successfully',
      review
    });
  } catch (error) {
    console.error('Add/update review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// USER: delete review
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const review = await Review.findOneAndDelete({ product: productId, user: userId });

    if (!review) {
      return res.status(404).json({ message: 'Review not found for this user and product' });
    }

    await recalculateProductRating(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUBLIC: get reviews of a product
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
