// controllers/adminController.js

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const bcrypt = require('bcryptjs');
const Order = require('../models/orderModel');

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
      .populate('vendorCategoriesRequested', 'name')
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

    const { vendorCategoriesApproved } = req.body;

    user.role = 'vendor';
    user.vendorApplicationStatus = 'approved';
    user.vendorActive = true;

    // 🔥 MAIN LOGIC
    user.vendorCategoriesApproved =
      Array.isArray(vendorCategoriesApproved) &&
      vendorCategoriesApproved.length > 0
        ? vendorCategoriesApproved
        : user.vendorCategoriesRequested;

    await user.save();

    const { password: _p, ...safe } = user.toObject();

    res.json({
      message: 'Vendor approved successfully',
      user: {
        ...safe,
        vendorCategoriesApproved: user.vendorCategoriesApproved,
        vendorCategoriesRequested: user.vendorCategoriesRequested,
      },
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// PATCH: reject vendor
// PATCH: reject vendor
exports.rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body; // ⭐ Get rejection reason from request

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.vendorApplicationStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending vendor request' });
    }

    user.vendorApplicationStatus = 'rejected';
    user.vendorActive = false;
    user.vendorRejectionReason = reason || ''; // ⭐ Store rejection reason

    await user.save();

    const { password: _p, ...safe } = user.toObject();

    res.json({ message: 'Vendor request rejected', user: safe });
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
      vendorCategoriesApproved,
      vendorCategoryAccessType,
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

    if (vendorCategoryAccessType !== undefined) {
      user.vendorCategoryAccessType =
        vendorCategoryAccessType === 'all' ? 'all' : 'limited';
    }

    if (vendorCategoriesApproved !== undefined) {
      if (!Array.isArray(vendorCategoriesApproved)) {
        return res
          .status(400)
          .json({ message: 'vendorCategoriesApproved must be an array' });
      }

      user.vendorCategoriesApproved = vendorCategoriesApproved;
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


// GET /api/admin/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { range = '30days' } = req.query;

    const successfulOrderStatuses = ['confirmed', 'shipped', 'delivered'];

    // Calculate date range
    let startDate = new Date();
    switch (range) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '365days':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    startDate.setHours(0, 0, 0, 0);

    // Previous period for comparison
    const previousStartDate = new Date(startDate);
    const periodDiff = new Date() - startDate;
    previousStartDate.setTime(previousStartDate.getTime() - periodDiff);
    const currentEndDate = new Date();

    // Get basic counts
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingOrders,
      pendingApprovals,
      pendingVendorRequests,
      currentUsers,
      previousUsers,
      currentVendors,
      previousVendors,
      currentOrders,
      previousOrders,
      activeUsers,
      activeVendors,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'vendor', vendorApplicationStatus: 'approved' }),
      Product.countDocuments({ status: 'approved' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ status: 'pending' }),
      User.countDocuments({ vendorApplicationStatus: 'pending' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startDate, $lt: currentEndDate } }),
      User.countDocuments({ role: 'user', createdAt: { $lt: startDate } }),
      User.countDocuments({ role: 'vendor', vendorApplicationStatus: 'approved', createdAt: { $gte: startDate, $lt: currentEndDate } }),
      User.countDocuments({ role: 'vendor', vendorApplicationStatus: 'approved', createdAt: { $lt: startDate } }),
      Order.countDocuments({ createdAt: { $gte: startDate, $lt: currentEndDate } }),
      Order.countDocuments({ createdAt: { $lt: startDate } }),
      Order.distinct('user', { createdAt: { $gte: startDate, $lt: currentEndDate } }).then((users) => users.length),
      Order.distinct('vendor', {
        createdAt: { $gte: startDate, $lt: currentEndDate },
        status: { $in: successfulOrderStatuses },
      }).then((vendors) => vendors.length),
    ]);

    // Calculate total revenue
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $in: successfulOrderStatuses } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const currentRevenueAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: successfulOrderStatuses },
          createdAt: { $gte: startDate, $lt: currentEndDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const currentRevenue = currentRevenueAgg[0]?.total || 0;

    // Previous revenue for comparison
    const previousRevenueAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: successfulOrderStatuses },
          createdAt: { $gte: previousStartDate, $lt: startDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const previousRevenue = previousRevenueAgg[0]?.total || 0;

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    };

    const changes = {
      users: calculateChange(currentUsers, previousUsers),
      vendors: calculateChange(currentVendors, previousVendors),
      orders: calculateChange(currentOrders, previousOrders),
      revenue: calculateChange(currentRevenue, previousRevenue),
    };

    // Monthly sales data (last 7 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesChartAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
          status: { $nin: ['cancelled', 'failed'] },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesChart = salesChartAgg.map((item) => ({
      date: monthNames[item._id - 1],
      sales: item.sales,
      orders: item.orders,
    }));

    // User registrations by month
    const userRegAgg = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Process registration data
    const regMap = {};
    userRegAgg.forEach((item) => {
      const month = monthNames[item._id.month - 1];
      if (!regMap[month]) regMap[month] = { date: month, users: 0, vendors: 0 };
      if (item._id.role === 'user') regMap[month].users = item.count;
      if (item._id.role === 'vendor') regMap[month].vendors = item.count;
    });
    const registrationChart = Object.values(regMap);

    // Order status distribution
    const orderStatusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const totalOrdersForPie = orderStatusAgg.reduce((sum, item) => sum + item.count, 0);
    const orderStatusChart = orderStatusAgg.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: Math.round((item.count / totalOrdersForPie) * 100),
    }));

    // Category distribution
    const categoryAgg = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const totalProductsForPie = categoryAgg.reduce((sum, item) => sum + item.count, 0);
    const categoryChart = categoryAgg.map((item) => ({
      name: item._id || 'Uncategorized',
      value: Math.round((item.count / totalProductsForPie) * 100),
    }));

    // Top products by revenue
    const topProductsAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: successfulOrderStatuses },
          createdAt: { $gte: startDate, $lt: currentEndDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.productPrice', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
    ]);

    const topProducts = topProductsAgg.map((item, index) => ({
      id: index + 1,
      name: item.productInfo?.name || 'Unknown Product',
      sales: item.sales,
      revenue: item.revenue,
      image: item.productInfo?.images?.[0] || '',
    }));

    // Top vendors by revenue
    const topVendorsAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: successfulOrderStatuses },
          createdAt: { $gte: startDate, $lt: currentEndDate },
        },
      },
      {
        $group: {
          _id: '$vendor',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorInfo',
        },
      },
      { $unwind: { path: '$vendorInfo', preserveNullAndEmptyArrays: true } },
    ]);

    const topVendors = topVendorsAgg.map((item, index) => ({
      id: index + 1,
      name: item.vendorInfo?.businessName || item.vendorInfo?.name || 'Unknown Vendor',
      orders: item.orders,
      revenue: item.revenue,
    }));

    // Revenue by day of week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDayAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 6)) },
          status: { $in: successfulOrderStatuses },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueByDay = dayNames.map((day, index) => {
      const found = revenueByDayAgg.find((item) => item._id === index + 1);
      return { day, revenue: found?.revenue || 0 };
    });

    // Recent activity
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('user', 'name')
      .lean();

    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    const recentVendorRequests = await User.find({ vendorApplicationStatus: 'pending' })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    const recentProductApprovals = await Product.find({ status: 'approved' })
      .sort({ updatedAt: -1 })
      .limit(2)
      .lean();

    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 60) return `${seconds} sec ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const recentActivity = [];

    recentOrders.forEach((order) => {
      recentActivity.push({
        createdAt: order.createdAt,
        type: 'order',
        title: `New order #${order.orderNumber || order._id.toString().slice(-6).toUpperCase()}`,
        description: `${order.user?.name || 'Customer'} placed an order worth ₹${order.totalAmount}`,
        time: formatTimeAgo(order.createdAt),
      });
    });

    recentUsers.forEach((user) => {
      recentActivity.push({
        createdAt: user.createdAt,
        type: 'user',
        title: 'New user registered',
        description: `${user.email} joined the platform`,
        time: formatTimeAgo(user.createdAt),
      });
    });

    recentVendorRequests.forEach((vendor) => {
      recentActivity.push({
        createdAt: vendor.createdAt,
        type: 'vendor',
        title: 'Vendor application',
        description: `${vendor.name || vendor.email} submitted vendor application`,
        time: formatTimeAgo(vendor.createdAt),
      });
    });

    recentProductApprovals.forEach((product) => {
      recentActivity.push({
        createdAt: product.updatedAt,
        type: 'product',
        title: 'Product approved',
        description: `${product.name} was approved`,
        time: formatTimeAgo(product.updatedAt),
      });
    });

    // Sort by time (most recent first)
    recentActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      meta: {
        range,
        startDate,
        endDate: currentEndDate,
      },
      overview: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        pendingApprovals,
        pendingVendorRequests,
      },
      periodSummary: {
        revenue: currentRevenue,
        orders: currentOrders,
        users: currentUsers,
        vendors: currentVendors,
      },
      quickStats: {
        activeUsers,
        activeVendors,
        avgOrderValue: currentOrders ? Math.round(currentRevenue / currentOrders) : 0,
        rangeRevenue: currentRevenue,
      },
      changes,
      salesChart,
      registrationChart,
      orderStatusChart,
      categoryChart,
      topProducts,
      topVendors,
      revenueByDay,
      recentActivity: recentActivity.slice(0, 6),
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

