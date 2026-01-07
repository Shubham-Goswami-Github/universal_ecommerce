// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/* =====================
   REQUIRE LOGIN
===================== */
exports.requireLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // 🔥 FETCH USER FROM DB
    const user = await User.findById(userId).select(
      'role isActive vendorActive vendorApplicationStatus accountStatus'
    );

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 🔒 GLOBAL BLOCK
    if (user.accountStatus === 'blocked' || user.isActive === false) {
      return res.status(403).json({
        message: 'Account is inactive or blocked',
      });
    }

    req.user = {
      userId: user._id,
      role: user.role,
      isActive: user.isActive,
      vendorActive: user.vendorActive,
      vendorApplicationStatus: user.vendorApplicationStatus,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/* =====================
   OPTIONAL AUTH
===================== */
exports.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;
    const role = decoded.role;

    if (userId) {
      req.user = { userId, role };
    }
  } catch (err) {
    // invalid token → ignore and continue as guest
    console.warn('optionalAuth: invalid token');
  }

  next();
};

/* =====================
   ROLE GUARD
===================== */
exports.allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
