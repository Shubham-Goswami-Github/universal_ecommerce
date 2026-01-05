// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 🔹 Multer + Cloudinary middleware (same jo admin me use kar rahe ho)
const profileUpload = require('../middleware/adminProfileUpload');

// POST /api/auth/register  (multipart/form-data)
router.post(
  '/register',
  profileUpload.single('profilePicture'), // 👈 yeh bahut zaroori hai
  authController.register
);

// POST /api/auth/login  (normal JSON)
router.post('/login', authController.login);

module.exports = router;