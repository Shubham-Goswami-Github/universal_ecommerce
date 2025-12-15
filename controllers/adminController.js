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
    const vendors = await User.find({ role: 'vendor' }).select('-password').sort({ createdAt: -1 });
    res.json({ vendors });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET: all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    res.json({ admins });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH: update user active status (block/unblock)
exports.updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (isActive == null) {
      return res.status(400).json({ message: 'isActive is required (true/false)' });
    }

    // prevent admin deleting/blocking themselves? you earlier blocked delete, here we won't block status change
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated',
      user
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
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
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
    const products = await Product.find().populate('vendor', 'name email').sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH: update product active status (show/hide product)
exports.updateProductStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const { isActive } = req.body;

    if (isActive == null) {
      return res.status(400).json({ message: 'isActive is required (true/false)' });
    }

    const product = await Product.findByIdAndUpdate(productId, { isActive }, { new: true }).populate('vendor', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product status updated',
      product
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
    const products = await Product.find({ vendor: vendorId }).populate('vendor', 'name email').sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// CREATE user (admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user', isActive = true } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    // check existing
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      isActive
    });

    // return without password
    const { password: _p, ...safe } = user.toObject();
    res.status(201).json({ message: 'User created', user: safe });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE user (admin) - edit name/email/password/role/isActive
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // check email conflict
      const other = await User.findOne({ email, _id: { $ne: userId } });
      if (other) return res.status(400).json({ message: 'Email already in use by another account' });
      user.email = email;
    }
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const { password: _p, ...safe } = user.toObject();
    res.json({ message: 'User updated', user: safe });
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
    const pendings = await Product.find({ status: 'pending' }).populate('vendor', 'name email').sort({ createdAt: -1 });

    // group by vendor id
    const grouped = {};
    for (const p of pendings) {
      const vId = p.vendor?._id ? p.vendor._id.toString() : 'unknown';
      if (!grouped[vId]) {
        grouped[vId] = {
          vendor: p.vendor ? { _id: p.vendor._id, name: p.vendor.name, email: p.vendor.email } : { _id: null, name: 'Unknown', email: '' },
          products: []
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
    const product = await Product.findById(productId).populate('vendor', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });

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
    const product = await Product.findById(productId).populate('vendor', 'name email');

    if (!product) return res.status(404).json({ message: 'Product not found' });

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
