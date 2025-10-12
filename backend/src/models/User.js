const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    unique: true,
    trim: true
  },
  photo: {
    type: String,
    default: null
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'company', 'admin'],
    default: 'customer'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // 30 days
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ idNumber: 1 });
userSchema.index({ role: 1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    idNumber: this.idNumber,
    photo: this.photo,
    location: this.location,
    role: this.role,
    isActive: this.isActive,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt
  };
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Add refresh token
userSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push({ token });
  return this.save({ validateBeforeSave: false });
};

// Remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save({ validateBeforeSave: false });
};

// Static method to find by email or idNumber
userSchema.statics.findByEmailOrIdNumber = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { idNumber: identifier }
    ]
  });
};

module.exports = mongoose.model('User', userSchema);
