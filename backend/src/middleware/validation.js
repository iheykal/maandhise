const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('idNumber')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('ID number must be between 5 and 20 characters'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('role')
    .optional()
    .isIn(['customer', 'company'])
    .withMessage('Role must be either customer or company'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Sahal Card registration validation
const validateSahalCardRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('idNumber')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('ID number must be between 5 and 20 characters'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('paymentMethod')
    .isIn(['card', 'mobile'])
    .withMessage('Payment method must be either card or mobile'),
  
  handleValidationErrors
];

// Company registration validation
const validateCompanyRegistration = [
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  
  body('businessType')
    .isIn([
      'pharmacy', 'supermarket', 'restaurant', 'clothing', 'electronics',
      'beauty', 'healthcare', 'automotive', 'education', 'services', 'other'
    ])
    .withMessage('Invalid business type'),
  
  body('discountRate')
    .isFloat({ min: 1, max: 50 })
    .withMessage('Discount rate must be between 1% and 50%'),
  
  body('branches')
    .isArray({ min: 1 })
    .withMessage('At least one branch is required'),
  
  body('branches.*.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Branch name must be between 2 and 100 characters'),
  
  body('branches.*.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Branch address must be between 5 and 200 characters'),
  
  body('branches.*.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number for branch'),
  
  body('contactInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact email'),
  
  body('contactInfo.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid contact phone number'),
  
  handleValidationErrors
];

// Transaction validation
const validateTransaction = [
  body('companyId')
    .isMongoId()
    .withMessage('Valid company ID is required'),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('discount')
    .isFloat({ min: 0 })
    .withMessage('Discount cannot be negative'),
  
  body('savings')
    .isFloat({ min: 0 })
    .withMessage('Savings cannot be negative'),
  
  body('originalAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Original amount must be greater than 0'),
  
  body('discountRate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount rate must be between 0% and 100%'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'mobile', 'other'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Valid ${paramName} is required`),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isAlpha()
    .withMessage('Sort field must contain only letters'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
  
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (fieldName, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => [
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} is required`
      });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 5MB'
      });
    }

    next();
  }
];

// Update profile validation
const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateSahalCardRegistration,
  validateCompanyRegistration,
  validateTransaction,
  validateObjectId,
  validatePagination,
  validateFileUpload,
  validateProfileUpdate,
  validatePasswordChange
};
