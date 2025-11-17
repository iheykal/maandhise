const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name (slug) is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Category name must be lowercase alphanumeric with hyphens only']
  },
  displayName: {
    en: {
      type: String,
      trim: true
    },
    so: {
      type: String,
      trim: true
    }
  },
  color: {
    from: {
      type: String,
      default: 'from-gray-500',
      trim: true
    },
    to: {
      type: String,
      default: 'to-gray-600',
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Static method to get active categories
categorySchema.statics.getActive = function() {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

// Static method to get all categories (including inactive)
categorySchema.statics.getAll = function() {
  return this.find({}).sort({ order: 1, name: 1 });
};

module.exports = mongoose.model('Category', categorySchema);

