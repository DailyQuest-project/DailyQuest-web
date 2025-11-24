// API Service - Types and Interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  task_type: 'habit' | 'daily' | 'todo';
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  coin_reward: number;
  is_active: boolean;
  created_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export interface TaskCompletion {
  id: number;
  task_id: number;
  user_id: number;
  completed_at: string;
  xp_earned: number;
  coins_earned: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface DashboardStats {
  total_tasks: number;
  completed_today: number;
  current_streak: number;
  total_xp: number;
  level: number;
  coins: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  task_type: 'habit' | 'daily' | 'todo';
  difficulty: 'easy' | 'medium' | 'hard';
  tag_ids?: number[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_active?: boolean;
}
