const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireLogin, allowRoles, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
/**
 * =====================
 * VENDOR ROUTES (FIRST)
 * =====================
 */
router.get(
  '/vendor/my-products',
  requireLogin,
  allowRoles('vendor', 'admin'),
  productController.getMyProducts
);

/**
 * =====================
 * PUBLIC ROUTES
 * =====================
 */
router.post(
  '/',
  requireLogin,
  allowRoles('vendor'),
  upload.array('images', 5),
  productController.createProduct
);

router.put(
  '/:id',
  requireLogin,
  allowRoles('vendor', 'admin'),
  upload.array('images', 5),
  productController.updateProduct
);
router.get(
  '/',
  productController.getPublicProducts
);

// Vendor creates product
router.post(
  '/',
  requireLogin,
  allowRoles('vendor'),
  productController.createProduct
);

// Vendor/Admin edit/delete
router.put(
  '/:id',
  requireLogin,
  allowRoles('vendor', 'admin'),
  productController.updateProduct
);

router.delete(
  '/:id',
  requireLogin,
  allowRoles('vendor', 'admin'),
  productController.deleteProduct
);

// Product details
router.get(
  '/:id',
  optionalAuth,
  productController.getPublicProductDetails
);

module.exports = router;
