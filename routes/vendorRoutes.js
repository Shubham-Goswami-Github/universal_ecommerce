const express = require('express');
const router = express.Router();
const { getMySalesStats } = require('../controllers/vendorSalesStatsController');
const userController = require('../controllers/userController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');

// Existing route
router.get('/sales-stats', requireLogin, getMySalesStats);

/* =======================
   CATEGORY REQUESTS
======================= */

// Submit category request (vendor)
router.post(
  '/request-categories',
  requireLogin,
  allowRoles('vendor'),
  userController.requestCategories
);

// Get my category requests (vendor)
router.get(
  '/my-category-requests',
  requireLogin,
  allowRoles('vendor'),
  userController.getMyCategoryRequests
);

module.exports = router;
