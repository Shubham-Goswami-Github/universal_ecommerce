const mongoose = require('mongoose');

const vendorStoreSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    storeName: {
      type: String,
      required: true
    },
    logoUrl: {
      type: String,
      default: ''
    },
    bannerImages: [
      {
        type: String
      }
    ],
    description: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    },
    contactPhone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      youtube: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('VendorStore', vendorStoreSchema);
