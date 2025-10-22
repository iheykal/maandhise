import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://maandhise-backend.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('token', accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  fullName: string;
  phone: string;
  idNumber?: string;
  location?: string;
  profilePicUrl?: string;
  role: 'customer' | 'company' | 'admin' | 'superadmin';
  canLogin: boolean;
  membershipMonths?: number;
  validUntil?: string;
  createdAt: string;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  password: string;
  role?: 'customer' | 'company';
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  // Login user
  login: async (phone: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { phone, password });
    return response.data.data; // Extract data from the nested structure
  },

  // Register user
  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data.data; // Extract data from the nested structure
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.data.user;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<void> => {
    await api.post('/auth/resend-verification', { email });
  },

  // Admin functions
  createUser: async (userData: {
    fullName: string;
    phone: string;
    role?: 'customer' | 'company' | 'admin' | 'superadmin';
    idNumber?: string;
    profilePicUrl?: string;
    registrationDate?: string;
    amount?: number;
    validUntil?: string;
  }): Promise<User> => {
    const response = await api.post('/auth/create-user', userData);
    return response.data.data.user;
  },

  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<{ users: User[]; pagination: any }> => {
    const response = await api.get('/auth/users', { params });
    return response.data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/auth/users/${userId}`, userData);
    return response.data.data.user || response.data.data || response.data;
  },
};

export default authService;