const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
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

    // Admin can access everything
    if (req.user.role === 'admin') {
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

// Check if user is verified company
const requireVerifiedCompany = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Company account required'
      });
    }

    const Company = require('../models/Company');
    const company = await Company.findOne({ 
      userId: req.user._id,
      isVerified: true,
      isActive: true
    });

    if (!company) {
      return res.status(403).json({
        success: false,
        message: 'Verified company account required'
      });
    }

    req.company = company;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking company status',
      error: error.message
    });
  }
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
