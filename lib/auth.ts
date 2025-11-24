// Authentication utilities for DailyQuest

const TOKEN_KEY = 'dailyquest_token'
const USER_KEY = 'dailyquest_user'

export interface AuthUser {
  id: number
  username: string
  email: string
  level: number
  xp: number
  coins: number
  streak: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

// Token management
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

// User data management
export const setUser = (user: AuthUser): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export const getUser = (): AuthUser | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY)
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

// Auth check
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

// Logout
export const logout = (): void => {
  removeToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// Get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken()
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
  return {
    'Content-Type': 'application/json',
  }
}
