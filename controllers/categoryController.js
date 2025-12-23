const Category = require('../models/categoryModel');

/**
 * Admin: Create category
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, type, parent } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    if (type === 'sub' && !parent) {
      return res.status(400).json({ message: 'Parent category required for sub category' });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      parent: type === 'sub' ? parent : null
    });

    res.status(201).json({ category });
  } catch (err) {
    console.error('createCategory error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin: Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Public: Vendor dropdown
 */
exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
