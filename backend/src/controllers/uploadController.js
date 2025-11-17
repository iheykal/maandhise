const R2Service = require('../services/r2Service');

/**
 * Upload a single file to R2 storage
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { buffer, originalname, mimetype } = req.file;
    
    // Validate file type
    if (!R2Service.isValidImageType(mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images are allowed.'
      });
    }

    // Generate unique filename
    const uniqueFileName = R2Service.generateUniqueFileName(originalname);
    
    // Upload to R2
    const publicUrl = await R2Service.uploadFile(buffer, uniqueFileName, mimetype);

    const responseData = {
      url: publicUrl,
      fileName: uniqueFileName,
      originalName: originalname,
      size: buffer.length,
      type: mimetype
    };

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Check for specific R2 credential errors
    if (error.message.includes('credential') || error.message.includes('credentials')) {
      return res.status(500).json({
        success: false,
        message: 'Cloudflare R2 credentials are not properly configured. Please check your environment variables.',
        error: 'R2 credentials not configured',
        details: 'Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ACCESS_KEY_ID, CLOUDFLARE_SECRET_ACCESS_KEY, and CLOUDFLARE_ENDPOINT in your .env file'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

/**
 * Generate presigned URL for direct client upload
 */
const generateUploadUrl = async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'File name and content type are required'
      });
    }

    // Validate content type
    if (!R2Service.isValidImageType(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images are allowed.'
      });
    }

    const { uploadUrl, publicUrl } = await R2Service.generatePresignedUploadUrl(fileName, contentType);

    res.status(200).json({
      success: true,
      message: 'Upload URL generated successfully',
      data: {
        uploadUrl,
        publicUrl,
        expiresIn: 3600 // 1 hour
      }
    });

  } catch (error) {
    console.error('Generate URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload URL',
      error: error.message
    });
  }
};

/**
 * Delete a file from R2 storage
 */
const deleteFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File URL is required'
      });
    }

    const success = await R2Service.deleteFile(fileUrl);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

/**
 * Generate fresh signed URL for an existing file
 */
const refreshImageUrl = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File URL is required'
      });
    }

    const freshUrl = await R2Service.generateFreshSignedUrl(fileUrl);

    res.status(200).json({
      success: true,
      message: 'Fresh URL generated successfully',
      data: {
        url: freshUrl,
        expiresIn: 7 * 24 * 60 * 60 // 7 days
      }
    });

  } catch (error) {
    console.error('Refresh URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate fresh URL',
      error: error.message
    });
  }
};

/**
 * Proxy image and return as base64 data URL (bypasses CORS)
 */
const proxyImage = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const axios = require('axios');

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File URL is required'
      });
    }

    // First try to get a fresh signed URL
    let imageUrl = fileUrl;
    try {
      imageUrl = await R2Service.generateFreshSignedUrl(fileUrl);
    } catch (e) {
      // If refresh fails, use original URL
      console.warn('Failed to refresh URL, using original:', e);
    }

    // Fetch the image using axios
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    if (!response.data) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const buffer = Buffer.from(response.data);
    const base64 = buffer.toString('base64');
    const contentType = response.headers['content-type'] || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    res.status(200).json({
      success: true,
      data: {
        dataUrl,
        contentType
      }
    });

  } catch (error) {
    console.error('Proxy image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to proxy image',
      error: error.message
    });
  }
};

module.exports = {
  uploadFile,
  generateUploadUrl,
  deleteFile,
  refreshImageUrl,
  proxyImage
};
