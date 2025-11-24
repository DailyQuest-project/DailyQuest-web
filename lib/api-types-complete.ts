// API Types - Baseado na especificação completa da API

// ========== Enums ==========
export enum TaskDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD"
}

export enum FrequencyType {
  DAILY = "DAILY",
  WEEKLY_TIMES = "WEEKLY_TIMES",
  SPECIFIC_DAYS = "SPECIFIC_DAYS"
}

export enum TaskType {
  HABIT = "habit",
  TODO = "todo"
}

export enum Theme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system"
}

// ========== Auth & User ==========
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string; // "bearer"
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string; // UUID
  username: string;
  email: string;
  xp: number;
  level: number;
  coins: number;
  theme?: Theme;
  created_at?: string;
  updated_at?: string;
}

// ========== Tasks (Polimórfico) ==========
export interface BaseTask {
  id: string; // UUID
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  task_type: TaskType; // "habit" ou "todo"
  completed: boolean;
  created_at: string;
  updated_at?: string;
  user_id: string;
}

export interface Habit extends BaseTask {
  task_type: TaskType.HABIT;
  frequency_type: FrequencyType;
  frequency_target_times?: number; // Para WEEKLY_TIMES (1-7)
  frequency_days?: number[]; // Para SPECIFIC_DAYS ([0-6], 0=Segunda)
  current_streak: number;
  best_streak: number;
  last_completed_at?: string;
  times_completed_this_week?: number;
}

export interface Todo extends BaseTask {
  task_type: TaskType.TODO;
  deadline?: string; // ISO Format (2025-12-31T23:59:59)
  completed_at?: string;
}

export type Task = Habit | Todo;

// ========== Task Creation/Update ==========
export interface CreateHabitRequest {
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  frequency_type: FrequencyType;
  frequency_target_times?: number; // Obrigatório se WEEKLY_TIMES
  frequency_days?: number[]; // Obrigatório se SPECIFIC_DAYS
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  deadline?: string; // ISO Format
}

export interface UpdateHabitRequest extends Partial<CreateHabitRequest> {}
export interface UpdateTodoRequest extends Partial<CreateTodoRequest> {}

// ========== Task Completion (Check-in) ==========
export interface TaskCompletionInfo {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: string;
  xp_earned: number;
}

export interface StreakInfo {
  current_streak: number;
  best_streak: number;
  last_completed_at?: string;
}

export interface CompleteTaskResponse {
  message: string;
  user: User; // User atualizado com novo XP/Level
  task_completion: TaskCompletionInfo;
  streak_info?: StreakInfo; // Apenas para hábitos
  level_up?: boolean; // Indica se houve level up
  previous_level?: number; // Level anterior (para comparação)
}

// ========== Tags ==========
export interface Tag {
  id: string;
  name: string;
  color: string; // Hexadecimal (ex: #FF0000)
  user_id: string;
  created_at: string;
}

export interface CreateTagRequest {
  name: string;
  color: string;
}

export interface AssociateTagRequest {
  task_id: string;
  tag_id: string;
}

// ========== Dashboard & Gamification ==========
export interface DashboardStats {
  total_xp: number;
  current_level: number;
  total_tasks_completed: number;
  current_streak: number;
  tasks_completed_today?: number;
  tasks_completed_this_week?: number;
  tasks_completed_this_month?: number;
}

export interface CompletionHistoryEntry {
  date: string; // YYYY-MM-DD
  tasks_completed: number;
  xp_earned: number;
}

export interface DashboardHistory {
  entries: CompletionHistoryEntry[];
  total_days: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji ou URL
  unlocked_at?: string;
  progress?: number; // 0-100 (porcentagem)
  target?: number; // Meta para desbloquear
}

// ========== Utility Types ==========
export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ========== Frontend-specific Types ==========
export interface FilterOptions {
  difficulty?: TaskDifficulty[];
  task_type?: TaskType[];
  completed?: boolean;
  tag_ids?: string[];
  search?: string;
}

export interface SortOptions {
  field: 'created_at' | 'title' | 'difficulty' | 'deadline';
  order: 'asc' | 'desc';
}

// ========== Validation Helpers ==========
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Segunda' },
  { value: 1, label: 'Terça' },
  { value: 2, label: 'Quarta' },
  { value: 3, label: 'Quinta' },
  { value: 4, label: 'Sexta' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' },
] as const;

export const DIFFICULTY_XP_MAP = {
  [TaskDifficulty.EASY]: 10,
  [TaskDifficulty.MEDIUM]: 20,
  [TaskDifficulty.HARD]: 30,
} as const;

export const LEVEL_XP_REQUIREMENT = 100; // XP necessário por nível

// Helper para calcular progresso de nível
export function calculateLevelProgress(xp: number): {
  currentLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number; // 0-100
} {
  const currentLevel = Math.floor(xp / LEVEL_XP_REQUIREMENT);
  const currentLevelXp = xp % LEVEL_XP_REQUIREMENT;
  const nextLevelXp = LEVEL_XP_REQUIREMENT;
  const progress = (currentLevelXp / nextLevelXp) * 100;

  return {
    currentLevel,
    currentLevelXp,
    nextLevelXp,
    progress,
  };
}

// Helper para validar deadline
export function isValidDeadline(deadline: string): boolean {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  return deadlineDate > now;
}

// Helper para converter dias da semana
export function getDayName(dayIndex: number): string {
  return DAYS_OF_WEEK[dayIndex]?.label || 'Dia inválido';
}
