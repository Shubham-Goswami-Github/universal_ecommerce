const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// USER: Checkout from cart
exports.checkoutFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      paymentMethod
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: 'Shipping address fields are required' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Group items by vendor
    const itemsByVendor = {};

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.vendor || !product.isActive) {
        return res.status(400).json({ message: `Product is not available: ${product ? product.name : 'Unknown'}` });
      }

      const vendorId = product.vendor.toString();

      if (!itemsByVendor[vendorId]) {
        itemsByVendor[vendorId] = [];
      }

      itemsByVendor[vendorId].push({
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity
      });
    }

    const createdOrders = [];

    // For each vendor, create separate order
    for (const vendorId of Object.keys(itemsByVendor)) {
      const vendorItems = itemsByVendor[vendorId];

      let subtotal = 0;
      vendorItems.forEach((it) => {
        subtotal += it.productPrice * it.quantity;
      });

      const shippingFee = 0; // abhi ke liye 0, future me logic dal sakte
      const totalAmount = subtotal + shippingFee;

      const order = await Order.create({
        user: userId,
        vendor: vendorId,
        items: vendorItems.map((it) => ({
          product: it.productId,
          productName: it.productName,
          productPrice: it.productPrice,
          quantity: it.quantity
        })),
        subtotal,
        shippingFee,
        totalAmount,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
        status: 'pending',
        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country: country || 'India'
        }
      });

      createdOrders.push(order);
    }

    // Clear cart after order placed
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Order(s) created successfully',
      orders: createdOrders
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// USER: Get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ user: userId })
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// USER: Get my single order
exports.getMyOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('vendor', 'name email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get my order by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VENDOR: Get orders for this vendor
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const orders = await Order.find({ vendor: vendorId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VENDOR: Update order status (only for his orders)
exports.vendorUpdateOrderStatus = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({ _id: orderId, vendor: vendorId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found for this vendor' });
    }

    order.status = status;

    // delivered + COD => mark paid
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    res.json({
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Vendor update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: Get all orders
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get all orders admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: Update any order status/paymentStatus
exports.adminUpdateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) {
      const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      order.status = status;
    }

    if (paymentStatus) {
      const allowedPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid paymentStatus' });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.json({
      message: 'Order updated by admin',
      order
    });
  } catch (error) {
    console.error('Admin update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
