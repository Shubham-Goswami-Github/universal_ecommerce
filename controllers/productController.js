const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

/**
 * ================================
 * CREATE PRODUCT (VENDOR)
 * ================================
 */
exports.createProduct = async (req, res) => {
  try {
    const vendorId = req.user?.userId;
    if (!vendorId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const {
      name,
      description = '',
      price,
      category,
      stock = 0,
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        message: 'Name, price and category are required',
      });
    }

    if (Number.isNaN(Number(price))) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // 🔥 CLOUDINARY IMAGES
    const images = req.files?.map((file) => file.path) || [];

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      images,
      stock: Number(stock) || 0,
      vendor: vendorId,
      status: 'pending',
      isActive: true,
      rejectionReason: '',
    });

    return res.status(201).json({
      message: 'Product created and sent for approval',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * ================================
 * UPDATE PRODUCT (VENDOR / ADMIN)
 * ================================
 */
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // vendor can edit only own product
    if (role === 'vendor' && product.vendor.toString() !== userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const updates = { ...req.body };

    // vendor field protected
    delete updates.vendor;

    // sanitize price
    if (updates.price !== undefined) {
      if (Number.isNaN(Number(updates.price))) {
        return res.status(400).json({ message: 'Invalid price' });
      }
      updates.price = Number(updates.price);
    }

    // sanitize stock
    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock) || 0;
    }

    // validate category
    if (updates.category) {
      if (!mongoose.Types.ObjectId.isValid(updates.category)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const categoryExists = await Category.findById(updates.category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // 🔥 APPLY FIELD UPDATES
    Object.keys(updates).forEach((key) => {
      product[key] = updates[key];
    });

    // 🔥 ADD NEW CLOUDINARY IMAGES
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      product.images.push(...newImages);
    }

    // vendor edit → pending again
    if (role === 'vendor') {
      product.status = 'pending';
      product.rejectionReason = '';
    }

    await product.save();

    return res.json({
      message: 'Product updated',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * ================================
 * DELETE PRODUCT (VENDOR / ADMIN)
 * ================================
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (role === 'vendor' && product.vendor.toString() !== userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    await Product.findByIdAndDelete(productId);

    return res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * ================================
 * VENDOR: MY PRODUCTS
 * ================================
 */
exports.getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user?.userId;
    if (!vendorId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const products = await Product.find({ vendor: vendorId })
      .populate({
        path: 'category',
        select: 'name type parent',
        populate: {
          path: 'parent',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 });

    return res.json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * ================================
 * PUBLIC: APPROVED PRODUCTS
 * ================================
 */
exports.getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: 'approved',
      isActive: true,
    })
      .populate({
        path: 'category',
        select: 'name type parent',
        populate: {
          path: 'parent',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 });

    return res.json({ products });
  } catch (error) {
    console.error('Get public products error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * ================================
 * PRODUCT DETAILS
 * ================================
 */
exports.getPublicProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId)
      .populate('vendor', 'name email')
      .populate({
        path: 'category',
        select: 'name type parent',
        populate: {
          path: 'parent',
          select: 'name',
        },
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status === 'approved') {
      return res.json({ product });
    }

    const userId = req.user?.userId;
    const role = req.user?.role;

    if (userId && (role === 'admin' || product.vendor.toString() === userId)) {
      return res.json({ product });
    }

    return res.status(403).json({ message: 'Product not available' });
  } catch (error) {
    console.error('Get product details error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
