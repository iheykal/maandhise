const Category = require('../models/Category');
const Company = require('../models/Company');

// Get all categories (public - for frontend)
const getCategories = async (req, res) => {
  try {
    const { activeOnly = 'true' } = req.query;
    
    let categories;
    if (activeOnly === 'true') {
      categories = await Category.getActive();
    } else {
      categories = await Category.getAll();
    }

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
};

// Get single category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message
    });
  }
};

// Helper function to format category name into display name
const formatDisplayName = (name) => {
  // Convert slug to readable format: "student-adsl" -> "Student Adsl"
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Create category (Superadmin only)
const createCategory = async (req, res) => {
  try {
    const { name, displayName, color, order } = req.body;

    // Validate required fields - only name is required now
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Auto-generate displayName from name if not provided
    const formattedName = formatDisplayName(name.toLowerCase());
    const finalDisplayName = displayName && displayName.en && displayName.so
      ? { en: displayName.en, so: displayName.so }
      : { en: formattedName, so: formattedName };

    // Use provided color or defaults
    const finalColor = color && color.from && color.to
      ? { from: color.from, to: color.to }
      : { from: 'from-gray-500', to: 'to-gray-600' };

    const category = new Category({
      name: name.toLowerCase(),
      displayName: finalDisplayName,
      color: finalColor,
      order: order || 0,
      isActive: true
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update category (Superadmin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If name is being updated, check for duplicates
    if (updateData.name) {
      const existingCategory = await Category.findOne({ 
        name: updateData.name.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
      updateData.name = updateData.name.toLowerCase();
    }

    // If displayName is being updated, ensure both en and so are provided
    if (updateData.displayName) {
      if (!updateData.displayName.en || !updateData.displayName.so) {
        return res.status(400).json({
          success: false,
          message: 'Both English and Somali display names are required'
        });
      }
    }

    // If color is being updated, ensure both from and to are provided
    if (updateData.color) {
      if (!updateData.color.from || !updateData.color.to) {
        return res.status(400).json({
          success: false,
          message: 'Both color from and to are required'
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category (Superadmin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if any companies are using this category
    const companiesUsingCategory = await Company.countDocuments({ businessType: category.name });
    if (companiesUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${companiesUsingCategory} companies are using this category. Please update or delete those companies first.`
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};

