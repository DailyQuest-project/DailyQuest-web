// API Client Configuration
import { getToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8080/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  detail?: string; // Para erros do FastAPI
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Adicionar token de autenticação se disponível
    const token = getToken()
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    }
    
    // Não adicionar Content-Type se for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Se erro 401, redirecionar para login
        if (response.status === 401 && typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        return {
          error: errorData.detail || errorData.message || `Error: ${response.status}`,
          detail: errorData.detail,
        };
      }
        return {
          error: errorData.detail || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Singleton instances
export const apiClient = new ApiClient(API_BASE_URL);
export const authClient = new ApiClient(AUTH_BASE_URL);

// Helper function to handle authentication
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const getAuthToken = (): string | null => {
  return getToken()
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// Authenticated request wrapper
export const authenticatedRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: unknown
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const options: RequestInit = {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };

  switch (method) {
    case 'GET':
      return apiClient.get<T>(endpoint, options);
    case 'POST':
      return apiClient.post<T>(endpoint, data, options);
    case 'PUT':
      return apiClient.put<T>(endpoint, data, options);
    case 'DELETE':
      return apiClient.delete<T>(endpoint, options);
    case 'PATCH':
      return apiClient.patch<T>(endpoint, data, options);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};
