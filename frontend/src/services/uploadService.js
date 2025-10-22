import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.100.32:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadService = {
  /**
   * Upload file directly to backend (server-side upload to R2)
   */
  uploadFile: async (file) => {
    console.log('=== FRONTEND UPLOAD DEBUG ===');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('FormData created, sending request...');
    console.log('API base URL:', API_BASE_URL);
    console.log('Request URL:', `${API_BASE_URL}/upload/file`);
    
    try {
      const response = await api.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response);
      console.log('Response data:', response.data);
      console.log('=== FRONTEND UPLOAD SUCCESS ===');
      
      return response.data;
    } catch (error) {
      console.error('=== FRONTEND UPLOAD ERROR ===');
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Validate file before upload
   */
  validateFile: (file) => {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB',
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed',
      };
    }

    return { isValid: true };
  },
};

export default uploadService;
