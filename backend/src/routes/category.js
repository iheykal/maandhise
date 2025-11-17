const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Public route - Get categories (no authentication required)
router.get('/all', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// All other routes require authentication and superadmin role
router.use(authenticateToken);
router.use(authorize('superadmin'));

router.post('/create', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;

