const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', validateProfileUpdate, authController.updateProfile);
router.put('/change-password', validatePasswordChange, authController.changePassword);

module.exports = router;
