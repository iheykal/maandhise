import axios from 'axios';

// Helper function to get API base URL dynamically
// Works for both desktop and mobile devices on the same network
const getApiBaseUrl = (): string => {
  // Check if environment variable is set
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
  }
  
  // Default: use current hostname (works for custom domains)
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}/api`;
  }
  
  // Fallback for server-side rendering
  return process.env.REACT_APP_API_URL || '/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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

export interface Company {
  _id: string;
  userId: string;
  businessName: string;
  businessType: string;
  description: string;
  discountRate: number;
  logo?: string;
  location?: string;
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  contactInfo?: {
    email: string;
    phone: string;
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  businessName: string;
  businessType: string;
  description: string;
  discountRate: number;
  logo?: string;
  location?: string;
  phone?: string;
  email?: string;
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
}

export const companyService = {
  // Create company
  createCompany: async (data: CreateCompanyData): Promise<{ company: Company }> => {
    try {
      const response = await api.post('/companies/create', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Create company error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all companies (requires authentication - superadmin only)
  getAllCompanies: async (params?: {
    page?: number;
    limit?: number;
    businessType?: string;
    search?: string;
  }): Promise<{
    companies: Company[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> => {
    try {
      const response = await api.get('/companies/all', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Get companies error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get public companies (no authentication required - for display everywhere)
  getPublicCompanies: async (params?: {
    page?: number;
    limit?: number;
    businessType?: string;
    search?: string;
  }): Promise<{
    companies: Company[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> => {
    try {
      // Use a separate axios instance without auth for public endpoint
      // Use the same API base URL logic to work on mobile devices
      const publicApiBaseUrl = getApiBaseUrl();
      console.log('[Public Companies API] Using URL:', publicApiBaseUrl);
      
      const publicApi = axios.create({
        baseURL: publicApiBaseUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      
      const response = await publicApi.get('/companies/public/all', { params });
      console.log('[Public Companies] Full response:', response.data);
      
      // Check response structure
      if (!response.data || !response.data.success) {
        console.error('[Public Companies] Invalid response structure:', response.data);
        throw new Error('Invalid API response');
      }
      
      const data = response.data.data;
      console.log('[Public Companies] Response data:', data);
      console.log('[Public Companies] Companies count:', data?.companies?.length || 0);
      console.log('[Public Companies] Companies:', data?.companies);
      
      if (!data || !data.companies) {
        console.error('[Public Companies] No companies in response');
        return { companies: [], pagination: { current: 1, pages: 0, total: 0 } };
      }
      
      console.log('[Public Companies] Loaded:', data.companies.length, 'companies');
      return data;
    } catch (error: any) {
      console.error('Get public companies error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get single company
  getCompany: async (id: string): Promise<{ company: Company }> => {
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get company error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update company
  updateCompany: async (id: string, data: Partial<CreateCompanyData>): Promise<{ company: Company }> => {
    try {
      const response = await api.put(`/companies/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Update company error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete company
  deleteCompany: async (id: string): Promise<void> => {
    try {
      await api.delete(`/companies/${id}`);
    } catch (error: any) {
      console.error('Delete company error:', error.response?.data || error.message);
      throw error;
    }
  },
};

