const mongoose = require('mongoose');

const productSalesSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    productName: String,

    totalQuantitySold: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const vendorSalesStatsSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true,
    },

    /* ================= OVERALL STATS ================= */
    totalOrders: {
      type: Number,
      default: 0,
    },

    totalProductsSold: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    /* ================= PER PRODUCT ================= */
    productSales: [productSalesSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'VendorSalesStats',
  vendorSalesStatsSchema
);
