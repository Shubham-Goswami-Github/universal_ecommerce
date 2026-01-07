const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireLogin, allowRoles, optionalAuth } = require('../middleware/authMiddleware');
const { checkVendorActive } = require('../middleware/permissionMiddleware');
const upload = require('../middleware/upload');

/**
 * =====================
 * VENDOR ROUTES
 * =====================
 */

// Vendor / Admin: get own products
router.get(
  '/vendor/my-products',
  requireLogin,
  allowRoles('vendor', 'admin'),
  productController.getMyProducts
);

// ✅ CREATE PRODUCT (ONLY ACTIVE + APPROVED VENDOR)
router.post(
  '/',
  requireLogin,
  allowRoles('vendor'),
  checkVendorActive,              // 🔥 IMPORTANT
  upload.array('images', 5),
  productController.createProduct
);

// UPDATE PRODUCT
router.put(
  '/:id',
  requireLogin,
  allowRoles('vendor', 'admin'),
  upload.array('images', 5),
  productController.updateProduct
);

// DELETE PRODUCT
router.delete(
  '/:id',
  requireLogin,
  allowRoles('vendor', 'admin'),
  productController.deleteProduct
);

/**
 * =====================
 * PUBLIC ROUTES
 * =====================
 */

// Public product listing
router.get('/', productController.getPublicProducts);

// Public product details
router.get(
  '/:id',
  optionalAuth,
  productController.getPublicProductDetails
);

module.exports = router;
