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

module.exports = router;  // 👈 YE LINE BILKUL AISI HI HONA CHAHIYE