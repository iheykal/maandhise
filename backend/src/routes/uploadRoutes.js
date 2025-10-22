const express = require('express');
const router = express.Router();
const { uploadFile, generateUploadUrl, deleteFile, refreshImageUrl } = require('../controllers/uploadController');
const R2Service = require('../services/r2Service');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/upload/file
 * @desc    Upload a single file to R2 storage
 * @access  Private (Admin/Superadmin)
 */
router.post('/file', R2Service.getUploadMiddleware('file'), uploadFile);

/**
 * @route   POST /api/upload/presigned-url
 * @desc    Generate presigned URL for direct client upload
 * @access  Private (Admin/Superadmin)
 */
router.post('/presigned-url', generateUploadUrl);

/**
 * @route   DELETE /api/upload/file
 * @desc    Delete a file from R2 storage
 * @access  Private (Admin/Superadmin)
 */
router.delete('/file', deleteFile);

/**
 * @route   POST /api/upload/refresh-url
 * @desc    Generate fresh signed URL for existing file
 * @access  Private (Admin/Superadmin)
 */
router.post('/refresh-url', refreshImageUrl);

module.exports = router;
