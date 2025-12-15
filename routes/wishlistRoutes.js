const express = require('express');
const router = express.Router();

const wishlistController = require('../controllers/wishlistController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');

// Saare wishlist routes: sirf user
router.post(
  '/add',
  requireLogin,
  allowRoles('user'),
  wishlistController.addToWishlist
);

router.post(
  '/remove',
  requireLogin,
  allowRoles('user'),
  wishlistController.removeFromWishlist
);

router.get(
  '/',
  requireLogin,
  allowRoles('user'),
  wishlistController.getMyWishlist
);

module.exports = router;
