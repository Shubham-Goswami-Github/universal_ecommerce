const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');

/* ================================
      USER ROUTES
================================ */
router.post(
  '/checkout',
  requireLogin,
  allowRoles('user'),
  orderController.checkoutFromCart
);

router.get(
  '/my',
  requireLogin,
  allowRoles('user'),
  orderController.getMyOrders
);

router.get(
  '/my/:id',
  requireLogin,
  allowRoles('user'),
  orderController.getMyOrderById
);

/* ================================
      VENDOR ROUTES
================================ */
router.get(
  '/vendor',
  requireLogin,
  allowRoles('vendor', 'admin'),
  orderController.getVendorOrders
);

router.patch(
  '/vendor/:id/status',
  requireLogin,
  allowRoles('vendor', 'admin'),
  orderController.vendorUpdateOrderStatus
);

/* ================================
      ADMIN ROUTES
================================ */
router.get(
  '/admin',
  requireLogin,
  allowRoles('admin'),
  orderController.getAllOrdersAdmin
);

router.patch(
  '/admin/:id',
  requireLogin,
  allowRoles('admin'),
  orderController.adminUpdateOrder
);

module.exports = router;
