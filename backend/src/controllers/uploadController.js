const R2Service = require('../services/r2Service');

/**
 * Upload a single file to R2 storage
 */
const uploadFile = async (req, res) => {
  try {
    console.log('=== UPLOAD CONTROLLER DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request headers:', req.headers);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { buffer, originalname, mimetype } = req.file;
    console.log('File details:', {
      originalname,
      mimetype,
      size: buffer.length,
      bufferType: typeof buffer,
      bufferIsBuffer: Buffer.isBuffer(buffer)
    });
    
    // Validate file type
    if (!R2Service.isValidImageType(mimetype)) {
      console.log('Invalid file type:', mimetype);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images are allowed.'
      });
    }

    // Generate unique filename
    const uniqueFileName = R2Service.generateUniqueFileName(originalname);
    console.log('Generated unique filename:', uniqueFileName);
    
    // Upload to R2
    console.log('Starting R2 upload...');
    const publicUrl = await R2Service.uploadFile(buffer, uniqueFileName, mimetype);
    console.log('R2 upload completed, public URL:', publicUrl);

    const responseData = {
      url: publicUrl,
      fileName: uniqueFileName,
      originalName: originalname,
      size: buffer.length,
      type: mimetype
    };
    
    console.log('Sending response:', responseData);
    console.log('=== UPLOAD CONTROLLER SUCCESS ===');

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: responseData
    });

  } catch (error) {
    console.error('=== UPLOAD CONTROLLER ERROR ===');
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
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

module.exports = {
  uploadFile,
  generateUploadUrl,
  deleteFile
};
