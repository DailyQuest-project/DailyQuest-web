"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useTasks } from "@/hooks/use-tasks"
import { useGamificationFeedback } from "@/hooks/use-gamification-feedback"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateHabitModal } from "@/components/create-habit-modal"
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

const generateCalendarDays = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isCompleted = Math.random() > 0.3
    const isToday = day === today.getDate()
    days.push({ day, isCompleted, isToday })
  }

  return days
}

function DashboardContent() {
  const { user, logout } = useAuth()
  const { tasks, isLoading, fetchTasks, createHabit, createTodo, deleteTask, completeTask } = useTasks()
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
  const [calendarDays] = useState(generateCalendarDays())
  const [currentMonth] = useState(new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }))

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])
  
  // Log quando tasks mudam
  useEffect(() => {
    console.log('📋 [Dashboard] Tasks atualizadas:', tasks.length, 'tarefas')
    tasks.forEach(task => {
      if (task.task_type === 'habit') {
        console.log(`  🎯 Hábito: ${task.title}`, {
          id: task.id,
          last_completed_at: task.last_completed_at,
          completed_today: task.last_completed_at ? 'talvez' : 'não'
        })
      }
    })
  }, [tasks])

  const handleCompleteTask = async (id: string) => {
    if (!user) return
    
    const oldLevel = user.level
    const response = await completeTask(id)
    
    if (response) {
      handleTaskComplete(response, oldLevel)
      await fetchTasks()
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
      }
      
      console.log("📤 [Dashboard] Criando afazer:", todoData)
      await createTodo(todoData)
    } else {
      // Criar hábito (habit)
      const habitData: CreateHabitRequest = {
        title: data.title,
        description: data.description || "",
        difficulty: data.difficulty?.toUpperCase() || "EASY",
        frequency_type: FrequencyType.DAILY, // Por enquanto sempre DAILY
      }
      
      console.log("📤 [Dashboard] Criando hábito:", habitData)
      await createHabit(habitData)
    }
  }

  const handleDeleteTask = async (id: string, taskType: 'habit' | 'todo') => {
    await deleteTask(id, taskType)
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
      console.log(`⚠️ [isHabitCompletedToday] ${task.title}: não é hábito (${task.task_type})`)
      return false
    }
    
    // 🔧 WORKAROUND: Verificar localStorage primeiro (porque backend não atualiza last_completed)
    const today = new Date().toDateString()
    const completionsKey = `habit_completions_${today}`
    const completions = JSON.parse(localStorage.getItem(completionsKey) || '[]')
    if (completions.includes(task.id)) {
      console.log(`✅ [isHabitCompletedToday] ${task.title}: encontrado no localStorage`)
      return true
    }
    
    if (!task.last_completed_at) {
      console.log(`⚠️ [isHabitCompletedToday] ${task.title}: sem last_completed_at e não está no localStorage`)
      return false
    }
    
    const lastCompleted = new Date(task.last_completed_at)
    const todayDate = new Date()
    
    const isCompleted = (
      lastCompleted.getDate() === todayDate.getDate() &&
      lastCompleted.getMonth() === todayDate.getMonth() &&
      lastCompleted.getFullYear() === todayDate.getFullYear()
    )
    
    // Log para debug com mais detalhes
    console.log(`🔍 [isHabitCompletedToday] ${task.title}:`, {
      task_id: task.id,
      task_type: task.task_type,
      last_completed_at: task.last_completed_at,
      lastCompleted_date: `${lastCompleted.getDate()}/${lastCompleted.getMonth()+1}/${lastCompleted.getFullYear()}`,
      today_date: `${todayDate.getDate()}/${todayDate.getMonth()+1}/${todayDate.getFullYear()}`,
      isCompleted,
      '⭐ DEVERIA MOSTRAR CHECK?': isCompleted ? 'SIM ✅' : 'NÃO ❌'
    })
    
    return isCompleted
  }

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    // Tags virão do backend posteriormente
    return Array.from(tags).sort()
  }, [tasks])

  const completedTodayCount = tasks.filter(t => {
    if (t.task_type === "todo") return t.completed
    if (t.task_type === "habit") return isHabitCompletedToday(t)
    return false
  }).length

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

      <header className="glass-strong border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
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
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
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
                  streak: 0,
                  avatar: "🧙‍♂️",
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
                  <CreateHabitModal onCreateHabit={handleCreateTask}>
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
                                onClick={() => !isCompleted && handleCompleteTask(task.id)}
                                disabled={isCompleted}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                  isCompleted
                                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/50"
                                    : "border-muted-foreground hover:border-primary hover:scale-110"
                                }`}
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
                              </div>

                              <div className="text-right space-y-1 flex-shrink-0">
                                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                  <Star className="w-4 h-4" />+{xpValue} XP
                                </div>
                                <div className="flex items-center gap-1 text-sm text-orange-500">
                                  <Flame className="w-4 h-4" />
                                  {(task as any).current_streak || 0} dias
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-strong">
                                  <DropdownMenuItem>
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
                                onClick={() => !isCompleted && handleCompleteTask(task.id)}
                                disabled={isCompleted}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                  isCompleted
                                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/50"
                                    : "border-muted-foreground hover:border-primary hover:scale-110"
                                }`}
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
                                  <DropdownMenuItem>
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
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border bg-primary/10 border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">🏆</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">Iniciante</div>
                      <div className="text-xs text-foreground/70">Complete seu primeiro hábito</div>
                    </div>
                  </div>
                </div>
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
