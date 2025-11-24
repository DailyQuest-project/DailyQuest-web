"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/api-service-complete'
import type { User, LoginRequest, RegisterRequest } from '@/lib/api-types-complete'
import { setToken as saveToken, getToken, removeToken, setUser as saveUser, getUser as getSavedUser } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Inicializar usuário do localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      console.log("🔐 [DEBUG] initAuth - Token exists:", !!token)
      
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser()
          console.log("👤 [DEBUG] Current user from API:", currentUser)
          console.log("   - XP:", currentUser.xp, typeof currentUser.xp)
          console.log("   - Level:", currentUser.level, typeof currentUser.level)
          setUser(currentUser)
        } catch (error) {
          console.error('Failed to get current user:', error)
          removeToken()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      
      // 1. Fazer login e obter token
      const loginResponse = await authService.login(credentials)
      saveToken(loginResponse.access_token)

      // 2. Buscar dados do usuário
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)

      // 3. Salvar no localStorage
      saveUser({
        id: 0, // Temporário - backend usa UUID
        username: currentUser.username,
        email: currentUser.email,
        level: currentUser.level,
        xp: currentUser.xp,
        coins: currentUser.coins,
        streak: 0, // TODO: adicionar ao backend
      })

      toast({
        title: "Login realizado!",
        description: `Bem-vindo de volta, ${currentUser.username}!`,
      })

      router.push('/')
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true)
      
      // 1. Criar conta
      await authService.register(data)

      // 2. Fazer login automático
      await login({
        username: data.username,
        password: data.password,
      })

      toast({
        title: "Conta criada!",
        description: "Sua jornada começa agora!",
      })
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Não foi possível criar a conta",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
    router.push('/login')
    
    toast({
      title: "Logout realizado",
      description: "Até a próxima sessão!",
    })
  }

  const updateUser = (updates: Partial<User>) => {
    console.log("🔄 [DEBUG] updateUser chamado com:", updates)
    console.log("👤 [DEBUG] Usuário atual antes:", user)
    
    if (user) {
      const updatedUser = { ...user, ...updates }
      console.log("👤 [DEBUG] Usuário após merge:", updatedUser)
      setUser(updatedUser)
      
      // Atualizar localStorage
      saveUser({
        id: 0,
        username: updatedUser.username,
        email: updatedUser.email,
        level: updatedUser.level,
        xp: updatedUser.xp,
        coins: updatedUser.coins,
        streak: 0,
      })
      console.log("✅ [DEBUG] Estado do usuário atualizado e salvo no localStorage")
    } else {
      console.warn("⚠️ [DEBUG] updateUser chamado mas user é null!")
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      
      saveUser({
        id: 0,
        username: currentUser.username,
        email: currentUser.email,
        level: currentUser.level,
        xp: currentUser.xp,
        coins: currentUser.coins,
        streak: 0,
      })
    } catch (error) {
      console.error('Failed to refresh user:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
