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
    const { fullName, phone, password, role = 'customer', idNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }
    
    // Check if ID number is already in use
    if (idNumber) {
      const existingIdUser = await User.findOne({ idNumber });
      if (existingIdUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this ID number already exists'
        });
      }
    }

    // Create new user
    // Business partners (company) need admin approval before they can login
    const canLogin = role !== 'company';
    
    const user = new User({
      fullName,
      phone,
      password,
      role,
      canLogin
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
    const { phone, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ phone }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Check if user can login
    if (!user.canLogin) {
      return res.status(403).json({
        success: false,
        message: 'Login is disabled for this account. Please contact an administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
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
    const { fullName, phone } = req.body;

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;

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
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      // Don't reveal if phone exists or not
      return res.json({
        success: true,
        message: 'If the phone number exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send SMS with reset link
    // For now, just return success
    console.log(`Password reset token for ${phone}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If the phone number exists, a password reset link has been sent.'
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

// Create user (Admin only)
const createUser = async (req, res) => {
  try {
    const { fullName, phone, role = 'customer', idNumber, profilePicUrl, idCardImageUrl, registrationDate, amount } = req.body;

    // Check if user already exists with same phone
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }
    
    // Check if ID number is already in use
    if (idNumber) {
      const existingIdUser = await User.findOne({ idNumber });
      if (existingIdUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this ID number already exists'
        });
      }
    }

    // Generate a default password
    const defaultPassword = 'maandhise123';

    // Create new user (admin-created users cannot login)
    // Compute membership months and validUntil
    let membershipMonths = 0;
    let validUntil = null;
    if (amount && Number.isInteger(amount) && amount > 0) {
      membershipMonths = amount;
      const start = registrationDate ? new Date(registrationDate) : new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + membershipMonths);
      validUntil = end;
    }

    const user = new User({
      fullName,
      phone,
      password: defaultPassword,
      role,
      idNumber,
      profilePicUrl,
      membershipMonths,
      validUntil,
      canLogin: false
    });

    await user.save();

    // Create welcome notification
    await Notification.createNotification({
      userId: user._id,
      title: 'Welcome to Maandhise Corporate!',
      message: `Welcome ${fullName}! Your account has been created by an administrator. Get your Sahal Card to start saving!`,
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
        // Don't fail user creation if card creation fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.profile
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      success: false,
      message: 'User creation failed',
      error: error.message
    });
  }
};

// Get all users (Admin only) - excludes superadmin users from the list
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    // Build query - ALWAYS exclude superadmin users from the list for security
    const baseQuery = { role: { $ne: 'superadmin' } };
    
    // Add role filter if specified (but never allow superadmin)
    if (role && role !== 'superadmin') {
      baseQuery.role = role;
    }
    
    // Add search filter if specified
    if (search) {
      baseQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const query = baseQuery;

    console.log('🔍 getAllUsers query:', JSON.stringify(query, null, 2));

    // Get users with pagination
    let users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Double-check: Filter out any superadmin users that might have slipped through
    users = users.filter(user => user.role !== 'superadmin');

    // Get total count
    const total = await User.countDocuments(query);

    console.log('👥 Found users:', users.length, 'Total:', total);
    console.log('📋 User roles:', users.map(u => ({ name: u.fullName, role: u.role })));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const currentUser = req.user;

    // Find the user to update
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent updating superadmin accounts (unless current user is superadmin)
    if (userToUpdate.role === 'superadmin' && currentUser.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can update superadmin accounts'
      });
    }

    // Update allowed fields
    const allowedFields = ['fullName', 'phone', 'idNumber', 'location', 'profilePicUrl', 'idCardImageUrl', 'validUntil', 'membershipMonths', 'canLogin'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        userToUpdate[field] = updateData[field];
      }
    });

    // If role is being updated, validate it
    if (updateData.role && currentUser.role === 'superadmin') {
      userToUpdate.role = updateData.role;
    }

    await userToUpdate.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: userToUpdate.profile
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Prevent self-deletion
    if (currentUser._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Find the user to delete
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of superadmin accounts (unless current user is superadmin)
    if (userToDelete.role === 'superadmin' && currentUser.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can delete superadmin accounts'
      });
    }

    // Delete related data first
    try {
      // Delete user's Sahal Card
      await SahalCard.deleteMany({ userId: userId });
      
      // Delete user's notifications
      await Notification.deleteMany({ userId: userId });
      
      // Delete user's transactions (if any)
      await Transaction.deleteMany({ customerId: userId });
      
      // Delete user's company (if any)
      await Company.deleteMany({ userId: userId });
      
      console.log(`Deleted related data for user: ${userToDelete.fullName}`);
    } catch (relatedDataError) {
      console.error('Error deleting related data:', relatedDataError);
      // Continue with user deletion even if related data deletion fails
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: `User ${userToDelete.fullName} deleted successfully`
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Search user by ID number (Admin only)
const searchUserById = async (req, res) => {
  try {
    const { idNumber } = req.body;
    
    if (!idNumber || !idNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'ID number is required'
      });
    }

    // Find user by ID number
    const user = await User.findOne({ 
      idNumber: idNumber.trim() 
    }).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this ID number'
      });
    }

    res.json({
      success: true,
      message: 'User found',
      user: user
    });

  } catch (error) {
    console.error('Search user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search user',
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
  searchUserById,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser
};
