# universal_ecommerce

# 🛒 Multi-Vendor E-Commerce Platform

A full-stack **Multi-Vendor E-Commerce Web Application** where **vendors can add products**, **admins approve/reject them**, and **users can browse & purchase approved products**.

Built with **React + Tailwind CSS (Frontend)** and **Node.js + Express + MongoDB (Backend)**.

---

## 🚀 Features

### 👤 User
- Browse approved products
- View product details
- Add to cart
- Place orders
- View order history

### 🏪 Vendor
- Vendor registration & login
- Add products (goes for admin approval)
- Edit/delete own products
- View product status (Pending / Approved / Rejected)

### 🛠️ Admin
- Admin dashboard
- Approve / reject vendor products
- Vendor-wise product listing
- Manage users & vendors
- Site settings (logo, theme, homepage text, background, etc.)

---

## 🧩 Tech Stack

### Frontend
- React (Vite / CRA)
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (image uploads)

---


├── 📁 config
│   ├── 📄 cloudinary.js
│   └── 📄 db.js
├── 📁 controllers
│   ├── 📄 addressController.js
│   ├── 📄 adminController.js
│   ├── 📄 authController.js
│   ├── 📄 cartController.js
│   ├── 📄 categoryController.js
│   ├── 📄 orderController.js
│   ├── 📄 productController.js
│   ├── 📄 reviewController.js
│   ├── 📄 siteSettingsController.js
│   ├── 📄 userController.js
│   ├── 📄 vendorSalesStatsController.js
│   ├── 📄 vendorStoreController.js
│   └── 📄 wishlistController.js
├── 📁 frontend
│   ├── 📁 public
│   │   └── 🖼️ vite.svg
│   ├── 📁 src
│   │   ├── 📁 api
│   │   │   └── 📄 axiosClient.js
│   │   ├── 📁 assets
│   │   │   └── 🖼️ react.svg
│   │   ├── 📁 components
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📄 AdminApprovals.jsx
│   │   │   │   ├── 📄 AdminCategories.jsx
│   │   │   │   ├── 📄 AdminProducts.jsx
│   │   │   │   ├── 📄 SettingsForm.jsx
│   │   │   │   ├── 📄 UserLogins.jsx
│   │   │   │   ├── 📄 VendorApprovals.jsx
│   │   │   │   └── 📄 VendorLogins.jsx
│   │   │   ├── 📁 layout
│   │   │   │   ├── 📄 Footer.jsx
│   │   │   │   └── 📄 Navbar.jsx
│   │   │   ├── 📁 product
│   │   │   │   └── 📄 ProductQuickView.jsx
│   │   │   ├── 📁 vendor
│   │   │   │   ├── 📄 ProductForm.jsx
│   │   │   │   ├── 📄 VendorOrders.jsx
│   │   │   │   └── 📄 VendorProductsList.jsx
│   │   │   └── 📄 ProtectedRoute.jsx
│   │   ├── 📁 context
│   │   │   ├── 📄 AuthContext.jsx
│   │   │   └── 📄 ProtectedRoute.jsx
│   │   ├── 📁 pages
│   │   │   ├── 📄 AdminDashboard.jsx
│   │   │   ├── 📄 Cart.jsx
│   │   │   ├── 📄 CategoriesPage.jsx
│   │   │   ├── 📄 CategoryPage.jsx
│   │   │   ├── 📄 Home.jsx
│   │   │   ├── 📄 Login.jsx
│   │   │   ├── 📄 Orders.jsx
│   │   │   ├── 📄 ProductDetails.jsx
│   │   │   ├── 📄 Products.jsx
│   │   │   ├── 📄 Profile.jsx
│   │   │   ├── 📄 Register.jsx
│   │   │   ├── 📄 VendorDashboard.jsx
│   │   │   ├── 📄 VendorStorePage.jsx
│   │   │   └── 📄 Vendors.jsx
│   │   ├── 🎨 App.css
│   │   ├── 📄 App.jsx
│   │   ├── 🎨 index.css
│   │   └── 📄 main.jsx
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 eslint.config.js
│   ├── 🌐 index.html
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.js
│   ├── 📄 tailwind.config.js
│   └── 📄 vite.config.js
├── 📁 middleware
│   ├── 📄 adminProfileUpload.js
│   ├── 📄 authMiddleware.js
│   ├── 📄 permissionMiddleware.js
│   └── 📄 upload.js
├── 📁 models
│   ├── 📄 addressModel.js
│   ├── 📄 cartModel.js
│   ├── 📄 categoryModel.js
│   ├── 📄 orderModel.js
│   ├── 📄 productModel.js
│   ├── 📄 reviewModel.js
│   ├── 📄 siteSettingsModel.js
│   ├── 📄 userModel.js
│   ├── 📄 vendorSalesStatsModel.js
│   ├── 📄 vendorStoreModel.js
│   └── 📄 wishlistModel.js
├── 📁 routes
│   ├── 📄 addressRoutes.js
│   ├── 📄 adminRoutes.js
│   ├── 📄 authRoutes.js
│   ├── 📄 cartRoutes.js
│   ├── 📄 categoryRoutes.js
│   ├── 📄 orderRoutes.js
│   ├── 📄 productRoutes.js
│   ├── 📄 publicVendorRoutes.js
│   ├── 📄 reviewRoutes.js
│   ├── 📄 siteSettingsRoutes.js
│   ├── 📄 uploadRoutes.js
│   ├── 📄 userRoutes.js
│   ├── 📄 vendorRoutes.js
│   ├── 📄 vendorStoreRoutes.js
│   └── 📄 wishlistRoutes.js
├── 📁 scripts
│   ├── 📄 assign-vendor-to-products.js
│   ├── 📄 migrate-set-isActive-true.js
│   └── 📄 migrate-set-status-approved.js
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 index.js
├── ⚙️ package-lock.json
└── ⚙️ package.json
│
├── .env
├── README.md
└── .gitignore


Two Major Commands are : npm run prod:env for MongoDB Atlas
and npm run fullstack:dev For Local MongoDB