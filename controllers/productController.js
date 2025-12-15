// controllers/productController.js
const Product = require('../models/productModel');

/**
 * Create product (vendor)
 * req.user must be set by requireLogin middleware
 */
exports.createProduct = async (req, res) => {
  try {
    const vendorId = req.user?.userId;
    if (!vendorId) return res.status(401).json({ message: 'Authentication required' });

    const { name, description = '', price = 0, category = '', images = [], stock = 0 } = req.body;

    if (!name || Number.isNaN(Number(price))) {
      return res.status(400).json({ message: 'Name and valid price are required' });
    }

    const product = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: Number(price),
      category: String(category).trim(),
      images: Array.isArray(images) ? images : [],
      stock: Number(stock) || 0,
      vendor: vendorId,
      status: 'pending', // pending until admin approves
      isActive: true,
      rejectionReason: ''
    });

    res.status(201).json({ message: 'Product created and sent for approval', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update product (vendor or admin)
 * - vendor may edit only own product; admin can edit any
 * - vendor edits push status back to 'pending'
 */
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Authorization: vendor can edit only own product
    if (userRole === 'vendor' && product.vendor?.toString() !== userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Prevent vendor change from request body
    const updates = { ...req.body };
    delete updates.vendor; // don't allow changing vendor

    // sanitize numeric fields
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

    // apply updates
    Object.keys(updates).forEach((k) => {
      product[k] = updates[k];
    });

    // If vendor edited (not admin), push back to pending
    if (userRole === 'vendor') {
      product.status = 'pending';
      product.rejectionReason = '';
    }

    await product.save();
    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete product (vendor or admin)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    // find the product (use findById to check ownership)
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // If vendor, ensure they own the product
    if (userRole === 'vendor' && product.vendor?.toString() !== userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // perform delete using findByIdAndDelete
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return res.status(500).json({ message: 'Delete failed' });
    }

    // OPTIONAL: cleanup uploaded images if stored on disk/cloud (not implemented)

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Vendor: get my products (all statuses)
 */
exports.getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user?.userId;
    if (!vendorId) return res.status(401).json({ message: 'Authentication required' });

    const products = await Product.find({ vendor: vendorId }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Public: get products list (only approved)
 */
exports.getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved', isActive: true }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Get public products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Public product details: approved only. But if request includes authenticated user (optionalAuth middleware),
 * then admin or vendor-owner can view non-approved products as well.
 */
exports.getPublicProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate('vendor', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // If it's approved -> anyone can view
    if (product.status === 'approved') {
      return res.json({ product });
    }

    // If not approved, only vendor-owner or admin can view.
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (userId && (role === 'admin' || product.vendor?.toString() === userId)) {
      return res.json({ product });
    }

    return res.status(403).json({ message: 'Product not available' });
  } catch (err) {
    console.error('Get product details error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
