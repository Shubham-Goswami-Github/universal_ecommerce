const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const VendorStore = require('../models/vendorStoreModel');

// public vendors list
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', isActive: true }).select('name email _id');
    // optionally attach store name/logo
    const enhanced = await Promise.all(vendors.map(async (v) => {
      const store = await VendorStore.findOne({ vendor: v._id });
      return { _id: v._id, name: v.name, email: v.email, storeName: store?.storeName || '', logoUrl: store?.logoUrl || '' };
    }));
    res.json({ vendors: enhanced });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
