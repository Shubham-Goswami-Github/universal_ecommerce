// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// requireLogin: must have valid token, sets req.user = { userId, role }
exports.requireLogin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;
    const role = decoded.role || decoded.userRole || decoded.roleName;

    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    req.user = { userId, role };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// optionalAuth: if Authorization header present, decode it and set req.user, otherwise continue
exports.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;
    const role = decoded.role || decoded.userRole || decoded.roleName;
    if (userId) req.user = { userId, role };
  } catch (err) {
    // invalid token -> ignore and continue unauthenticated
    console.warn('optionalAuth: invalid token — continuing as guest');
  }
  return next();
};

// allowRoles: middleware factory
exports.allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
