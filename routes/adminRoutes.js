const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');
const adminProfileUpload = require('../middleware/adminProfileUpload');

// 🔐 Protect all admin routes
router.use(requireLogin);
router.use(allowRoles('admin'));

/* =======================
   DASHBOARD STATS (NEW)
======================= */

// GET dashboard analytics stats
router.get('/dashboard-stats', adminController.getDashboardStats);

/* =======================
   USERS
======================= */

// GET all users
router.get('/users', adminController.getAllUsers);

// GET vendors
router.get('/vendors', adminController.getAllVendors);

// GET admin stats
router.get('/stats', adminController.getAdminStats);

// GET admins
router.get('/admins', adminController.getAllAdmins);

// ✅ CREATE USER (multipart/form-data REQUIRED)
router.post(
  '/users',
  adminProfileUpload.single('profilePicture'), // 👈 MUST be before controller
  adminController.createUser
);

// ✅ UPDATE USER (multipart/form-data REQUIRED)
router.patch(
  '/users/:id',
  adminProfileUpload.single('profilePicture'), // 👈 MUST be before controller
  adminController.updateUser
);

// Update user active status
router.patch('/users/:id/status', adminController.updateUserStatus);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

/* =======================
   PRODUCTS (ADMIN)
======================= */

// Get all products
router.get('/products', adminController.getAllProductsAdmin);

// Update product active status
router.patch('/products/:id/status', adminController.updateProductStatus);

// Delete product
router.delete('/products/:id', adminController.deleteProductAdmin);

// Get products by vendor
router.get(
  '/vendors/:vendorId/products',
  adminController.getProductsByVendor
);

// Get pending products grouped by vendor
router.get('/pending-products-grouped', adminController.getPendingGroupedByVendor);

// Get vendor sales stats
router.get(
  '/vendors/:vendorId/sales-stats',
  adminController.getVendorSalesStats
);

/* =======================
   CARTS
======================= */

// Get cart of a user
router.get('/users/:userId/cart', adminController.getUserCart);

/* =======================
   APPROVALS
======================= */

/* =======================
   VENDOR APPROVALS
======================= */

// Get pending vendor requests
router.get(
  '/vendor-requests',
  adminController.getPendingVendorRequests
);

// Approve vendor
router.patch(
  '/vendors/:id/approve',
  adminController.approveVendor
);

// Reject vendor
router.patch(
  '/vendors/:id/reject',
  adminController.rejectVendor
);

// Approve product
router.post(
  '/products/:id/approve',
  adminController.approveProduct
);

// Reject product
router.post(
  '/products/:id/reject',
  adminController.rejectProduct
);

/* =======================
   CATEGORY REQUESTS (Vendor ke category requests)
======================= */

// Get all pending category requests
router.get('/category-requests', adminController.getPendingCategoryRequests);

// Get all category requests with optional status filter
router.get('/category-requests/all', adminController.getAllCategoryRequests);

// Approve category request
router.post('/category-requests/:id/approve', adminController.approveCategoryRequest);

// Reject category request
router.post('/category-requests/:id/reject', adminController.rejectCategoryRequest);
module.exports = router;