const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const path = require('path');

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: process.env.CLOUDFLARE_REGION || 'auto',
  endpoint: process.env.CLOUDFLARE_ENDPOINT || `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME || 'maandhise';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

class R2Service {
  /**
   * Upload a file to R2 storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - File name
   * @param {string} contentType - MIME type
   * @returns {Promise<string>} - Public URL of uploaded file
   */
  static async uploadFile(fileBuffer, fileName, contentType) {
    try {
      console.log('=== R2 UPLOAD DEBUG ===');
      console.log('File name:', fileName);
      console.log('Content type:', contentType);
      console.log('File buffer size:', fileBuffer.length);
      console.log('Bucket name:', BUCKET_NAME);
      console.log('R2 endpoint:', process.env.CLOUDFLARE_ENDPOINT || `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`);
      
      const key = `uploads/${Date.now()}-${fileName}`;
      console.log('Generated key:', key);
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read', // Make file publicly accessible
      });

      console.log('Sending command to R2...');
      const result = await s3Client.send(command);
      console.log('R2 upload result:', result);
      
      // Generate signed URL for private bucket access
      // This works with the upload account and provides secure access
      const getObjectCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      
      // Generate signed URL that expires in 7 days (maximum allowed)
      const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { 
        expiresIn: 7 * 24 * 60 * 60 // 7 days (maximum allowed)
      });
      
      console.log('Generated signed URL:', signedUrl);
      console.log('=== R2 UPLOAD SUCCESS ===');
      
      return signedUrl;
    } catch (error) {
      console.error('=== R2 UPLOAD ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error statusCode:', error.statusCode);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete a file from R2 storage
   * @param {string} fileUrl - Public URL of the file
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteFile(fileUrl) {
    try {
      // Extract key from URL
      const urlParts = fileUrl.split('/');
      const key = urlParts.slice(-2).join('/'); // Get 'uploads/filename'
      
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      return false;
    }
  }

  /**
   * Generate a presigned URL for file upload (for direct client uploads)
   * @param {string} fileName - File name
   * @param {string} contentType - MIME type
   * @returns {Promise<{uploadUrl: string, publicUrl: string}>}
   */
  static async generatePresignedUploadUrl(fileName, contentType) {
    try {
      const key = `uploads/${Date.now()}-${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const bucketName = BUCKET_NAME;
      const publicUrl = `https://pub-${accountId}.r2.dev/${bucketName}/${key}`;
      
      return { uploadUrl, publicUrl };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Generate a fresh signed URL for an existing file
   * @param {string} fileUrl - Existing file URL
   * @returns {Promise<string>} - Fresh signed URL
   */
  static async generateFreshSignedUrl(fileUrl) {
    try {
      // Extract key from URL
      const urlParts = fileUrl.split('/');
      const key = urlParts.slice(-2).join('/'); // Get 'uploads/filename'
      
      const getObjectCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      
      // Generate fresh signed URL that expires in 7 days
      const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { 
        expiresIn: 7 * 24 * 60 * 60 // 7 days
      });
      
      return signedUrl;
    } catch (error) {
      console.error('Error generating fresh signed URL:', error);
      throw new Error('Failed to generate fresh URL');
    }
  }

  /**
   * Get multer middleware for file uploads
   * @param {string} fieldName - Form field name
   * @returns {Function} - Multer middleware
   */
  static getUploadMiddleware(fieldName = 'file') {
    return upload.single(fieldName);
  }

  /**
   * Validate file type
   * @param {string} mimetype - MIME type
   * @returns {boolean}
   */
  static isValidImageType(mimetype) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(mimetype);
  }

  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @returns {string} - Unique filename
   */
  static generateUniqueFileName(originalName) {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${name}-${timestamp}-${random}${ext}`;
  }
}

module.exports = R2Service;
