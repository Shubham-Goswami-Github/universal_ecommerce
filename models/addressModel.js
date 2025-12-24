const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

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

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
