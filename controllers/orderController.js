
/* ================================
   USER: CHECKOUT FROM CART
================================ */
// controllers/orderController.js

const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');

/* ================================
   USER: CHECKOUT FROM CART
================================ */
exports.checkoutFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      fullName,
      phone,
      alternatePhone,
      email,
      state,
      city,
      locality,
      addressLine1,
      postalCode,
      latitude,
      longitude,
      paymentMethod,
      saveAddress
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ message: 'Required address fields missing' });
    }

    /* ================= GET CART ================= */
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: `
        name images vendor status
        sellingPrice finalPrice mrp
        totalStock stock         // 👈 stock fields select kar rahe hain
      `
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    /* ================= GROUP ITEMS BY VENDOR ================= */
    const itemsByVendor = {};

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({ message: 'Product not found in cart' });
      }

      // PRODUCT MUST BE APPROVED
      if (product.status !== 'approved') {
        return res.status(400).json({
          message: `Product not approved: ${product.name}`
        });
      }

      if (!product.vendor) {
        return res.status(400).json({
          message: `Vendor missing for product: ${product.name}`
        });
      }

      // 🔥 AVAILABLE STOCK CHECK
      const availableStock = Number(product.totalStock ?? product.stock ?? 0);
      const requestedQty = Number(item.quantity || 0);

      if (requestedQty <= 0) {
        return res.status(400).json({
          message: `Invalid quantity for product: ${product.name}`
        });
      }

      if (requestedQty > availableStock) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}. Available: ${availableStock}, Requested: ${requestedQty}`
        });
      }

      // SAFE PRICE RESOLUTION
      const price = Number(
        product.finalPrice ?? product.sellingPrice
      );

      if (isNaN(price)) {
        return res.status(400).json({
          message: `Invalid price for product: ${product.name}`
        });
      }

      const vendorId = product.vendor.toString();

      if (!itemsByVendor[vendorId]) itemsByVendor[vendorId] = [];

      itemsByVendor[vendorId].push({
        productId: product._id,
        productName: product.name,
        productPrice: price, // REQUIRED BY ORDER MODEL
        productImage: product.images?.[0] || '',
        quantity: requestedQty
      });
    }

    /* ================= SHIPPING ADDRESS ================= */
    const shippingAddress = {
      fullName,
      phone,
      alternatePhone,
      email,
      state,
      city,
      locality,
      addressLine1,
      postalCode,
      latitude,
      longitude,
      country: 'India'
    };

    if (saveAddress) {
      await Address.create({
        user: userId,
        ...shippingAddress,
        isDefault: false
      });
    }

    /* ================= CREATE ORDERS ================= */
    const createdOrders = [];

    for (const vendorId of Object.keys(itemsByVendor)) {
      const vendorItems = itemsByVendor[vendorId];

      let subtotal = 0;
      vendorItems.forEach((it) => {
        subtotal += Number(it.productPrice) * Number(it.quantity);
      });

      if (isNaN(subtotal)) {
        return res.status(400).json({ message: 'Subtotal calculation failed' });
      }

      const shippingFee = 0;
      const totalAmount = subtotal + shippingFee;

      const order = await Order.create({
        user: userId,
        vendor: vendorId,

        items: vendorItems.map((it) => ({
          product: it.productId,
          productName: it.productName,
          productPrice: it.productPrice,
          productImage: it.productImage,
          quantity: it.quantity,
          totalPrice: it.productPrice * it.quantity
        })),

        subtotal,
        shippingFee,
        totalAmount,

        paymentMethod: paymentMethod || 'cod',
        paymentStatus: 'pending',
        status: 'pending',

        statusHistory: [
          {
            changedBy: 'vendor',
            previousStatus: 'created',
            newStatus: 'pending',
            previousPaymentStatus: 'created',
            newPaymentStatus: 'pending',
            note: 'Order placed successfully'
          }
        ],

        shippingAddress
      });

      createdOrders.push(order);

      /* ================= UPDATE PRODUCT STOCK ================= */
      // Har vendor item ke liye product stock kam karo
      await Promise.all(
        vendorItems.map((it) =>
          Product.findByIdAndUpdate(
            it.productId,
            {
              $inc: {
                totalStock: -it.quantity, // agar field hai to kam hoga
                stock: -it.quantity       // agar tum 'stock' use karte ho to bhi update
              }
            },
            { new: false }
          )
        )
      );
    }

    /* ================= USER ANALYTICS UPDATE ================= */
    // kitne orders bane (1 user ke checkout se multiple vendor orders ban sakte)
    const ordersCount = createdOrders.length;

    // in sab orders ka total amount sum karo
    const totalSpentIncrement = createdOrders.reduce(
      (sum, ord) => sum + (Number(ord.totalAmount) || 0),
      0
    );

    await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          totalOrders: ordersCount,       // pehle se + naya count
          totalSpent: totalSpentIncrement // pehle se + is checkout ka total
        },
        $set: {
          lastOrderDate: new Date()       // ya createdOrders[0].createdAt
        }
      },
      { new: true }
    );

    /* ================= CLEAR CART ================= */
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Order(s) created successfully',
      orders: createdOrders
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
/* ================================
   USER: MY ORDERS
================================ */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ user: userId })
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================================
   USER: SINGLE ORDER
================================ */
exports.getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId
    })
      .populate('vendor', 'name email')
      .populate('items.product');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================================
   USER: MY STATS
================================ */
exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('totalOrders totalSpent lastOrderDate');
    res.json({
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      lastOrderDate: user.lastOrderDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================================
   VENDOR: GET ORDERS
================================ */
exports.getVendorOrders = async (req, res) => {
   try {
    const orders = await Order.find({ vendor: req.user.userId })
      .populate('user', 'name email mobileNumber profilePicture gender') // 👈 yeh fields add karo
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================================
   VENDOR: UPDATE STATUS / PAYMENT
================================ */
exports.vendorUpdateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, note } = req.body;

    if (!note || note.trim().length < 3) {
      return res.status(400).json({ message: 'Reason / review is mandatory' });
    }

    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const allowedPayments = ['pending', 'paid', 'failed', 'refunded'];

    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user.userId
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (paymentStatus && !allowedPayments.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const prevStatus = order.status;
    const prevPayment = order.paymentStatus;

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    order.vendorNote = note;

    order.statusHistory.push({
      changedBy: 'vendor',
      previousStatus: prevStatus,
      newStatus: order.status,
      previousPaymentStatus: prevPayment,
      newPaymentStatus: order.paymentStatus,
      note: note.trim()
    });

    await order.save();
    res.json({ message: 'Order updated', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================================
   ADMIN: GET ALL ORDERS
================================ */
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================================
   ADMIN: UPDATE ORDER
================================ */
exports.adminUpdateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, note } = req.body;

    if (!note || note.trim().length < 3) {
      return res.status(400).json({ message: 'Admin note is mandatory' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.status;
    const prevPayment = order.paymentStatus;

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    order.statusHistory.push({
      changedBy: 'admin',
      previousStatus: prevStatus,
      newStatus: order.status,
      previousPaymentStatus: prevPayment,
      newPaymentStatus: order.paymentStatus,
      note: note.trim()
    });

    await order.save();
    res.json({ message: 'Order updated by admin', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
