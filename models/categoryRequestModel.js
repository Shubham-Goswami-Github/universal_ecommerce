// models/categoryRequestModel.js
const mongoose = require('mongoose');

const categoryRequestSchema = new mongoose.Schema(
  {
    // Kaun vendor ne request ki
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Kaun kaun si categories maangi
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],

    // Vendor ne kyun maangi (reason)
    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // Current status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // Admin ka response (especially for rejection)
    adminResponse: {
      type: String,
      trim: true,
      default: '',
    },

    // Kisne process kiya (admin)
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Kab process hua
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CategoryRequest', categoryRequestSchema);