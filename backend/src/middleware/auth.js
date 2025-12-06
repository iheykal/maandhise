const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Marketer = require('../models/Marketer');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // DEBUG LOGS
    console.log('[AUTH DEBUG] Request:', req.path);
    console.log('[AUTH DEBUG] Auth Header:', authHeader ? 'Present' : 'Missing');
    console.log('[AUTH DEBUG] Token:', token ? token.substring(0, 10) + '...' : 'Missing');
    console.log('[AUTH DEBUG] JWT_SECRET:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + '...' : 'Missing');

    if (!token) {
      console.log('[AUTH DEBUG] No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH DEBUG] Token verified for user:', decoded.userId);

    // Get user or marketer from database
    const mongoose = require('mongoose');
    let userId = decoded.userId;

    try {
      if (typeof userId === 'string') {
        userId = new mongoose.Types.ObjectId(userId);
      }
    } catch (e) {
      console.log('[AUTH DEBUG] Error casting ID:', e.message);
    }

    // First try to find as regular user
    let user = await User.findById(userId);

    if (user) {
      console.log('[AUTH DEBUG] User found:', user.role);
      req.user = user;
      return next();
    }

    // If not found as user, try to find as marketer
    const marketer = await Marketer.findById(userId);

    if (marketer) {
      console.log('[AUTH DEBUG] Marketer found');
      req.marketer = marketer;
      // Also set req.user with marketer profile for compatibility with authorize middleware
      req.user = { ...marketer.toObject(), role: 'marketer' };
      return next();
    }

    // Neither user nor marketer found
    console.log('[AUTH DEBUG] User/Marketer not found by ID:', userId);
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user owns resource or is admin
const authorizeOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin and superadmin can access everything
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = (req, res, next) => {
  // This would typically use express-rate-limit middleware
  // For now, we'll just pass through
  next();
};

// Check if user has active Sahal Card
const requireActiveCard = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const SahalCard = require('../models/SahalCard');
    const card = await SahalCard.findOne({
      userId: req.user._id,
      isActive: true,
      status: 'active'
    });

    if (!card) {
      return res.status(403).json({
        success: false,
        message: 'Active Sahal Card required'
      });
    }

    if (card.validUntil <= new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Sahal Card has expired. Please renew your card.'
      });
    }

    req.sahalCard = card;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking Sahal Card status',
      error: error.message
    });
  }
};

// Company role removed - companies are now independent entities
// This middleware is no longer needed since companies don't require user accounts
const requireVerifiedCompany = async (req, res, next) => {
  return res.status(403).json({
    success: false,
    message: 'Company role no longer exists. Companies are independent entities.'
  });
};

module.exports = {
  authenticateToken,
  authorize,
  authorizeOwnerOrAdmin,
  optionalAuth,
  authRateLimit,
  requireActiveCard,
  requireVerifiedCompany
};
