// controllers/categoryController.js
const Category = require('../models/categoryModel');

/**
 * Admin: Create category
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, type, parent, description, image } = req.body;

    if (!name || !type) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and type are required' 
      });
    }

    if (type === 'sub' && !parent) {
      return res.status(400).json({ 
        success: false,
        message: 'Parent category required for sub category' 
      });
    }

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      type,
      parent: type === 'sub' ? parent : null
    });

    if (existingCategory) {
      return res.status(400).json({ 
        success: false,
        message: 'Category with this name already exists' 
      });
    }

    // If sub category, verify parent exists
    if (type === 'sub') {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ 
          success: false,
          message: 'Parent category not found' 
        });
      }
      if (parentCategory.type !== 'super') {
        return res.status(400).json({ 
          success: false,
          message: 'Parent must be a super category' 
        });
      }
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      parent: type === 'sub' ? parent : null,
      description: description?.trim() || '',
      image: image || ''
    });

    res.status(201).json({ 
      success: true,
      message: 'Category created successfully',
      category 
    });

  } catch (err) {
    console.error('createCategory error', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

/**
 * Admin: Create multiple sub-categories at once
 */
exports.createBulkSubCategories = async (req, res) => {
  try {
    const { parent, subCategories } = req.body;

    if (!parent) {
      return res.status(400).json({ 
        success: false,
        message: 'Parent category is required' 
      });
    }

    if (!subCategories || !Array.isArray(subCategories) || subCategories.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'At least one sub-category is required' 
      });
    }

    // Verify parent exists
    const parentCategory = await Category.findById(parent);
    if (!parentCategory || parentCategory.type !== 'super') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid parent category' 
      });
    }

    // Filter valid sub-categories
    const validSubCategories = subCategories.filter(sub => sub.name && sub.name.trim());

    if (validSubCategories.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No valid sub-categories provided' 
      });
    }

    // Create all sub-categories
    const createdCategories = [];
    const errors = [];

    for (const sub of validSubCategories) {
      try {
        // Check if already exists
        const existing = await Category.findOne({
          name: { $regex: new RegExp(`^${sub.name.trim()}$`, 'i') },
          type: 'sub',
          parent: parent
        });

        if (existing) {
          errors.push(`"${sub.name}" already exists`);
          continue;
        }

        const category = await Category.create({
          name: sub.name.trim(),
          type: 'sub',
          parent: parent,
          description: sub.description?.trim() || '',
          image: sub.image || ''
        });

        createdCategories.push(category);
      } catch (err) {
        errors.push(`Failed to create "${sub.name}": ${err.message}`);
      }
    }

    res.status(201).json({ 
      success: true,
      message: `${createdCategories.length} sub-categories created successfully`,
      categories: createdCategories,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('createBulkSubCategories error', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

/**
 * Admin: Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name type')
      .sort({ type: -1, createdAt: 1 });
    
    res.json({ 
      success: true,
      count: categories.length,
      categories 
    });
  } catch (err) {
    console.error('getAllCategories error', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

/**
 * Admin: Get single category by ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate('parent', 'name type');

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    let subCategories = [];
    if (category.type === 'super') {
      subCategories = await Category.find({ parent: id }).sort({ createdAt: 1 });
    }

    res.json({ 
      success: true,
      category,
      subCategories 
    });

  } catch (err) {
    console.error('getCategoryById error', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

/**
 * Admin: Update category
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    // Check if new name already exists
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        type: category.type,
        parent: category.parent
      });

      if (existingCategory) {
        return res.status(400).json({ 
          success: false,
          message: 'Category with this name already exists' 
        });
      }
    }

    // Update fields
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    await category.populate('parent', 'name type');

    res.json({ 
      success: true,
      message: 'Category updated successfully',
      category 
    });

  } catch (err) {
    console.error('updateCategory error', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

/**
 * Admin: Delete category
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    // If super category, delete all sub categories too
    if (category.type === 'super') {
      await Category.deleteMany({ parent: id });
    }

    await Category.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: category.type === 'super' 
        ? 'Category and its sub-categories deleted successfully'
        : 'Category deleted successfully'
    });

  } catch (err) {
    console.error('deleteCategory error', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

/**
 * Public: Get categories for vendor dropdown
 */
exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name')
      .sort({ type: -1, name: 1 });
    
    res.json({ 
      success: true,
      categories 
    });
  } catch (err) {
    console.error('getPublicCategories error', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

/**
 * Public: Get categories hierarchy
 */
exports.getCategoriesHierarchy = async (req, res) => {
  try {
    const superCategories = await Category.find({ 
      type: 'super',
      isActive: true 
    }).sort({ name: 1 });

    const subCategories = await Category.find({ 
      type: 'sub',
      isActive: true 
    }).sort({ name: 1 });

    const hierarchy = superCategories.map(superCat => ({
      _id: superCat._id,
      name: superCat.name,
      description: superCat.description,
      image: superCat.image,
      type: superCat.type,
      subCategories: subCategories.filter(
        sub => sub.parent?.toString() === superCat._id.toString()
      )
    }));

    res.json({ 
      success: true,
      categories: hierarchy 
    });

  } catch (err) {
    console.error('getCategoriesHierarchy error', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};