// models/userModel.js
const mongoose = require('mongoose');

/* ===============================
   ADDRESS SUB-SCHEMA
================================ */
const addressSchema = new mongoose.Schema(
  {
    addressId: String, // <- simple string hi enough hai. Agar multiple IDs chahiye to array rehne do, but zaroorat nahi.

    fullName: {
      type: String,
      required: true,
    },

    mobileNumber: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    houseNo: {
      type: String,
      required: true,
    },

    streetArea: String,
    landmark: String,

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: 'India',
    },

    addressType: {
      type: String,
      enum: ['home', 'office'],
      default: 'home',
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ===============================
   USER SCHEMA
================================ */
const userSchema = new mongoose.Schema(
  {
    /* ---------- AUTH (DO NOT RENAME) ---------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    /* ---------- ROLE & STATUS ---------- */
    role: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      default: 'user',
    },

    accountStatus: {
      type: String,
      enum: ['active', 'blocked', 'deleted'],
      default: 'active',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ---------- CONTACT ---------- */
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },

    alternateMobileNumber: String,

    /* ---------- PROFILE ---------- */
    profilePicture: {
      type: String, // ✅ single URL string
      default: '',
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },

    dateOfBirth: Date, // ✅ single Date, not array

    /* ---------- ADDRESS ---------- */
    addresses: [addressSchema],
/* ---------- VENDOR FLOW ---------- */
vendorApplicationStatus: {
  type: String,
  enum: ['none', 'pending', 'approved', 'rejected'],
  default: 'none',
},

vendorActive: {
  type: Boolean,
  default: false,
},

    /* ---------- ANALYTICS ---------- */
    totalOrders: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    lastOrderDate: Date, // ✅ single Date
  },
  { timestamps: true },
  
  
  
);



module.exports = mongoose.model('User', userSchema);