// scripts/migrate-set-status-approved.js
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const connectDB = require('../config/db');

async function migrate() {
  await connectDB();
  await Product.updateMany({ status: { $exists: false } }, { $set: { status: 'approved' } });
  console.log('Updated missing status -> approved');
  process.exit();
}

migrate().catch(err => { console.error(err); process.exit(1); });
