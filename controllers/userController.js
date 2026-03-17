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
      businessName,
      businessType,
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

    if (businessName !== undefined) {
      user.businessName = businessName;
    }

    if (businessType !== undefined) {
      user.businessType = businessType;
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

// ⭐ POST /api/users/apply-vendor
exports.applyForVendor = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { businessName, businessType } = req.body;

    // Validation
    if (!businessName || !businessName.trim()) {
      return res.status(400).json({ message: 'Business name is required' });
    }

    if (!businessType || !businessType.trim()) {
      return res.status(400).json({ message: 'Business type is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only regular users can apply
    if (user.role !== 'user') {
      return res.status(400).json({
        message: 'Only regular users can apply for vendor status',
      });
    }

    // Check if already pending
    if (user.vendorApplicationStatus === 'pending') {
      return res.status(400).json({
        message: 'You already have a pending vendor application',
      });
    }

    // Check if already approved
    if (user.vendorApplicationStatus === 'approved') {
      return res.status(400).json({
        message: 'Your vendor application is already approved',
      });
    }

    // Update user with vendor application
    user.businessName = businessName.trim();
    user.businessType = businessType.trim();
    user.vendorApplicationStatus = 'pending';
    user.vendorRejectionReason = ''; // Clear any previous rejection reason

    await user.save();

    // Remove password from response
    const { password: _p, ...safe } = user.toObject();

    res.json({
      message: 'Vendor application submitted successfully',
      user: safe,
    });
  } catch (err) {
    console.error('applyForVendor error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
