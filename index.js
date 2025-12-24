// 🔥 ENV MUST BE FIRST
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/siteSettingsRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const vendorStoreRoutes = require('./routes/vendorStoreRoutes');
const publicVendorRoutes = require('./routes/publicVendorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const addressRoutes = require('./routes/addressRoutes');

// Connect DB
connectDB();

const app = express();

// CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// ⚠️ OPTIONAL: You can REMOVE this if only using Cloudinary
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vendor-store', vendorStoreRoutes);
app.use('/api/public', publicVendorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/addresses', addressRoutes);

// Health checks
app.get('/', (req, res) => {
  res.send('Ecommerce API is running 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
