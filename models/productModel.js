const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: { type: String, required: true }, // Product Name
    shortTitle: { type: String }, // Display name
    brandName: { type: String },

    sku: { type: String, required: true }, // unique per vendor
    productCode: { type: String, unique: true }, // auto generated

    productType: {
      type: String,
      enum: ['physical', 'digital', 'service'],
      default: 'physical',
    },

    countryOfOrigin: String,
    hsnCode: String,

    /* ================= CATEGORY ================= */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    /* ================= PRICING ================= */
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },

    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
    },
    discountValue: Number,

    finalPrice: { type: Number, required: true },

    gstApplicable: { type: Boolean, default: false },
    gstPercentage: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      default: 0,
    },

    taxInclusive: { type: Boolean, default: true },

    /* ================= STOCK ================= */
    totalStock: { type: Number, default: 0 },
    lowStockAlertQty: { type: Number, default: 5 },

    stockStatus: {
      type: String,
      enum: ['in_stock', 'out_of_stock'],
      default: 'in_stock',
    },

    allowBackorders: { type: Boolean, default: false },
    maxPurchaseQty: { type: Number, default: 5 },
    minPurchaseQty: { type: Number, default: 1 },

    /* ================= DESCRIPTIONS ================= */
    shortDescription: String,
    fullDescription: String, // HTML allowed

    keyFeatures: [String],
    usageInstructions: String,
    careInstructions: String,
    boxContents: String,

    /* ================= RETURNS & WARRANTY ================= */
    returnAvailable: { type: Boolean, default: false },
    returnDays: Number,

    replacementAvailable: { type: Boolean, default: false },

    warrantyAvailable: { type: Boolean, default: false },
    warrantyPeriod: String,
    warrantyType: {
      type: String,
      enum: ['brand', 'seller'],
    },

    /* ================= MEDIA ================= */
    images: [{ type: String }],

    /* ================= META / ANALYTICS ================= */
    totalViews: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },



    availabilityStatus: {
  type: String,
  enum: ['available', 'out_of_stock', 'coming_soon'],
  default: 'available',
},

    /* ================= SYSTEM ================= */
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    isActive: { type: Boolean, default: true },

    rejectionReason: String,
  },
  { timestamps: true }
);

/* 🔥 AUTO PRODUCT CODE */
productSchema.pre('save', async function () {
  if (!this.productCode) {
    this.productCode = 'PRD-' + Date.now();
  }

  if (!this.sku) {
    this.sku = `SKU-${this.vendor}-${Date.now()}`;
  }
});


module.exports = mongoose.model('Product', productSchema);
