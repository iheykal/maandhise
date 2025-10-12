const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SahalCard = require('../models/SahalCard');
const Company = require('../models/Company');
const Notification = require('../models/Notification');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

// Register new user
const register = async (req, res) => {
  try {
    const { fullName, email, phone, idNumber, password, location, role = 'customer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmailOrIdNumber(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or ID number already exists'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      phone,
      idNumber,
      password,
      location,
      role
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await user.addRefreshToken(refreshToken);

    // Create welcome notification
    await Notification.createNotification({
      userId: user._id,
      title: 'Welcome to Maandhise Corporate!',
      message: `Welcome ${fullName}! Your account has been created successfully. Get your Sahal Card to start saving!`,
      type: 'success',
      category: 'system',
      actionUrl: '/sahal-card/register',
      actionText: 'Get Sahal Card'
    });

    // If customer, create Sahal Card automatically
    if (role === 'customer') {
      try {
        await SahalCard.createCard(user._id, 1.00);
        
        await Notification.createNotification({
          userId: user._id,
          title: 'Sahal Card Created!',
          message: 'Your Sahal Card has been created automatically. Start saving with our partner businesses!',
          type: 'success',
          category: 'card_expiry',
          actionUrl: '/dashboard/sahal-card',
          actionText: 'View Card'
        });
      } catch (cardError) {
        console.error('Error creating Sahal Card:', cardError);
        // Don't fail registration if card creation fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.profile,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await user.addRefreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.profile,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.some(rt => rt.token === refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      await user.removeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    // Get additional data based on user role
    let additionalData = {};

    if (user.role === 'customer') {
      const sahacard = await SahalCard.findOne({ userId: user._id });
      additionalData.sahalCard = sahacard ? sahacard.getStats() : null;
    } else if (user.role === 'company') {
      const company = await Company.findOne({ userId: user._id });
      additionalData.company = company ? company.getAnalytics() : null;
    }

    res.json({
      success: true,
      data: {
        user: user.profile,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { fullName, phone, location } = req.body;

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.profile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const userWithPassword = await User.findById(user._id).select('+password');
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    // Remove all refresh tokens (force re-login)
    userWithPassword.refreshTokens = [];
    await userWithPassword.save();

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, just return success
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Find user and update password
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    // Remove all refresh tokens
    user.refreshTokens = [];
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
