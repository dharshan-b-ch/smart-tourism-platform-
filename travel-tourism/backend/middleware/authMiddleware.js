const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact administrator.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    const allowed = roles.map(r => r.toUpperCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access Denied. You do not have permission to access this page.` 
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authenticateUser: protect,
  authorize,
  requireAdmin: [protect, authorize('ADMIN')],
  requireTourist: [protect, authorize('TOURIST')],
  requireGuide: [protect, authorize('GUIDE')],
  requirePhotographer: [protect, authorize('PHOTOGRAPHER')]
};
