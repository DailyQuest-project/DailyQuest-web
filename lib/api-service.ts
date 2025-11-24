// API Service Functions
import { apiClient, authClient } from './api-client';
import { setToken, setUser, removeToken, getToken } from './auth';
import type {
  User,
  Task,
  Tag,
  TaskCompletion,
  Achievement,
  DashboardStats,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
} from './api-types';

// Auth Services
export const authService = {
  login: async (credentials: LoginRequest) => {
    // Usar OAuth2 form data
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8001'}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      return { error: error.detail };
    }
    
    const data = await response.json();
    
    // Salvar token
    if (data.access_token) {
      setToken(data.access_token);
      
      // Buscar dados do usuário
      const userResponse = await authService.getCurrentUser();
      if (userResponse.data) {
        setUser(userResponse.data);
      }
    }
    
    return { data };
  },

  register: async (userData: RegisterRequest) => {
    return apiClient.post<User>('/users', userData);
  },

  getCurrentUser: async () => {
    const token = getToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:8001'}/login/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return { error: 'Failed to get user data' };
    }
    
    const data = await response.json();
    return { data };
  },
  
  logout: () => {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};

// Task Services
export const taskService = {
  getTasks: async (taskType?: string) => {
    const endpoint = taskType ? `/tasks?type=${taskType}` : '/tasks';
    return apiClient.get<Task[]>(endpoint);
  },

  getTask: async (taskId: number) => {
    return apiClient.get<Task>(`/tasks/${taskId}`);
  },

  createTask: async (taskData: CreateTaskRequest) => {
    return apiClient.post<Task>('/tasks', taskData);
  },

  updateTask: async (taskId: number, taskData: UpdateTaskRequest) => {
    return apiClient.put<Task>(`/tasks/${taskId}`, taskData);
  },

  deleteTask: async (taskId: number) => {
    return apiClient.delete<void>(`/tasks/${taskId}`);
  },

  completeTask: async (taskId: number) => {
    return apiClient.post<TaskCompletion>(`/task-completions/complete/${taskId}`);
  },
};

// Tag Services
export const tagService = {
  getTags: async () => {
    return apiClient.get<Tag[]>('/tags');
  },

  createTag: async (name: string, color?: string) => {
    return apiClient.post<Tag>('/tags', { name, color });
  },

  deleteTag: async (tagId: number) => {
    return apiClient.delete<void>(`/tags/${tagId}`);
  },
};

// Achievement Services
export const achievementService = {
  getAchievements: async () => {
    return apiClient.get<Achievement[]>('/achievements');
  },

  getUserAchievements: async () => {
    return apiClient.get<Achievement[]>('/achievements/user');
  },
};

// Dashboard Services
export const dashboardService = {
  getStats: async () => {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },

  getHistory: async (days: number = 30) => {
    return apiClient.get<any>(`/dashboard/history?days=${days}`);
  },

  getWeeklyProgress: async () => {
    return apiClient.get<any>('/dashboard/weekly-progress');
  },
};

// Health Check
export const healthCheck = async () => {
  return apiClient.get<{ status: string }>('/health');
};
