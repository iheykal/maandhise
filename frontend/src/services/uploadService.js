import axios from 'axios';

// Get API URL dynamically - use current hostname for custom domains
// Works for both desktop and mobile devices on the same network
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Auto-detect localhost and local network IPs (for mobile devices on same network)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLocalNetwork = hostname.startsWith('192.168.') || hostname.startsWith('10.0.') || hostname.startsWith('172.16.');
    
    // For localhost or local network (including mobile devices on same network)
    if (isLocalhost || isLocalNetwork) {
      // Use the same hostname as the frontend, but port 5000 for backend
      // This allows mobile devices on the same network to access the backend
      return `${window.location.protocol}//${hostname}:5000/api`;
    }
    // Use current hostname for production/custom domains
    return `${window.location.protocol}//${hostname}/api`;
  }
  
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

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
