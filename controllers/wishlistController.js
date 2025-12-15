const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    let wishlist = await getOrCreateWishlist(userId);

    const already = wishlist.products.some(
      (p) => p.toString() === productId
    );

    if (!already) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    wishlist = await wishlist.populate('products');

    res.json({
      message: 'Product added to wishlist',
      wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );

    await wishlist.save();
    wishlist = await wishlist.populate('products');

    res.json({
      message: 'Product removed from wishlist',
      wishlist
    });
  } catch (error) {
    console.error('Remove wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my wishlist
exports.getMyWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    let wishlist = await Wishlist.findOne({ user: userId }).populate(
      'products'
    );

    if (!wishlist) {
      return res.json({ products: [] });
    }

    res.json({ wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
