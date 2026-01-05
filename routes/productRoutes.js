const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireLogin, allowRoles, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

/**
 * =====================
 * VENDOR ROUTES
 * =====================
 */
router.get(
  '/vendor/my-products',
  requireLogin,
  allowRoles('vendor', 'admin'),
  productController.getMyProducts
);

router.post(
  '/',
  requireLogin,
  allowRoles('vendor'),
  upload.array('images', 5), // ✅ MULTIPLE IMAGES
  productController.createProduct
);

router.put(
  '/:id',
  requireLogin,
  allowRoles('vendor', 'admin'),
  upload.array('images', 5), // ✅ MULTIPLE IMAGES
  productController.updateProduct
);

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
router.get('/', productController.getPublicProducts);

router.get(
  '/:id',
  optionalAuth,
  productController.getPublicProductDetails
);

module.exports = router;
