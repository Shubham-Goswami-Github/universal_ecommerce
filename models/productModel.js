// models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, default: '' },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  // vendor reference and approval status
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // existing safer default
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  rejectionReason: { type: String, default: '' },

  avgRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
