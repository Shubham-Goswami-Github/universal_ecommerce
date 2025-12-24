const mongoose = require('mongoose');

/* ================================
   STATUS HISTORY SCHEMA (FIRST)
================================ */
const orderStatusHistorySchema = new mongoose.Schema(
  {
    changedBy: {
      type: String,
      enum: ['vendor', 'admin'],
      required: true,
    },

    previousStatus: {
      type: String,
      required: true,
    },

    newStatus: {
      type: String,
      required: true,
    },

    previousPaymentStatus: {
      type: String,
    },

    newPaymentStatus: {
      type: String,
    },

    note: {
      type: String,
      required: true, // 🔥 mandatory review / reason
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ================================
   ORDER ITEM SCHEMA
================================ */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productImage: {
    type: String,   // 🔥 MUST
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

/* ================================
   SHIPPING ADDRESS
================================ */
const shippingAddressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  alternatePhone: String,
  email: String,

  state: String,
  city: String,
  locality: String,

  addressLine1: String,

  postalCode: String,

  latitude: Number,
  longitude: Number,

  country: {
    type: String,
    default: 'India',
  },
});


/* ================================
   MAIN ORDER SCHEMA
================================ */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [orderItemSchema],

    subtotal: {
      type: Number,
      required: true,
    },

    shippingFee: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    vendorNote: {
      type: String,
      default: '',
    },

    // ✅ COMPLETE STATUS + PAYMENT + COMMENT HISTORY
    statusHistory: [orderStatusHistorySchema],

    shippingAddress: shippingAddressSchema,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
