// scripts/assign-vendor-to-products.js
// WARNING: run only if you know which vendor id to assign
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const connectDB = require('../config/db');

async function run(vendorId) {
  await connectDB();
  await Product.updateMany({ vendor: { $exists: false } }, { $set: { vendor: vendorId } });
  console.log('Assigned vendor to products');
  process.exit();
}

run('PUT_VENDOR_ID_HERE').catch(err => { console.error(err); process.exit(1); });
