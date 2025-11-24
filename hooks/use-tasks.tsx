"use client"

import { useState, useCallback } from 'react'
import { taskService } from '@/lib/api-service-complete'
import type {
  Task,
  CreateHabitRequest,
  CreateTodoRequest,
  UpdateHabitRequest,
  UpdateTodoRequest,
  CompleteTaskResponse,
} from '@/lib/api-types-complete'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface UseTasksReturn {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createHabit: (data: CreateHabitRequest) => Promise<Task | null>
  createTodo: (data: CreateTodoRequest) => Promise<Task | null>
  updateHabit: (id: string, data: UpdateHabitRequest) => Promise<Task | null>
  updateTodo: (id: string, data: UpdateTodoRequest) => Promise<Task | null>
  deleteTask: (id: string, taskType: 'habit' | 'todo') => Promise<boolean>
  completeTask: (id: string) => Promise<CompleteTaskResponse | null>
  uncompleteTask: (id: string) => Promise<boolean>
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { updateUser } = useAuth()

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedTasks = await taskService.getTasks()
      
      // Debug: verificar se last_completed_at está vindo do backend
      console.log('🔍 [fetchTasks] Hábitos com last_completed_at:')
      fetchedTasks.forEach(task => {
        if (task.task_type === 'habit' && task.last_completed_at) {
          console.log(`  ✅ ${task.title}: ${task.last_completed_at}`)
        } else if (task.task_type === 'habit') {
          console.log(`  ❌ ${task.title}: SEM last_completed_at`)
        }
      })
      
      setTasks(fetchedTasks)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tarefas'
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const createHabit = async (data: CreateHabitRequest): Promise<Task | null> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const newHabit = await taskService.createHabit(data)
      setTasks(prev => [...prev, newHabit])
      
      toast({
        title: "Hábito criado!",
        description: `"${data.title}" foi adicionado aos seus hábitos.`,
      })
      
      return newHabit
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar hábito'
      setError(errorMessage)
      toast({
        title: "Erro ao criar hábito",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createTodo = async (data: CreateTodoRequest): Promise<Task | null> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const newTodo = await taskService.createTodo(data)
      setTasks(prev => [...prev, newTodo])
      
      toast({
        title: "Afazer criado!",
        description: `"${data.title}" foi adicionado à sua lista.`,
      })
      
      return newTodo
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar afazer'
      setError(errorMessage)
      toast({
        title: "Erro ao criar afazer",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateHabit = async (id: string, data: UpdateHabitRequest): Promise<Task | null> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const updatedHabit = await taskService.updateHabit(id, data)
      setTasks(prev => prev.map(task => task.id === id ? updatedHabit : task))
      
      toast({
        title: "Hábito atualizado!",
        description: "As alterações foram salvas.",
      })
      
      return updatedHabit
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar hábito'
      setError(errorMessage)
      toast({
        title: "Erro ao atualizar hábito",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateTodo = async (id: string, data: UpdateTodoRequest): Promise<Task | null> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const updatedTodo = await taskService.updateTodo(id, data)
      setTasks(prev => prev.map(task => task.id === id ? updatedTodo : task))
      
      toast({
        title: "Afazer atualizado!",
        description: "As alterações foram salvas.",
      })
      
      return updatedTodo
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar afazer'
      setError(errorMessage)
      toast({
        title: "Erro ao atualizar afazer",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTask = async (id: string, taskType: 'habit' | 'todo'): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (taskType === 'habit') {
        await taskService.deleteHabit(id)
      } else {
        await taskService.deleteTodo(id)
      }
      
      setTasks(prev => prev.filter(task => task.id !== id))
      
      toast({
        title: "Tarefa removida",
        description: "A tarefa foi excluída com sucesso.",
      })
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar tarefa'
      setError(errorMessage)
      toast({
        title: "Erro ao deletar tarefa",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const completeTask = async (id: string): Promise<CompleteTaskResponse | null> => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("🎯 [DEBUG] Completando tarefa:", id)
      
      const response = await taskService.completeTask(id)
      
      console.log("✅ [DEBUG] Resposta da API:", response)
      console.log("👤 [DEBUG] User da API:", response.user)
      
      // REGRA DE OURO: API é a única fonte da verdade
      // Atualizar tarefa na lista com dados completos da resposta
      setTasks(prev => prev.map(task => {
        if (task.id === id) {
          // IMPORTANTE: Hábitos NÃO usam campo 'completed', apenas 'last_completed_at'
          // ToDos usam 'completed: true' permanentemente
          const updatedTask = task.task_type === 'habit' ? {
            ...task,
            // Hábitos: atualizar last_completed_at e streak
            last_completed_at: new Date().toISOString(),
            current_streak: response.streak_info?.current_streak || task.current_streak,
          } : {
            ...task,
            // ToDos: marcar como completed (permanente)
            completed: true,
          }
          
          console.log("📝 [DEBUG] Tarefa atualizada:", updatedTask)
          return updatedTask
        }
        return task
      }))
      
      // CRÍTICO: Atualizar dados do usuário com valores exatos da API
      if (response.user) {
        console.log("🔄 [DEBUG] Atualizando usuário no contexto...")
        console.log("   - XP:", response.user.xp)
        console.log("   - Level:", response.user.level)
        console.log("   - Coins:", response.user.coins)
        
        updateUser({
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          xp: response.user.xp,           // Valor exato da API
          level: response.user.level,     // Valor exato da API
          coins: response.user.coins,     // Valor exato da API
        })
      }
      
      return response
    } catch (err: any) {
      console.error("❌ [DEBUG] Erro ao completar tarefa:", err)
      console.error("   - statusCode:", err.statusCode)
      console.error("   - detail:", err.detail)
      console.error("   - message:", err.message)
      
      const errorMessage = err.detail || err.message || 'Erro ao completar tarefa'
      const statusCode = err.statusCode
      
      setError(errorMessage)
      
      // CRÍTICO: Tratamento específico para erro 400 (tarefa já completada hoje)
      if (statusCode === 400 || errorMessage.includes('already been completed')) {
        toast({
          title: "⚠️ Ação não permitida",
          description: "Você já completou esta tarefa hoje! Volte amanhã.",
          variant: "default", // Warning, não destructive
        })
      } else {
        toast({
          title: "Erro ao completar tarefa",
          description: errorMessage,
          variant: "destructive",
        })
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const uncompleteTask = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("🔄 [DEBUG] Desconcluindo tarefa:", id)
      
      const response = await taskService.uncompleteTask(id)
      
      console.log("✅ [DEBUG] Tarefa desconcluída:", response)
      
      // Atualizar tarefa na lista - remover conclusão
      setTasks(prev => prev.map(task => {
        if (task.id === id) {
          if (task.task_type === 'habit') {
            return {
              ...task,
              // Hábitos: remover last_completed_at
              last_completed_at: undefined,
              current_streak: Math.max(0, (task.current_streak || 1) - 1),
            }
          } else {
            return {
              ...task,
              // ToDos: desmarcar como completado
              completed: false,
            }
          }
        }
        return task
      }))
      
      // Atualizar XP do usuário (remover XP)
      await fetchTasks() // Recarregar para pegar dados atualizados do backend
      
      toast({
        title: "Tarefa desconcluída",
        description: `XP removido: ${response.xp_removed}`,
      })
      
      return true
    } catch (err: any) {
      console.error("❌ [DEBUG] Erro ao desconcluir tarefa:", err)
      
      const errorMessage = err.message || 'Erro ao desconcluir tarefa'
      setError(errorMessage)
      
      toast({
        title: "Erro ao desconcluir tarefa",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createHabit,
    createTodo,
    updateHabit,
    updateTodo,
    deleteTask,
    completeTask,
    uncompleteTask,
  }
}
