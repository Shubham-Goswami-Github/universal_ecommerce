// controllers/adminController.js

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const bcrypt = require('bcryptjs');

/**
 * USERS
 */

// GET: all users (non-admin filter optional)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET: all vendors
exports.getAllVendors = async (req, res) => {
  try {
   const vendors = await User.find({
  role: 'vendor',
  vendorApplicationStatus: 'approved',
})

      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ vendors });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET: all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// GET: pending vendor requests
exports.getPendingVendorRequests = async (req, res) => {
  try {
    const vendors = await User.find({
      vendorApplicationStatus: 'pending',
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ vendors });
  } catch (error) {
    console.error('Get vendor requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH: approve vendor
exports.approveVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.vendorApplicationStatus !== 'pending') {
      return res
        .status(400)
        .json({ message: 'No pending vendor request' });
    }

    user.role = 'vendor';
    user.vendorApplicationStatus = 'approved';
    user.vendorActive = true;

    await user.save();

    res.json({ message: 'Vendor approved successfully', user });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// PATCH: reject vendor
exports.rejectVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.vendorApplicationStatus = 'rejected';
    user.vendorActive = false;

    await user.save();

    res.json({ message: 'Vendor request rejected', user });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// PATCH: update user active status (block/unblock)
exports.updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (isActive == null) {
      return res
        .status(400)
        .json({ message: 'isActive is required (true/false)' });
    }

    // prevent admin deleting/blocking themselves? you earlier blocked delete, here we won't block status change
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated',
      user,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE: delete user completely
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // prevent admin deleting himself (optional)
    if (userId === req.user.userId) {
      return res
        .status(400)
        .json({ message: 'You cannot delete your own admin account' });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // optionally: clean up related data (products, carts, etc.) — implement as needed

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PRODUCTS (admin-level)
 */

// GET: all products (admin)
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET: pending products grouped by vendor
exports.getPendingGroupedByVendor = async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' })
      .populate('vendor', 'name email')
      .populate('category', 'name parent')
      .sort({ createdAt: -1 });

    // Group by vendor
    const grouped = {};
    products.forEach(product => {
      const vendorId = product.vendor?._id || 'unknown';
      if (!grouped[vendorId]) {
        grouped[vendorId] = {
          vendor: product.vendor,
          products: []
        };
      }
      grouped[vendorId].products.push(product);
    });

    const result = Object.values(grouped);
    res.json({ grouped: result });
  } catch (error) {
    console.error('Get pending grouped error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH: update product active status (show/hide product)
exports.updateProductStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const { isActive } = req.body;

    if (isActive == null) {
      return res
        .status(400)
        .json({ message: 'isActive is required (true/false)' });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true }
    ).populate('vendor', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product status updated',
      product,
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE: delete any product (admin)
exports.deleteProductAdmin = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET: products of a specific vendor
exports.getProductsByVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const products = await Product.find({ vendor: vendorId })
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET: sales stats of a specific vendor
exports.getVendorSalesStats = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const VendorSalesStats = require('../models/vendorSalesStatsModel');
    const stats = await VendorSalesStats.findOne({ vendor: vendorId })
      .populate('productSales.product', 'name images');

    if (!stats) {
      return res.json({
        totalOrders: 0,
        totalProductsSold: 0,
        totalRevenue: 0,
        lastOrderDate: null,
        productSales: [],
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Get vendor sales stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET: admin stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalProducts = await Product.countDocuments();

    res.json({
      totalUsers,
      totalVendors,
      totalProducts,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE user (admin)
exports.createUser = async (req, res) => {
  try {
    // 🔥 Parse addresses string (from form-data) to JSON array
    if (req.body.addresses && typeof req.body.addresses === 'string') {
      try {
        req.body.addresses = JSON.parse(req.body.addresses);
      } catch (e) {
        return res
          .status(400)
          .json({ message: 'Invalid addresses format' });
      }
    }

    const {
      name,
      email,
      password,
      role = 'user',
      accountStatus = 'active',
      isActive = true,

      mobileNumber,
      alternateMobileNumber,
      gender,
      dateOfBirth,
    } = req.body;

    // ✅ BASIC REQUIRED CHECK
    if (!name || !email || !password || !mobileNumber) {
      return res.status(400).json({
        message: 'name, email, password and mobileNumber are required',
      });
    }

    // ✅ EMAIL UNIQUE
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // ✅ MOBILE UNIQUE
    const existingMobile = await User.findOne({ mobileNumber });
    if (existingMobile) {
      return res
        .status(400)
        .json({ message: 'Mobile number already in use' });
    }

    // ✅ PASSWORD HASH
    const hashed = await bcrypt.hash(password, 10);

    // ✅ PROFILE PIC (Cloudinary via middleware)
    let profilePicUrl = '';
    if (req.file) {
      profilePicUrl = req.file.path; // Cloudinary secure_url
    }
      let vendorApplicationStatus = 'none';
let vendorActive = false;

if (role === 'vendor') {
  vendorApplicationStatus = 'approved';
  vendorActive = true;
}

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      accountStatus,
      isActive,

      mobileNumber,
      alternateMobileNumber,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      profilePicture: profilePicUrl,

      // ✅ use parsed req.body.addresses
      addresses: Array.isArray(req.body.addresses)
        ? req.body.addresses
        : [],
    });

    const { password: _p, ...safe } = user.toObject();

    res.status(201).json({
      message: 'User created successfully',
      user: safe,
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE user (admin) - edit name/email/password/role/isActive
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // 🔥 Parse addresses string (from form-data) to JSON array
    if (req.body.addresses && typeof req.body.addresses === 'string') {
      try {
        req.body.addresses = JSON.parse(req.body.addresses);
      } catch (e) {
        return res
          .status(400)
          .json({ message: 'Invalid addresses format' });
      }
    }

    const {
      name,
      email,
      password,
      role,
      isActive,
      accountStatus,

      mobileNumber,
      alternateMobileNumber,
      gender,
      dateOfBirth,
      profilePicture,
      addresses,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // BASIC
    if (name !== undefined) user.name = name;

    if (email !== undefined) {
      const other = await User.findOne({ email, _id: { $ne: userId } });
      if (other) {
        return res.status(400).json({
          message: 'Email already in use by another account',
        });
      }
      user.email = email;
    }

    // CONTACT
    if (mobileNumber !== undefined) {
      const otherMobile = await User.findOne({
        mobileNumber,
        _id: { $ne: userId },
      });
      if (otherMobile) {
        return res
          .status(400)
          .json({ message: 'Mobile number already in use' });
      }
      user.mobileNumber = mobileNumber;
    }

    if (alternateMobileNumber !== undefined) {
      user.alternateMobileNumber = alternateMobileNumber;
    }

    // 🔥 ROLE UPDATE
    if (role !== undefined) {
      user.role = role;

      // 🔥 SMALL LOGIC (AS REQUESTED)
      if (role === 'vendor') {
        user.vendorApplicationStatus = 'approved';
        user.vendorActive = true;
      }

      if (role === 'user') {
        user.vendorActive = false;
      }
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (accountStatus !== undefined) user.accountStatus = accountStatus;

    // PROFILE
    if (gender !== undefined) user.gender = gender;

    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }

    // profile picture (priority to uploaded file)
    if (req.file) {
      user.profilePicture = req.file.path;
    } else if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    // ADDRESS (replace whole array – simple & safe)
    if (addresses !== undefined) {
      if (!Array.isArray(addresses)) {
        return res
          .status(400)
          .json({ message: 'addresses must be an array' });
      }
      user.addresses = addresses;
    }

    // PASSWORD
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const { password: _p, ...safe } = user.toObject();

    res.json({
      message: 'User updated successfully',
      user: safe,
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



/**
 * CARTS
 */

// GET: cart of a specific user
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.json({ message: 'Cart is empty or not found', items: [] });
    }

    res.json({ cart });
  } catch (error) {
    console.error('Get user cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * APPROVALS (grouped by vendor, approve/reject)
 */

// Get pending products grouped by vendor
exports.getPendingGroupedByVendor = async (req, res) => {
  try {
    // find pending products and populate vendor basic info
    const pendings = await Product.find({ status: 'pending' })
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    // group by vendor id
    const grouped = {};
    for (const p of pendings) {
      const vId = p.vendor?._id ? p.vendor._id.toString() : 'unknown';
      if (!grouped[vId]) {
        grouped[vId] = {
          vendor: p.vendor
            ? {
                _id: p.vendor._id,
                name: p.vendor.name,
                email: p.vendor.email,
              }
            : { _id: null, name: 'Unknown', email: '' },
          products: [],
        };
      }
      grouped[vId].products.push(p);
    }

    // convert grouped object to array
    const result = Object.values(grouped);
    res.json({ grouped: result });
  } catch (err) {
    console.error('getPendingGroupedByVendor error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve a product
exports.approveProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate(
      'vendor',
      'name email'
    );
    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    product.status = 'approved';
    product.rejectionReason = '';
    await product.save();

    // Optionally: notify vendor by email / internal notification (TODO)

    res.json({ message: 'Product approved', product });
  } catch (err) {
    console.error('approveProduct error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject a product with reason
exports.rejectProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { reason } = req.body;
    const product = await Product.findById(productId).populate(
      'vendor',
      'name email'
    );

    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    product.status = 'rejected';
    product.rejectionReason = reason || '';
    await product.save();

    // Optionally: notify vendor by email / internal notification (TODO)

    res.json({ message: 'Product rejected', product });
  } catch (err) {
    console.error('rejectProduct error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 