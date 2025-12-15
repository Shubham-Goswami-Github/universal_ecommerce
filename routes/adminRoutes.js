// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(requireLogin, allowRoles('admin'));

/* USERS */
router.get('/users', adminController.getAllUsers);
router.get('/vendors', adminController.getAllVendors);
router.get('/admins', adminController.getAllAdmins);

router.post('/users', adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

/* PRODUCTS / APPROVALS */
router.get('/products', adminController.getAllProductsAdmin);
router.patch('/products/:id/status', adminController.updateProductStatus);
router.delete('/products/:id', adminController.deleteProductAdmin);

/* Vendor products */
router.get('/vendors/:vendorId/products', adminController.getProductsByVendor);

/* User carts */
router.get('/users/:userId/cart', adminController.getUserCart);

/* --- The endpoint you need: pending grouped approvals --- */
/* This MUST match the function name exported in your controller:
   exports.getPendingGroupedByVendor = async (req, res) => { ... }
*/
router.get('/pending-products-grouped', adminController.getPendingGroupedByVendor);

/* Approve / reject routes (only if controller exports them) */
if (typeof adminController.approveProduct === 'function') {
  router.post('/products/:id/approve', adminController.approveProduct);
}
if (typeof adminController.rejectProduct === 'function') {
  router.post('/products/:id/reject', adminController.rejectProduct);
}

module.exports = router;
