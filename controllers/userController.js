// controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// PATCH /api/users/me
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    // addresses JSON string ko parse karo agar aayi ho
    if (req.body.addresses && typeof req.body.addresses === 'string') {
      try {
        req.body.addresses = JSON.parse(req.body.addresses);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid addresses format' });
      }
    }

    const {
      name,
      mobileNumber,
      alternateMobileNumber,
      gender,
      dateOfBirth,
      addresses,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Name
    if (name !== undefined) {
      user.name = name;
    }

    // Mobile number (unique check)
    if (mobileNumber !== undefined && mobileNumber !== user.mobileNumber) {
      const other = await User.findOne({
        mobileNumber,
        _id: { $ne: userId },
      });
      if (other) {
        return res
          .status(400)
          .json({ message: 'Mobile number already in use' });
      }
      user.mobileNumber = mobileNumber;
    }

    if (alternateMobileNumber !== undefined) {
      user.alternateMobileNumber = alternateMobileNumber;
    }

    if (gender !== undefined) {
      user.gender = gender;
    }

    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }

    // Profile picture (Cloudinary)
    if (req.file) {
      user.profilePicture = req.file.path;
    }

    // Addresses (replace whole array)
    if (addresses !== undefined) {
      if (!Array.isArray(addresses)) {
        return res
          .status(400)
          .json({ message: 'addresses must be an array' });
      }
      user.addresses = addresses;
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: 'Current password is required to set a new password',
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // password ko hata ke safe object bhej raha hoon
    const { password: _p, ...safe } = user.toObject();

    res.json({
      message: 'Profile updated successfully',
      user: safe,
    });
  } catch (err) {
    console.error('updateMe error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};