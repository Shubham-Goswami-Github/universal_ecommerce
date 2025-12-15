// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireLogin, allowRoles, optionalAuth } = require('../middleware/authMiddleware');

// Public: list approved products
router.get('/', productController.getPublicProducts);

// Vendor: get my products (all statuses) - place before /:id to avoid route conflicts
router.get('/vendor/my-products', requireLogin, allowRoles('vendor', 'admin'), productController.getMyProducts);

// Vendor creates product (goes to pending)
router.post('/', requireLogin, allowRoles('vendor'), productController.createProduct);

// Vendor edits/deletes own product (admin can also edit/delete)
router.put('/:id', requireLogin, allowRoles('vendor', 'admin'), productController.updateProduct);
router.delete('/:id', requireLogin, allowRoles('vendor', 'admin'), productController.deleteProduct);

// Public: product details but allow optional auth so owner/admin can see unapproved
router.get('/:id', optionalAuth, productController.getPublicProductDetails);

module.exports = router;
