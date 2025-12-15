const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');

// User review actions
router.post(
  '/',
  requireLogin,
  allowRoles('user'),
  reviewController.addOrUpdateReview
);

router.delete(
  '/',
  requireLogin,
  allowRoles('user'),
  reviewController.deleteReview
);

// Public: product reviews
router.get(
  '/product/:productId',
  reviewController.getProductReviews
);

module.exports = router;
