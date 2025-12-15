const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');

// Saare cart route me login zaroori hai
// Filhaal sirf 'user' role ko allow kar rahe hain
router.post(
  '/add',
  requireLogin,
  allowRoles('user'),
  cartController.addToCart
);

router.get(
  '/',
  requireLogin,
  allowRoles('user'),
  cartController.getMyCart
);

router.put(
  '/update',
  requireLogin,
  allowRoles('user'),
  cartController.updateItemQuantity
);

router.delete(
  '/remove/:productId',
  requireLogin,
  allowRoles('user'),
  cartController.removeItem
);

router.delete(
  '/clear',
  requireLogin,
  allowRoles('user'),
  cartController.clearCart
);

module.exports = router;
