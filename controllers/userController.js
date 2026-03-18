// controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const Category = require('../models/categoryModel');
const CategoryRequest = require('../models/categoryRequestModel');

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

// POST /api/vendors/request-categories
exports.requestCategories = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { categories, reason } = req.body;

    const user = await User.findById(vendorId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'vendor' || user.vendorApplicationStatus !== 'approved') {
      return res.status(403).json({
        message: 'Only approved vendors can request categories',
      });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        message: 'At least one category is required',
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const uniqueCategoryIds = [...new Set(categories.map(String))];

    const existingCategories = await Category.find({
      _id: { $in: uniqueCategoryIds },
      isActive: true,
    }).select('_id name');

    if (existingCategories.length !== uniqueCategoryIds.length) {
      return res.status(400).json({
        message: 'One or more selected categories are invalid',
      });
    }

    const approvedSet = new Set(
      Array.isArray(user.vendorCategoriesApproved)
        ? user.vendorCategoriesApproved.map((item) =>
            typeof item === 'object' && item !== null && item._id
              ? String(item._id)
              : String(item)
          )
        : []
    );

    const alreadyApproved = uniqueCategoryIds.filter((id) =>
      approvedSet.has(String(id))
    );

    if (alreadyApproved.length > 0) {
      return res.status(400).json({
        message: 'Some selected categories are already approved for this vendor',
      });
    }

    const pendingRequests = await CategoryRequest.find({
      vendor: vendorId,
      status: 'pending',
    }).select('categories');

    const pendingCategorySet = new Set(
      pendingRequests.flatMap((request) =>
        (request.categories || []).map((categoryId) => String(categoryId))
      )
    );

    const alreadyPending = uniqueCategoryIds.filter((id) =>
      pendingCategorySet.has(String(id))
    );

    if (alreadyPending.length > 0) {
      return res.status(400).json({
        message: 'Some selected categories already have a pending request',
      });
    }

    const request = await CategoryRequest.create({
      vendor: vendorId,
      categories: uniqueCategoryIds,
      reason: reason.trim(),
    });

    await User.findByIdAndUpdate(vendorId, {
      $addToSet: {
        vendorCategoriesRequested: { $each: uniqueCategoryIds },
      },
      $pull: {
        vendorCategoriesRejected: { $in: uniqueCategoryIds },
      },
    });

    const populatedRequest = await CategoryRequest.findById(request._id)
      .populate({
        path: 'categories',
        select: 'name type parent',
        populate: { path: 'parent', select: 'name' },
      })
      .populate('vendor', 'name email businessName');

    res.status(201).json({
      message: 'Category request submitted successfully',
      request: populatedRequest,
    });
  } catch (err) {
    console.error('requestCategories error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/vendors/my-category-requests
exports.getMyCategoryRequests = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const requests = await CategoryRequest.find({ vendor: vendorId })
      .populate({
        path: 'categories',
        select: 'name type parent',
        populate: { path: 'parent', select: 'name' },
      })
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error('getMyCategoryRequests error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
