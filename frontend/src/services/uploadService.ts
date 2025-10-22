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

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    fileName: string;
    originalName: string;
    size: number;
    type: string;
  };
}

export interface PresignedUrlResponse {
  success: boolean;
  message: string;
  data: {
    uploadUrl: string;
    publicUrl: string;
    expiresIn: number;
  };
}

export const uploadService = {
  /**
   * Upload file directly to backend (server-side upload to R2)
   */
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Generate presigned URL for direct client upload to R2
   */
  generatePresignedUrl: async (fileName: string, contentType: string): Promise<PresignedUrlResponse> => {
    const response = await api.post('/upload/presigned-url', {
      fileName,
      contentType,
    });

    return response.data;
  },

  /**
   * Upload file directly to R2 using presigned URL
   */
  uploadToR2: async (file: File, presignedUrl: string): Promise<void> => {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  /**
   * Delete file from R2 storage
   */
  deleteFile: async (fileUrl: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/upload/file', {
      data: { fileUrl },
    });

    return response.data;
  },

  /**
   * Upload file with progress tracking
   */
  uploadFileWithProgress: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  /**
   * Validate file before upload
   */
  validateFile: (file: File): { isValid: boolean; error?: string } => {
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

  /**
   * Convert file to base64 (for preview)
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

export default uploadService;

