const router = require('express').Router();
const { requireLogin, allowRoles } = require('../middleware/authMiddleware');
const addressController = require('../controllers/addressController');

router.get(
  '/',
  requireLogin,
  allowRoles('user'),
  addressController.getMyAddresses
);

router.post(
  '/',
  requireLogin,
  allowRoles('user'),
  addressController.addAddress
);

router.patch(
  '/default/:id',
  requireLogin,
  allowRoles('user'),
  addressController.setDefaultAddress
);

router.delete(
  '/:id',
  requireLogin,
  allowRoles('user'),
  addressController.deleteAddress
);

module.exports = router;
