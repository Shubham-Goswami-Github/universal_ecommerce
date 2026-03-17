const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel'); // ⭐ ADD THIS

const toTrimmedString = (value) =>
  typeof value === 'string' ? value.trim() : value;

const parseBoolean = (value) => value === true || value === 'true';

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseKeyFeatures = (value) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const calculateFinalPrice = ({
  sellingPrice,
  discountType,
  discountValue,
  gstApplicable,
  gstPercentage,
  taxInclusive,
}) => {
  let finalPrice = parseNumber(sellingPrice);

  if (discountType === 'percentage') {
    finalPrice -= (finalPrice * parseNumber(discountValue)) / 100;
  }

  if (discountType === 'flat') {
    finalPrice -= parseNumber(discountValue);
  }

  if (gstApplicable && !taxInclusive) {
    finalPrice += (finalPrice * parseNumber(gstPercentage)) / 100;
  }

  return Math.max(0, finalPrice);
};

const hasAllowedAllAccess = (approvedCategories = []) =>
  Array.isArray(approvedCategories) &&
  approvedCategories.some((value) => value?.toString() === 'AllowedAll');

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

    const user = await User.findById(vendorId);

    const {
      name,
      description = '',
      category,

      shortTitle,
      brandName,
      productType,
      countryOfOrigin,
      hsnCode,

      mrp,
      sellingPrice,
      discountType,
      discountValue,
      gstApplicable,
      gstPercentage,
      taxInclusive,

      totalStock,
      lowStockAlertQty,
      allowBackorders,
      maxPurchaseQty,
      minPurchaseQty,

      fullDescription,
      keyFeatures,

      returnAvailable,
      returnDays,
      warrantyAvailable,
      warrantyPeriod,
      warrantyType,
    } = req.body;

    if (!name || !sellingPrice || !category) {
      return res.status(400).json({
        message: 'Name, selling price and category are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // 🔥 FINAL CATEGORY PERMISSION CHECK
    if (!user.vendorCategoriesApproved || user.vendorCategoriesApproved.length === 0) {
      return res.status(403).json({
        message: 'No approved categories. Please wait for admin approval.',
      });
    }

    const isAllowed =
      hasAllowedAllAccess(user.vendorCategoriesApproved) ||
      user.vendorCategoriesApproved
        .map((id) => id.toString())
        .includes(category);

    if (!isAllowed) {
      return res.status(403).json({
        message: 'You are not allowed to post in this category',
      });
    }

    const finalPrice = calculateFinalPrice({
      sellingPrice,
      discountType,
      discountValue,
      gstApplicable: gstApplicable === 'true',
      gstPercentage,
      taxInclusive: taxInclusive === 'true',
    });

    const images = req.files?.map((file) => file.path) || [];
    const hasWarranty = warrantyAvailable === 'true' || warrantyAvailable === true;

    const product = await Product.create({
      name: name.trim(),
      shortTitle,
      brandName,
      productType,
      countryOfOrigin,
      hsnCode,

      shortDescription: description.trim(),
      fullDescription,
      keyFeatures: parseKeyFeatures(keyFeatures) || [],

      mrp: parseNumber(mrp),
      sellingPrice: parseNumber(sellingPrice),
      discountType,
      discountValue: parseNumber(discountValue),
      finalPrice,

      gstApplicable: gstApplicable === 'true',
      gstPercentage: parseNumber(gstPercentage),
      taxInclusive: taxInclusive === 'true',

      totalStock: parseNumber(totalStock),
      lowStockAlertQty: parseNumber(lowStockAlertQty),
      allowBackorders: allowBackorders === 'true',
      maxPurchaseQty: parseNumber(maxPurchaseQty, 1),
      minPurchaseQty: parseNumber(minPurchaseQty, 1),

      returnAvailable: returnAvailable === 'true',
      returnDays: parseNumber(returnDays),
      warrantyAvailable: hasWarranty,
      warrantyPeriod: hasWarranty ? warrantyPeriod : undefined,
      warrantyType: hasWarranty ? warrantyType : undefined,

      category,
      images,
      vendor: vendorId,

      sku: `SKU-${vendorId}-${Date.now()}`,
      status: 'pending',
      isActive: true,
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

    if (role === 'vendor' && !req.user.vendorActive) {
      return res.status(403).json({
        message: 'Vendor not active',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (role === 'vendor' && product.vendor.toString() !== String(userId)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const updates = { ...req.body };
    let retainedImages = Array.isArray(product.images) ? [...product.images] : [];

    delete updates.vendor;
    delete updates.productCode;
    delete updates.sku;
    delete updates.price;
    delete updates.stock;

    if (updates.existingImages !== undefined) {
      try {
        retainedImages = Array.isArray(updates.existingImages)
          ? updates.existingImages
          : JSON.parse(updates.existingImages);
      } catch {
        retainedImages = Array.isArray(product.images) ? [...product.images] : [];
      }
    }

    updates.keyFeatures = parseKeyFeatures(updates.keyFeatures);

    delete updates.existingImages;
    delete updates.imagesToDelete;

    if (updates.category) {
      if (!mongoose.Types.ObjectId.isValid(updates.category)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const categoryExists = await Category.findById(updates.category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    const numericFields = [
      'mrp',
      'sellingPrice',
      'discountValue',
      'gstPercentage',
      'totalStock',
      'lowStockAlertQty',
      'maxPurchaseQty',
      'minPurchaseQty',
      'returnDays',
    ];

    numericFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updates[field] = parseNumber(updates[field]);
      }
    });

    const booleanFields = [
      'gstApplicable',
      'taxInclusive',
      'allowBackorders',
      'returnAvailable',
      'replacementAvailable',
      'warrantyAvailable',
      'isActive',
    ];

    booleanFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updates[field] = parseBoolean(updates[field]);
      }
    });

    [
      'name',
      'shortTitle',
      'brandName',
      'countryOfOrigin',
      'hsnCode',
      'shortDescription',
      'fullDescription',
      'usageInstructions',
      'careInstructions',
      'boxContents',
      'warrantyPeriod',
      'discountType',
      'warrantyType',
      'productType',
      'stockStatus',
      'availabilityStatus',
    ].forEach((field) => {
      if (updates[field] !== undefined) {
        updates[field] = toTrimmedString(updates[field]);
      }
    });

    const nextSellingPrice =
      updates.sellingPrice !== undefined ? updates.sellingPrice : product.sellingPrice;
    const nextDiscountType =
      updates.discountType !== undefined ? updates.discountType : product.discountType;
    const nextDiscountValue =
      updates.discountValue !== undefined ? updates.discountValue : product.discountValue;
    const nextGstApplicable =
      updates.gstApplicable !== undefined ? updates.gstApplicable : product.gstApplicable;
    const nextTaxInclusive =
      updates.taxInclusive !== undefined ? updates.taxInclusive : product.taxInclusive;
    const nextGstPercentage =
      updates.gstPercentage !== undefined ? updates.gstPercentage : product.gstPercentage;

    updates.finalPrice = calculateFinalPrice({
      sellingPrice: nextSellingPrice,
      discountType: nextDiscountType,
      discountValue: nextDiscountValue,
      gstApplicable: nextGstApplicable,
      gstPercentage: nextGstPercentage,
      taxInclusive: nextTaxInclusive,
    });

    if (updates.warrantyAvailable === false) {
      updates.warrantyPeriod = undefined;
      updates.warrantyType = undefined;
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        product[key] = updates[key];
      }
    });

    product.images = retainedImages;
    if (req.files?.length) {
      product.images.push(...req.files.map((file) => file.path));
    }

    if (role === 'vendor') {
      product.status = 'pending';
      product.rejectionReason = '';
    }

    await product.save();
    await product.populate({
      path: 'category',
      select: 'name type parent',
      populate: {
        path: 'parent',
        select: 'name',
      },
    });

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

    if (role === 'vendor' && !req.user.vendorActive) {
      return res.status(403).json({
        message: 'Vendor not active',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (role === 'vendor' && product.vendor.toString() !== String(userId)) {
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

    if (userId && (role === 'admin' || product.vendor.toString() === String(userId))) {
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
