const express = require('express');
const router = express.Router();

const vendorStoreController = require('../controllers/vendorStoreController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');

// Vendor: my store
router.get(
  '/my',
  requireLogin,
  allowRoles('vendor', 'admin'),
  vendorStoreController.getMyStore
);

router.post(
  '/my',
  requireLogin,
  allowRoles('vendor', 'admin'),
  vendorStoreController.updateMyStore
);

// Public: store by vendorId
router.get(
  '/public/:vendorId',
  vendorStoreController.getStoreByVendor
);

// Admin: all stores
router.get(
  '/admin/all',
  requireLogin,
  allowRoles('admin'),
  vendorStoreController.getAllStoresAdmin
);

module.exports = router;
