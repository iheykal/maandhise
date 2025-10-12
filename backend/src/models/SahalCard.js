const mongoose = require('mongoose');

const sahacardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  qrCode: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  membershipFee: {
    type: Number,
    default: 1.00,
    min: [0, 'Membership fee cannot be negative']
  },
  totalSavings: {
    type: Number,
    default: 0.00,
    min: [0, 'Total savings cannot be negative']
  },
  totalTransactions: {
    type: Number,
    default: 0,
    min: [0, 'Total transactions cannot be negative']
  },
  lastUsed: {
    type: Date,
    default: null
  },
  renewalHistory: [{
    renewedAt: {
      type: Date,
      default: Date.now
    },
    fee: {
      type: Number,
      required: true
    },
    validUntil: {
      type: Date,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'cancelled'],
    default: 'active'
  },
  suspensionReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
sahacardSchema.index({ userId: 1 });
sahacardSchema.index({ cardNumber: 1 });
sahacardSchema.index({ validUntil: 1 });
sahacardSchema.index({ status: 1 });

// Virtual for card validity
sahacardSchema.virtual('isValid').get(function() {
  return this.isActive && this.validUntil > new Date() && this.status === 'active';
});

// Virtual for days remaining
sahacardSchema.virtual('daysRemaining').get(function() {
  if (!this.isValid) return 0;
  const now = new Date();
  const diffTime = this.validUntil - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for card status
sahacardSchema.virtual('statusText').get(function() {
  if (this.status === 'suspended') return 'Suspended';
  if (this.status === 'cancelled') return 'Cancelled';
  if (this.validUntil <= new Date()) return 'Expired';
  if (this.daysRemaining <= 30) return 'Expiring Soon';
  return 'Active';
});

// Generate unique card number
sahacardSchema.statics.generateCardNumber = function() {
  const prefix = 'SAHAL';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Create new Sahal Card
sahacardSchema.statics.createCard = async function(userId, membershipFee = 1.00) {
  const cardNumber = this.generateCardNumber();
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1); // Valid for 1 year
  
  const card = new this({
    userId,
    cardNumber,
    qrCode: `SAHAL:${cardNumber}:${userId}`,
    validUntil,
    membershipFee,
    renewalHistory: [{
      renewedAt: new Date(),
      fee: membershipFee,
      validUntil
    }]
  });
  
  return await card.save();
};

// Renew card
sahacardSchema.methods.renew = async function(renewalFee = 0.50) {
  const newValidUntil = new Date();
  newValidUntil.setFullYear(newValidUntil.getFullYear() + 1);
  
  this.validUntil = newValidUntil;
  this.membershipFee += renewalFee;
  this.renewalHistory.push({
    renewedAt: new Date(),
    fee: renewalFee,
    validUntil: newValidUntil
  });
  
  return await this.save();
};

// Update savings
sahacardSchema.methods.addSavings = async function(amount) {
  this.totalSavings += amount;
  this.totalTransactions += 1;
  this.lastUsed = new Date();
  return await this.save();
};

// Suspend card
sahacardSchema.methods.suspend = async function(reason) {
  this.isActive = false;
  this.status = 'suspended';
  this.suspensionReason = reason;
  return await this.save();
};

// Reactivate card
sahacardSchema.methods.reactivate = async function() {
  this.isActive = true;
  this.status = 'active';
  this.suspensionReason = null;
  return await this.save();
};

// Get card statistics
sahacardSchema.methods.getStats = function() {
  return {
    totalSavings: this.totalSavings,
    totalTransactions: this.totalTransactions,
    daysRemaining: this.daysRemaining,
    isValid: this.isValid,
    status: this.statusText,
    lastUsed: this.lastUsed,
    renewalCount: this.renewalHistory.length
  };
};

module.exports = mongoose.model('SahalCard', sahacardSchema);
