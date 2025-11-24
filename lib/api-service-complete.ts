// API Service - Implementação completa dos endpoints
import { apiClient, authClient } from './api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Task,
  CreateHabitRequest,
  CreateTodoRequest,
  UpdateHabitRequest,
  UpdateTodoRequest,
  CompleteTaskResponse,
  Tag,
  CreateTagRequest,
  DashboardStats,
  DashboardHistory,
  Achievement,
} from './api-types-complete';

// ========== Authentication & User Service ==========
export const authService = {
  /**
   * Login - POST http://localhost:8080/login/
   * Body: form-data (username, password)
   * Response: { "access_token": "...", "token_type": "bearer" }
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await authClient.post<LoginResponse>('/login/', formData);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Login failed');
    }
    
    return response.data;
  },

  /**
   * Cadastro - POST http://localhost:8000/api/v1/users/
   * Body: { "username": "str", "email": "str", "password": "str" }
   */
  async register(userData: RegisterRequest): Promise<User> {
    console.log('📤 [API] Register request:', {
      url: '/users/',
      data: { ...userData, password: '***' }
    });
    
    const response = await apiClient.post<User>('/users/', userData);
    
    console.log('📥 [API] Register response:', {
      success: !!response.data,
      error: response.error,
      detail: response.detail,
      statusCode: response.statusCode
    });
    
    if (response.error || !response.data) {
      // Criar objeto de erro com detalhes para melhor debugging
      const error: any = new Error(response.error || 'Registration failed');
      error.detail = response.detail;
      error.statusCode = response.statusCode;
      throw error;
    }
    
    return response.data;
  },

  /**
   * Perfil (Me) - GET http://localhost:8000/api/v1/users/me
   * Response: { "id": "uuid", "username": "str", ... }
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to get current user');
    }
    
    return response.data;
  },

  /**
   * Atualizar perfil
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/users/me', updates);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update profile');
    }
    
    return response.data;
  },
};

// ========== Task Service ==========
export const taskService = {
  /**
   * Listar Todas - GET http://localhost:8000/api/v1/tasks/
   * Response: Array de objetos com task_type: "habit" ou "todo"
   */
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks/');
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to get tasks');
    }
    
    return response.data;
  },

  /**
   * Criar Hábito - POST http://localhost:8000/api/v1/tasks/habits/
   */
  async createHabit(habitData: CreateHabitRequest): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks/habits/', habitData);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create habit');
    }
    
    return response.data;
  },

  /**
   * Criar ToDo - POST http://localhost:8000/api/v1/tasks/todos/
   */
  async createTodo(todoData: CreateTodoRequest): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks/todos/', todoData);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create todo');
    }
    
    return response.data;
  },

  /**
   * Editar Hábito - PUT http://localhost:8000/api/v1/tasks/habits/{id}
   */
  async updateHabit(id: string, updates: UpdateHabitRequest): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/habits/${id}`, updates);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update habit');
    }
    
    return response.data;
  },

  /**
   * Editar ToDo - PUT http://localhost:8000/api/v1/tasks/todos/{id}
   */
  async updateTodo(id: string, updates: UpdateTodoRequest): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/todos/${id}`, updates);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update todo');
    }
    
    return response.data;
  },

  /**
   * Deletar Hábito - DELETE http://localhost:8000/api/v1/tasks/habits/{id}
   */
  async deleteHabit(id: string): Promise<void> {
    const response = await apiClient.delete(`/tasks/habits/${id}`);
    
    if (response.error) {
      throw new Error(response.error || 'Failed to delete habit');
    }
  },

  /**
   * Deletar ToDo - DELETE http://localhost:8000/api/v1/tasks/todos/{id}
   */
  async deleteTodo(id: string): Promise<void> {
    const response = await apiClient.delete(`/tasks/todos/${id}`);
    
    if (response.error) {
      throw new Error(response.error || 'Failed to delete todo');
    }
  },

  /**
   * Completar Tarefa - POST http://localhost:8000/api/v1/tasks/{id}/complete
   * Response Rica com user atualizado, xp_earned, streak_info
   */
  async completeTask(id: string): Promise<CompleteTaskResponse> {
    const response = await apiClient.post<CompleteTaskResponse>(
      `/tasks/${id}/complete`
    );
    
    if (response.error || !response.data) {
      // MELHORADO: Criar erro com informações detalhadas
      const error = new Error(response.error || 'Failed to complete task') as any
      error.statusCode = response.statusCode
      error.detail = response.detail
      throw error
    }
    
    return response.data;
  },

  /**
   * Desconcluir Tarefa - DELETE http://localhost:8000/api/v1/tasks/{id}/complete
   * Remove a conclusão de hoje
   */
  async uncompleteTask(id: string): Promise<{ message: string; xp_removed: number }> {
    const response = await apiClient.delete<{ message: string; xp_removed: number }>(`/tasks/${id}/complete`);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to uncomplete task');
    }
    
    return response.data;
  },
};

// ========== Tag Service ==========
export const tagService = {
  /**
   * Listar - GET http://localhost:8000/api/v1/tags/
   */
  async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>('/tags/');
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to get tags');
    }
    
    return response.data;
  },

  /**
   * Criar - POST http://localhost:8000/api/v1/tags/
   */
  async createTag(tagData: CreateTagRequest): Promise<Tag> {
    const response = await apiClient.post<Tag>('/tags/', tagData);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create tag');
    }
    
    return response.data;
  },

  /**
   * Associar - POST http://localhost:8000/api/v1/tasks/{task_id}/tags/{tag_id}
   */
  async associateTag(taskId: string, tagId: string): Promise<void> {
    const response = await apiClient.post(`/tasks/${taskId}/tags/${tagId}`);
    
    if (response.error) {
      throw new Error(response.error || 'Failed to associate tag');
    }
  },

  /**
   * Desassociar tag de uma tarefa
   */
  async removeTag(taskId: string, tagId: string): Promise<void> {
    const response = await apiClient.delete(`/tasks/${taskId}/tags/${tagId}`);
    
    if (response.error) {
      throw new Error(response.error || 'Failed to remove tag');
    }
  },

  /**
   * Filtrar - GET http://localhost:8000/api/v1/tasks/by-tag/{tag_id}
   */
  async getTasksByTag(tagId: string): Promise<Task[]> {
    const response = await apiClient.get<Task[]>(`/tasks/by-tag/${tagId}`);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to get tasks by tag');
    }
    
    return response.data;
  },
};

// ========== Dashboard & Gamification Service ==========
export const dashboardService = {
  /**
   * Stats - GET http://localhost:8000/api/v1/dashboard/
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/dashboard/');
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to get dashboard stats');
    }
    
    return response.data;
  },

  /**
   * Histórico - GET http://localhost:8000/api/v1/dashboard/history
   */
  async getHistory(): Promise<DashboardHistory> {
    const response = await apiClient.get<DashboardHistory>('/dashboard/history');
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to get dashboard history');
    }
    
    return response.data;
  },
};

// ========== Achievement Service ==========
export const achievementService = {
  /**
   * Conquistas - GET http://localhost:8000/api/v1/achievements/me
   */
  async getMyAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>('/achievements/me');
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to get achievements');
    }
    
    return response.data;
  },

  /**
   * Todas as conquistas disponíveis
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>('/achievements/');
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to get all achievements');
    }
    
    return response.data;
  },
};

// Export tudo junto para fácil importação
export const api = {
  auth: authService,
  tasks: taskService,
  tags: tagService,
  dashboard: dashboardService,
  achievements: achievementService,
};

export default api;
