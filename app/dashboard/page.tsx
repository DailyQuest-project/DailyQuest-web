"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useTasks } from "@/hooks/use-tasks"
import { useTags } from "@/hooks/use-tags"
import { useGamificationFeedback } from "@/hooks/use-gamification-feedback"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateHabitModal } from "@/components/create-habit-modal"
import { EditTaskModal } from "@/components/edit-task-modal"
import { TagManagerModal } from "@/components/tag-manager-modal"
import { UserProfileModal } from "@/components/user-profile-modal"
import { AchievementsModal } from "@/components/achievements-modal"
import { HabitFilters, type FilterState } from "@/components/habit-filters"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { XPGainAnimation } from "@/components/xp-gain-animation"
import { AchievementUnlock } from "@/components/achievement-unlock"
import { CoinAnimation } from "@/components/coin-animation"
import { ConfettiCelebration } from "@/components/confetti-celebration"
import { getXPProgress } from "@/lib/xp-utils"
import {
  Trophy,
  Flame,
  Coins,
  Plus,
  Check,
  Star,
  Target,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { Task, CreateHabitRequest, CreateTodoRequest } from "@/lib/api-types-complete"
import { FrequencyType } from "@/lib/api-types-complete"

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "EASY":
    case "easy":
      return "bg-green-600 text-white"
    case "MEDIUM":
    case "medium":
      return "bg-yellow-600 text-white"
    case "HARD":
    case "hard":
      return "bg-red-600 text-white"
    default:
      return "bg-gray-600 text-white"
  }
}

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case "EASY":
    case "easy":
      return "Fácil"
    case "MEDIUM":
    case "medium":
      return "Médio"
    case "HARD":
    case "hard":
      return "Difícil"
    default:
      return "Normal"
  }
}

interface CalendarDay {
  day: number
  isCompleted: boolean
  isToday: boolean
  date: Date
}

interface CompletionHistoryItem {
  id: string
  task_id: string
  user_id: string
  completed_date: string
  xp_earned: number
}

function DashboardContent() {
  const { user, logout } = useAuth()
  const { tasks, isLoading, fetchTasks, createHabit, createTodo, updateHabit, updateTodo, deleteTask, completeTask, uncompleteTask } = useTasks()
  const { tags, fetchTags, createTag, updateTag, deleteTag } = useTags()
  const { handleTaskComplete } = useGamificationFeedback()
  
  // Estados locais para animações
  const [showXPGain, setShowXPGain] = useState(false)
  const [xpGainAmount, setXPGainAmount] = useState(0)
  const [showCoinGain, setShowCoinGain] = useState(false)
  const [coinGainAmount, setCoinGainAmount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null)
  
  const [selectedTab, setSelectedTab] = useState<"habits" | "todos">("habits")
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    selectedTags: [],
    difficulties: [],
    types: [],
    completionStatus: "all",
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [tagManagerOpen, setTagManagerOpen] = useState(false)
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false)
  
  // Estado do avatar do usuário (carregado do localStorage)
  const [userAvatar, setUserAvatar] = useState("🧙‍♂️")
  
  // Estados do calendário
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date())
  const [completionHistory, setCompletionHistory] = useState<CompletionHistoryItem[]>([])
  const [calendarDays, setCalendarDays] = useState<(CalendarDay | null)[]>([])
  
  // Estados de achievements
  const [userAchievements, setUserAchievements] = useState<any[]>([])

  // Carregar avatar do localStorage quando user estiver disponível
  useEffect(() => {
    if (user) {
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`)
      if (savedAvatar) {
        setUserAvatar(savedAvatar)
      }
    }
  }, [user])

  // Buscar conquistas do usuário
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { achievementService } = await import('@/lib/api-service-complete')
        const data = await achievementService.getMyAchievements()
        console.log('🏆 Conquistas carregadas:', data)
        setUserAchievements(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Erro ao buscar conquistas:', error)
        setUserAchievements([])
      }
    }
    fetchAchievements()
  }, [])

  const [achievements, setAchievements] = useState<any[]>([
    {
      id: 1,
      name: "Primeiro Passo",
      description: "Complete sua primeira tarefa",
      icon: "🎯",
      unlocked: false,
      rarity: "comum"
    },
    {
      id: 2,
      name: "Sequência de 7 Dias",
      description: "Mantenha uma sequência de 7 dias",
      icon: "🔥",
      unlocked: false,
      rarity: "raro"
    },
    {
      id: 3,
      name: "Mestre das Tarefas",
      description: "Complete 100 tarefas",
      icon: "🏆",
      unlocked: false,
      rarity: "épico"
    },
    {
      id: 4,
      name: "Madrugador",
      description: "Complete uma tarefa antes das 8h",
      icon: "🌅",
      unlocked: false,
      rarity: "comum"
    },
    {
      id: 5,
      name: "Perfeição",
      description: "Complete todas as tarefas do dia por 30 dias",
      icon: "💎",
      unlocked: false,
      rarity: "lendário"
    },
    {
      id: 6,
      name: "Colecionador",
      description: "Crie 10 hábitos diferentes",
      icon: "📚",
      unlocked: false,
      rarity: "raro"
    }
  ])
  const generateCalendarDays = useCallback((date: Date, history: CompletionHistoryItem[]) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const today = new Date()
    const days: (CalendarDay | null)[] = []

    // Adicionar espaços vazios para alinhar com o dia da semana
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Adicionar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      const dateStr = dayDate.toISOString().split('T')[0]
      
      // Verificar se tem alguma tarefa completada neste dia
      const isCompleted = history.some(item => {
        const completedDate = new Date(item.completed_date).toISOString().split('T')[0]
        return completedDate === dateStr
      })
      
      // Verificar se é hoje
      const isToday = 
        day === today.getDate() && 
        month === today.getMonth() && 
        year === today.getFullYear()
      
      days.push({ 
        day, 
        isCompleted, 
        isToday,
        date: dayDate
      })
    }

    return days
  }, [])

  // Buscar histórico de completions
  const fetchCompletionHistory = useCallback(async () => {
    try {
      const { dashboardService } = await import('@/lib/api-service-complete')
      const data = await dashboardService.getHistory()
      // O backend retorna { entries: [...] } mas precisamos só do array
      setCompletionHistory(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      setCompletionHistory([])
    }
  }, [])

  // Buscar achievements (futuramente do backend)
  const fetchAchievements = useCallback(async () => {
    try {
      // TODO: Implementar quando o backend tiver endpoint de achievements
      // const { achievementService } = await import('@/lib/api-service-complete')
      // const data = await achievementService.getMyAchievements()
      // setAchievements(data)
      
      // Por enquanto, usar dados mock
      console.log('Achievements carregadas (mock)')
    } catch (error) {
      console.error('Erro ao buscar achievements:', error)
    }
  }, [])

  // Atualizar perfil do usuário
  const handleUpdateUserProfile = useCallback(async (userData: any) => {
    try {
      console.log('Atualizar perfil:', userData)
      
      // Salvar avatar no localStorage (enquanto não há endpoint no backend)
      if (userData.avatar && user) {
        localStorage.setItem(`avatar_${user.id}`, userData.avatar)
        setUserAvatar(userData.avatar) // Atualizar estado local
        console.log('✅ Avatar salvo:', userData.avatar)
      }
      
      // TODO: Quando o backend suportar, chamar API para atualizar perfil
      // await authService.updateProfile({ avatar_url: userData.avatar })
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
    }
  }, [user])

  // Atualizar calendário quando mudar o mês ou o histórico
  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentCalendarDate, completionHistory))
  }, [currentCalendarDate, completionHistory, generateCalendarDays])

  // Buscar dados iniciais
  useEffect(() => {
    fetchTasks()
    fetchTags()
    fetchCompletionHistory()
    fetchAchievements()
  }, [fetchTasks, fetchTags, fetchCompletionHistory, fetchAchievements])

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  // Formatar o mês atual
  const currentMonth = currentCalendarDate.toLocaleDateString("pt-BR", { 
    month: "long", 
    year: "numeric" 
  })

  const handleCompleteTask = async (id: string) => {
    if (!user) return
    
    // Verificar se a tarefa está completada
    const task = tasks.find(t => t.id === id)
    if (!task) return
    
    const isCompleted = task.task_type === 'habit' 
      ? isHabitCompletedToday(task)
      : task.completed
    
    if (isCompleted) {
      // ToDos completados não podem ser desconcluídos
      if (task.task_type === 'todo') {
        return // ToDos são permanentes - não podem ser desconcluídos
      }
      
      // Desconcluir hábito - permitir que o usuário desfaça a conclusão do dia
      await uncompleteTask(id)
      await fetchTasks()
      await fetchCompletionHistory() // Atualizar calendário
    } else {
      // Completar - uma vez por dia para hábitos
      const oldLevel = user.level
      const response = await completeTask(id)
      
      if (response) {
        handleTaskComplete(response, oldLevel)
        await fetchTasks()
        await fetchCompletionHistory() // Atualizar calendário
      }
    }
  }

  const handleCreateTask = async (data: any) => {
    console.log("📤 [Dashboard] Dados recebidos do modal:", data)
    
    // Verificar o tipo de tarefa e chamar a função apropriada
    if (data.type === "todo") {
      // Criar afazer (todo)
      const todoData: CreateTodoRequest = {
        title: data.title,
        description: data.description || "",
        difficulty: data.difficulty?.toUpperCase() || "EASY",
        deadline: data.deadline || undefined,
        tag_ids: data.tag_ids || [],
      }
      
      console.log("📤 [Dashboard] Criando afazer:", todoData)
      await createTodo(todoData)
    } else {
      // Criar hábito (habit)
      const habitData: CreateHabitRequest = {
        title: data.title,
        description: data.description || "",
        difficulty: data.difficulty?.toUpperCase() || "EASY",
        frequency_type: data.frequency || FrequencyType.DAILY,
        frequency_target_times: data.frequency_target_times,
        frequency_days: data.frequency_days,
        tag_ids: data.tag_ids || [],
      }
      
      console.log("📤 [Dashboard] Criando hábito:", habitData)
      await createHabit(habitData)
    }
  }

  const handleDeleteTask = async (id: string, taskType: 'habit' | 'todo') => {
    await deleteTask(id, taskType)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditModalOpen(true)
  }

  const handleUpdateTask = async (id: string, data: any, taskType: 'habit' | 'todo') => {
    if (taskType === 'habit') {
      await updateHabit(id, data)
    } else {
      await updateTodo(id, data)
    }
    setEditModalOpen(false)
    setEditingTask(null)
    await fetchTasks()
  }

  // Filtrar tarefas
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedTab === "habits" && task.task_type !== "habit") return false
      if (selectedTab === "todos" && task.task_type !== "todo") return false

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!task.title.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      if (filters.difficulties.length > 0 && !filters.difficulties.includes(task.difficulty)) {
        return false
      }

      // Filtro por tags
      if (filters.selectedTags.length > 0) {
        const taskTagNames = task.tags?.map(t => t.name) || []
        const hasMatchingTag = filters.selectedTags.some(filterTag => 
          taskTagNames.includes(filterTag)
        )
        if (!hasMatchingTag) return false
      }

      if (filters.completionStatus === "completed") {
        if (task.task_type === "todo" && !task.completed) return false
        if (task.task_type === "habit" && !isHabitCompletedToday(task)) return false
      }
      if (filters.completionStatus === "pending") {
        if (task.task_type === "todo" && task.completed) return false
        if (task.task_type === "habit" && isHabitCompletedToday(task)) return false
      }

      return true
    })
  }, [tasks, filters, selectedTab])

  const isHabitCompletedToday = (task: Task) => {
    if (task.task_type !== "habit") {
      return false
    }
    
    if (!task.last_completed_at) {
      return false
    }
    
    const lastCompleted = new Date(task.last_completed_at)
    const todayDate = new Date()
    
    return (
      lastCompleted.getDate() === todayDate.getDate() &&
      lastCompleted.getMonth() === todayDate.getMonth() &&
      lastCompleted.getFullYear() === todayDate.getFullYear()
    )
  }

  const getFrequencyDisplay = (task: Task) => {
    if (task.task_type !== "habit") return null
    
    const habitTask = task as any
    const frequencyType = habitTask.frequency_type
    
    if (frequencyType === "DAILY") {
      return { text: "Diário", icon: "📅" }
    } else if (frequencyType === "WEEKLY_TIMES") {
      const times = habitTask.frequency_target_times || 3
      return { text: `${times}x por semana`, icon: "📊" }
    } else if (frequencyType === "SPECIFIC_DAYS") {
      const days = habitTask.frequency_days || []
      const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
      const selectedDays = days.map((d: number) => dayLabels[d]).join(", ")
      return { text: selectedDays || "Dias específicos", icon: "📆", days }
    }
    
    return { text: "Flexível", icon: "🔄" }
  }

  const isDayActive = (task: Task, dayIndex: number) => {
    if (task.task_type !== "habit") return false
    
    const habitTask = task as any
    const frequencyType = habitTask.frequency_type
    
    if (frequencyType === "DAILY") {
      return true // Todos os dias
    } else if (frequencyType === "SPECIFIC_DAYS") {
      const days = habitTask.frequency_days || []
      return days.includes(dayIndex)
    }
    
    return false // WEEKLY_TIMES não usa indicadores de dia
  }

  const availableTags = useMemo(() => {
    // Coletar todas as tags únicas das tarefas
    const taskTags = new Set<string>()
    tasks.forEach(task => {
      task.tags?.forEach(tag => taskTags.add(tag.name))
    })
    
    // Adicionar tags criadas pelo usuário
    tags.forEach(tag => taskTags.add(tag.name))
    
    return Array.from(taskTags).sort()
  }, [tasks, tags])

  const completedTodayCount = tasks.filter(t => {
    if (t.task_type === "todo") return t.completed
    if (t.task_type === "habit") return isHabitCompletedToday(t)
    return false
  }).length

  // Calcular maior sequência (streak) dos hábitos do usuário
  const longestStreak = useMemo(() => {
    const habits = tasks.filter(t => t.task_type === "habit")
    if (habits.length === 0) return 0
    return Math.max(...habits.map((h: any) => h.best_streak || h.current_streak || 0), 0)
  }, [tasks])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const { currentLevelXP, xpForNextLevel } = getXPProgress(user.xp, user.level)

  return (
    <div className="min-h-screen bg-background">
      <XPGainAnimation xp={xpGainAmount} show={showXPGain} onComplete={() => setShowXPGain(false)} />
      <AchievementUnlock
        achievement={unlockedAchievement}
        show={showAchievement}
        onComplete={() => setShowAchievement(false)}
      />
      <CoinAnimation coins={coinGainAmount} show={showCoinGain} onComplete={() => setShowCoinGain(false)} />
      <ConfettiCelebration show={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Modal de Perfil do Usuário */}
      <UserProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        userData={{
          name: user.username,
          level: user.level,
          xp: user.xp,
          xpToNext: xpForNextLevel,
          coins: user.coins,
          streak: longestStreak,
          avatar: userAvatar,
        }}
        habits={tasks.filter(t => t.task_type === "habit")}
        achievements={achievements}
        completedHabits={new Set(
          tasks
            .filter(t => t.task_type === "habit" && isHabitCompletedToday(t))
            .map(t => Number(t.id))
        )}
        onUpdateUser={handleUpdateUserProfile}
      >
        {/* Não precisa de children quando controlado */}
        <span></span>
      </UserProfileModal>
      
      {/* Modal de Edição */}
      <EditTaskModal
        task={editingTask}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingTask(null)
        }}
        onUpdate={handleUpdateTask}
        availableTags={tags}
        onManageTags={() => setTagManagerOpen(true)}
        onAddTag={async (taskId, tagId) => {
          try {
            const { tagService } = await import('@/lib/api-service-complete')
            await tagService.associateTag(taskId, tagId)
            // Recarregar tasks para atualizar as tags
            await fetchTasks()
          } catch (error) {
            console.error('Erro ao adicionar tag:', error)
            throw error
          }
        }}
        onRemoveTag={async (taskId, tagId) => {
          try {
            const { tagService } = await import('@/lib/api-service-complete')
            await tagService.removeTag(taskId, tagId)
            // Recarregar tasks para atualizar as tags
            await fetchTasks()
          } catch (error) {
            console.error('Erro ao remover tag:', error)
            throw error
          }
        }}
      />

      {/* Modal de Conquistas */}
      <AchievementsModal 
        open={achievementsModalOpen} 
        onOpenChange={setAchievementsModalOpen} 
      />

      {/* Modal de Gerenciamento de Tags */}
      <TagManagerModal
        open={tagManagerOpen}
        onClose={() => setTagManagerOpen(false)}
        tags={tags}
        onCreateTag={async (name, color) => {
          await createTag({ name, color })
        }}
        onUpdateTag={async (tagId, name, color) => {
          await updateTag(tagId, { name, color })
        }}
        onDeleteTag={async (tagId) => {
          await deleteTag(tagId)
        }}
      />

      <header className="glass-strong border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="DailyQuest Logo" className="w-8 h-8" />
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Daily Quest</h1>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Nível {user.level}</span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(currentLevelXP / xpForNextLevel) * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground">
                  {currentLevelXP}/{xpForNextLevel} XP
                </span>
              </div>

              <div className="flex items-center gap-2 glass px-3 py-1 rounded-full">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-sm">{user.coins}</span>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="border-2 border-primary/20 cursor-pointer hover:scale-105 transition-transform">
                      <AvatarFallback className="text-lg">
                        {userAvatar}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <MobileNav
                userData={{
                  name: user.username,
                  level: user.level,
                  xp: currentLevelXP,
                  xpToNext: xpForNextLevel,
                  coins: user.coins,
                  streak: longestStreak,
                  avatar: userAvatar,
                }}
                soundEnabled={soundEnabled}
                onSoundToggle={() => setSoundEnabled(!soundEnabled)}
                onProfileOpen={() => setProfileOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile XP Bar */}
            <div className="lg:hidden">
              <Card className="glass">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Nível {user.level}</span>
                    <span className="text-sm text-muted-foreground">
                      {currentLevelXP}/{xpForNextLevel} XP
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(currentLevelXP / xpForNextLevel) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tasks Card */}
            <Card className="glass">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-xl">Suas Missões</CardTitle>
                  <CreateHabitModal 
                    onCreateHabit={handleCreateTask}
                    availableTags={tags}
                    onManageTags={() => setTagManagerOpen(true)}
                  >
                    <Button size="sm" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  </CreateHabitModal>
                </div>

                <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
                    <TabsTrigger value="habits">Hábitos</TabsTrigger>
                    <TabsTrigger value="todos">Afazeres</TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <HabitFilters onFilterChange={setFilters} availableTags={availableTags} />
                  </div>

                  <TabsContent value="habits" className="mt-4 space-y-3">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum hábito encontrado</p>
                      </div>
                    ) : (
                      filteredTasks.map((task) => {
                        const isCompleted = isHabitCompletedToday(task)
                        const xpValue = task.difficulty === "EASY" ? 10 : task.difficulty === "MEDIUM" ? 20 : 30
                        
                        return (
                          <div
                            key={task.id}
                            className={`glass rounded-lg p-4 transition-all hover:bg-card/90 ${
                              isCompleted ? "opacity-75 bg-green-500/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                                  isCompleted
                                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/50 hover:bg-green-600"
                                    : "border-muted-foreground hover:border-primary hover:scale-110"
                                }`}
                                title={isCompleted ? "Clique para desconcluir" : "Clique para completar"}
                              >
                                {isCompleted && <Check className="w-5 h-5 font-bold" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-medium text-base ${isCompleted ? "line-through" : ""}`}>
                                    {task.title}
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className={`${getDifficultyColor(task.difficulty)} text-xs border-0`}
                                  >
                                    {getDifficultyText(task.difficulty)}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                )}
                                
                                {/* Tags */}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.tags.map((tag) => (
                                      <Badge
                                        key={tag.id}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0"
                                        style={{
                                          borderColor: tag.color || undefined,
                                          color: tag.color || undefined,
                                        }}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Frequência do hábito */}
                                {task.task_type === "habit" && (() => {
                                  const frequency = getFrequencyDisplay(task)
                                  const habitTask = task as any
                                  const today = new Date().getDay()
                                  
                                  return (
                                    <div className="mt-2 space-y-1">
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <span>{frequency?.icon}</span>
                                        <span>{frequency?.text}</span>
                                      </div>
                                      
                                      {habitTask.frequency_type === "SPECIFIC_DAYS" && (
                                        <div className="flex gap-1 mt-1.5">
                                          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => {
                                            const isActive = isDayActive(task, index)
                                            const isToday = index === today
                                            
                                            return (
                                              <div
                                                key={index}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all ${
                                                  isActive
                                                    ? isToday
                                                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                      : "bg-primary/20 text-primary"
                                                    : "bg-muted/50 text-muted-foreground/50"
                                                }`}
                                                title={isActive ? "Dia ativo" : "Dia inativo"}
                                              >
                                                {day}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                      
                                      {habitTask.frequency_type === "DAILY" && (
                                        <div className="flex gap-1 mt-1.5">
                                          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => {
                                            const isToday = index === today
                                            
                                            return (
                                              <div
                                                key={index}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                                                  isToday
                                                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                    : "bg-primary/20 text-primary"
                                                }`}
                                              >
                                                {day}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>

                              <div className="text-right space-y-1 flex-shrink-0">
                                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                  <Star className="w-4 h-4" />+{xpValue} XP
                                </div>
                                <div className="flex items-center gap-1 text-sm text-orange-500">
                                  <Flame className="w-4 h-4" />
                                  {(() => {
                                    const streak = (task as any).current_streak || 0
                                    // Se o streak é 0 mas a tarefa foi completada hoje, mostrar 1
                                    if (streak === 0 && isCompleted) {
                                      return "1 dia"
                                    }
                                    return `${streak} ${streak === 1 ? "dia" : "dias"}`
                                  })()}
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-strong">
                                  <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTask(task.id, "habit")}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </TabsContent>

                  <TabsContent value="todos" className="mt-4 space-y-3">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum afazer encontrado</p>
                        <p className="text-sm">Crie seu primeiro afazer</p>
                      </div>
                    ) : (
                      filteredTasks.map((task) => {
                        const isCompleted = task.completed
                        const xpValue = task.difficulty === "EASY" ? 10 : task.difficulty === "MEDIUM" ? 20 : 30
                        
                        return (
                          <div
                            key={task.id}
                            className={`glass rounded-lg p-4 transition-all hover:bg-card/90 ${
                              isCompleted ? "opacity-75 bg-green-500/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                                  isCompleted
                                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/50 hover:bg-green-600"
                                    : "border-muted-foreground hover:border-primary hover:scale-110"
                                }`}
                                title={isCompleted ? "Clique para desconcluir" : "Clique para completar"}
                              >
                                {isCompleted && <Check className="w-5 h-5 font-bold" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`font-medium text-base ${isCompleted ? "line-through" : ""}`}>
                                    {task.title}
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className={`${getDifficultyColor(task.difficulty)} text-xs border-0`}
                                  >
                                    {getDifficultyText(task.difficulty)}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                )}
                                
                                {/* Tags */}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.tags.map((tag) => (
                                      <Badge
                                        key={tag.id}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0"
                                        style={{
                                          borderColor: tag.color || undefined,
                                          color: tag.color || undefined,
                                        }}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                {(task as any).deadline && (
                                  <div className="text-xs text-blue-400 mt-1">
                                    Prazo: {new Date((task as any).deadline).toLocaleDateString("pt-BR")}
                                  </div>
                                )}
                              </div>

                              <div className="text-right space-y-1 flex-shrink-0">
                                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                  <Star className="w-4 h-4" />+{xpValue} XP
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-strong">
                                  <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTask(task.id, "todo")}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar Card */}
            <Card className="glass">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Seu Progresso</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={goToPreviousMonth}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={goToNextMonth}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground uppercase">{currentMonth}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                    <div key={index} className="text-center text-xs text-muted-foreground p-1">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <div key={index} className="aspect-square">
                      {day ? (
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center text-xs transition-all ${
                            day.isCompleted
                              ? "bg-primary text-white"
                              : day.isToday
                                ? "bg-muted text-foreground ring-2 ring-primary"
                                : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {day.day}
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{completedTodayCount}</div>
                    <div className="text-xs text-muted-foreground">completadas hoje</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{tasks.length}</div>
                    <div className="text-xs text-muted-foreground">tarefas totais</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="glass">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Conquistas
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAchievementsModalOpen(true)}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    Ver Todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userAchievements.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Nenhuma conquista ainda</p>
                    <p className="text-[10px] mt-1">Complete tarefas para desbloquear!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userAchievements.slice(0, 3).map((item: any) => {
                      const ach = item.achievement
                      return (
                        <div
                          key={ach.id}
                          className="p-3 rounded-lg border bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:border-yellow-500/50 transition-all group cursor-pointer"
                          onClick={() => setAchievementsModalOpen(true)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500/20 text-xl group-hover:scale-110 transition-transform">
                              {ach.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-foreground">
                                {ach.name}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {ach.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {userAchievements.length > 3 && (
                      <button
                        onClick={() => setAchievementsModalOpen(true)}
                        className="w-full text-center py-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded transition-colors"
                      >
                        + {userAchievements.length - 3} conquista{userAchievements.length - 3 > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
