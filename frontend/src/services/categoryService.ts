const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export interface Category {
  _id: string;
  name: string;
  displayName: {
    en: string;
    so: string;
  };
  color: {
    from: string;
    to: string;
  };
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  displayName: {
    en: string;
    so: string;
  };
  color: {
    from: string;
    to: string;
  };
  order?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

class CategoryService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async getCategories(activeOnly: boolean = true): Promise<{ categories: Category[] }> {
    const response = await fetch(`${API_BASE_URL}/categories/all?activeOnly=${activeOnly}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch categories');
    }

    const data = await response.json();
    return data.data;
  }

  async getCategory(id: string): Promise<{ category: Category }> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch category');
    }

    const data = await response.json();
    return data.data;
  }

  async createCategory(categoryData: CreateCategoryData): Promise<{ category: Category }> {
    const response = await fetch(`${API_BASE_URL}/categories/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    const data = await response.json();
    return data.data;
  }

  async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<{ category: Category }> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }
  }
}

export const categoryService = new CategoryService();

