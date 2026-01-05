// scripts/migrate-set-isActive-true.js
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const connectDB = require('../config/db');

async function migrate() {
  await connectDB();
  await Product.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });
  console.log('Updated missing isActive -> true');
  process.exit();
}

migrate().catch(err => { console.error(err); process.exit(1); });