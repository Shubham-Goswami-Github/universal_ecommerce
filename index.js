// 🔥 ENV MUST BE FIRST
const dotenv = require("dotenv");

dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

// route imports
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/siteSettingsRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const vendorStoreRoutes = require("./routes/vendorStoreRoutes");
const publicVendorRoutes = require("./routes/publicVendorRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const addressRoutes = require("./routes/addressRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const userRoutes = require("./routes/userRoutes");

// Connect DB
connectDB();

const app = express();

/* ======================
   CORS (FIXED 🔥)
====================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173", // ⚠️ extra safety
  "https://universal-ecommerce-org.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests like Postman / mobile apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed for this origin: " + origin));
    },
    credentials: true,
  })
);

/* ======================
   BODY PARSERS
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   STATIC FILES
====================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/vendor-store", vendorStoreRoutes);
app.use("/api/public", publicVendorRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/vendors", vendorRoutes);

/* ======================
   HEALTH CHECKS
====================== */
app.get("/", (req, res) => {
  res.send("Ecommerce API is running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
});

/* ======================
   GLOBAL ERROR HANDLER (IMPROVED 🔥)
====================== */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  // handle CORS error properly
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.message,
  });
});

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});