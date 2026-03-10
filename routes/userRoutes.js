// routes/userRoutes.js
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { requireLogin } = require('../middleware/authMiddleware');
const profileUpload = require('../middleware/adminProfileUpload');

// PATCH /api/users/me  (update logged-in user's profile)
router.patch(
  '/me',
  requireLogin,
  profileUpload.single('profilePicture'),
  userController.updateMe
);

// POST /api/users/apply-vendor (user applies to become vendor)
router.post('/apply-vendor', requireLogin, userController.applyForVendor);

module.exports = router;