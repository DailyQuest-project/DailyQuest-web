"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { XPBar } from "@/components/xp-bar"
import { StreakCounter } from "@/components/streak-counter"
import { AchievementsModal } from "@/components/achievements-modal"
import {
  User,
  Trophy,
  Calendar,
  BarChart3,
  Settings,
  Download,
  Edit3,
  Star,
  Target,
  Flame,
  Zap,
  Crown,
  Medal,
} from "lucide-react"

interface UserProfileModalProps {
  userData: any
  habits: any[]
  achievements: any[]
  completedHabits: Set<number>
  children: React.ReactNode
  onUpdateUser: (userData: any) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const avatarOptions = [
  "🧙‍♂️",
  "👨‍💻",
  "👩‍🎨",
  "🦸‍♂️",
  "🦸‍♀️",
  "👨‍🚀",
  "👩‍🚀",
  "🧑‍🎓",
  "👨‍⚕️",
  "👩‍⚕️",
  "🧑‍🍳",
  "👨‍🌾",
  "👩‍🌾",
]

export function UserProfileModal({
  userData,
  habits,
  achievements,
  completedHabits,
  children,
  onUpdateUser,
  open: controlledOpen,
  onOpenChange,
}: UserProfileModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: userData.name,
    avatar: userData.avatar,
  })

  // Sincronizar formData quando userData mudar ou modal abrir
  useEffect(() => {
    if (open) {
      setFormData({
        name: userData.name,
        avatar: userData.avatar,
      })
    }
  }, [open, userData.name, userData.avatar])

  // Estados para dados da API
  const [completionHistory, setCompletionHistory] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  
  // Estado para modal de conquistas
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false)
  const [userAchievements, setUserAchievements] = useState<any[]>([])

  // Buscar histórico de completions
  const fetchCompletionHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      console.log('🔄 [Modal] Buscando histórico...')
      const { dashboardService } = await import('@/lib/api-service-complete')
      const data = await dashboardService.getHistory()
      console.log('📊 [Modal] Dados do histórico recebidos:', data)
      console.log('📊 [Modal] Tipo:', typeof data, 'É array:', Array.isArray(data))
      
      // O backend retorna uma lista direta, não um objeto com entries
      const historyArray = Array.isArray(data) ? data : (data.entries || [])
      console.log('📊 [Modal] History array length:', historyArray.length)
      setCompletionHistory(historyArray)
    } catch (error) {
      console.error('❌ [Modal] Erro ao buscar histórico:', error)
      setCompletionHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  // Buscar dados quando o modal abre
  useEffect(() => {
    console.log('🔍 [Modal] useEffect triggered, open:', open)
    if (open) {
      console.log('📂 [Modal] Modal aberto, buscando dados...')
      fetchCompletionHistory()
      fetchUserAchievements()
    }
  }, [open, fetchCompletionHistory])

  // Buscar conquistas do usuário
  const fetchUserAchievements = async () => {
    try {
      const { achievementService } = await import('@/lib/api-service-complete')
      const data = await achievementService.getMyAchievements()
      console.log('🏆 Conquistas do usuário:', data)
      setUserAchievements(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error)
      setUserAchievements([])
    }
  }

  // Calcular XP por mês baseado no histórico
  const getMonthlyXP = useCallback(() => {
    const monthlyData: { [key: string]: number } = {}
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    // Inicializar últimos 6 meses
    const currentDate = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = months[date.getMonth()]
      monthlyData[monthKey] = 0
    }

    // Somar XP por mês
    completionHistory.forEach(item => {
      const date = new Date(item.completed_date) // campo correto do backend: completed_date
      const monthKey = months[date.getMonth()]
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += item.xp_earned || 0
      }
    })

    return Object.entries(monthlyData).map(([month, xp]) => ({ month, xp }))
  }, [completionHistory])

  // Calcular tarefas completadas por dia no mês atual
  const getCalendarData = useCallback(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const dailyCompletions: { [key: string]: number } = {}

    console.log('📅 Processando calendário para:', year, month + 1)
    console.log('📅 Total de entries no histórico:', completionHistory.length)

    // Contar quantas tarefas foram completadas em cada dia
    completionHistory.forEach(item => {
      const date = new Date(item.completed_date)
      console.log('📅 Processando item:', item.completed_date, 'xp:', item.xp_earned)
      if (date.getFullYear() === year && date.getMonth() === month) {
        const dateStr = date.toISOString().split('T')[0]
        // Incrementar contador (cada item é uma tarefa completada)
        dailyCompletions[dateStr] = (dailyCompletions[dateStr] || 0) + 1
        console.log('✅ Incrementado no calendário:', dateStr, '=', dailyCompletions[dateStr])
      }
    })

    console.log('📅 Daily completions:', dailyCompletions)

    const days: (null | { day: number; date: Date; completions: number; isToday: boolean })[] = []

    // Adicionar espaços vazios
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Adicionar dias do mês
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      const dateStr = dayDate.toISOString().split('T')[0]
      const completions = dailyCompletions[dateStr] || 0
      const isToday = 
        day === today.getDate() && 
        month === today.getMonth() && 
        year === today.getFullYear()
      
      days.push({ day, date: dayDate, completions, isToday })
    }

    return days
  }, [completionHistory, currentMonth])

  const handleSave = () => {
    onUpdateUser({ ...userData, ...formData })
    setEditMode(false)
    // Fechar e reabrir o modal para forçar atualização dos dados
    setOpen(false)
    setTimeout(() => setOpen(true), 100)
  }

  const totalHabits = habits.length
  const completedToday = completedHabits.size
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0
  const totalXPEarned = habits.reduce((sum, habit) => sum + (completedHabits.has(habit.id) ? habit.xp : 0), 0)
  const longestStreak = userData.streak || Math.max(...habits.map((h: any) => h.best_streak || h.current_streak || h.streak || 0), 0)
  const unlockedAchievements = userAchievements.length

  const monthlyXP = getMonthlyXP()
  const calendarDays = getCalendarData()
  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const exportData = () => {
    const data = {
      user: userData,
      habits: habits,
      achievements: achievements,
      completedHabits: Array.from(completedHabits),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `habitflow-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="glass-strong max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
            Perfil do Usuário
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Visualize seu progresso, conquistas e configurações
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass h-9 sm:h-10">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm">Progresso</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Config.</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <Card className="glass">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/20">
                    <AvatarFallback className="text-2xl sm:text-3xl">{userData.avatar}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-center sm:text-left w-full">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">{userData.name}</h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Nível {userData.level}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {userData.streak} dias
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Nível {userData.level}</span>
                        <span className="text-muted-foreground">{userData.xp}/{userData.xpToNext} XP</span>
                      </div>
                      <Progress value={(userData.xp / userData.xpToNext) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <Card className="glass text-center">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-full bg-green-500/20">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold">
                    {completedToday}/{totalHabits}
                  </div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Hoje</div>
                </CardContent>
              </Card>

              <Card className="glass text-center">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-full bg-yellow-500/20">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold">{totalXPEarned || 0}</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">XP Hoje</div>
                </CardContent>
              </Card>

              <Card className="glass text-center">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-full bg-orange-500/20">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold">{longestStreak || 0}</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Maior Seq.</div>
                </CardContent>
              </Card>

              <Card className="glass text-center">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-full bg-purple-500/20">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold">
                    {unlockedAchievements}/{achievements.length}
                  </div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Conquistas</div>
                </CardContent>
              </Card>
            </div>

            {/* Conquistas Recentes */}
            <Card className="glass">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                    Conquistas
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAchievementsModalOpen(true)}
                    className="text-primary hover:text-primary/80 text-xs sm:text-sm h-8"
                  >
                    Ver Mais
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {userAchievements.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-sm">Nenhuma conquista ainda.</p>
                    <p className="text-xs mt-1 sm:mt-2">Complete tarefas para ganhar conquistas!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                    {userAchievements.slice(0, 4).map((item: any) => {
                      const ach = item.achievement
                      return (
                        <div
                          key={ach.id}
                          className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-yellow-500/20 text-lg sm:text-2xl">
                            {ach.icon}
                          </div>
                          <p className="text-[10px] sm:text-sm font-medium text-center line-clamp-2">
                            {ach.name}
                          </p>
                          <Badge variant="outline" className="text-[8px] sm:text-xs">
                            {ach.category}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Habit Breakdown */}
            <Card className="glass">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Resumo dos Hábitos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span>Taxa de Conclusão Hoje</span>
                      <span>{completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                      <div className="text-base sm:text-lg font-bold text-green-500">
                        {habits.filter((h) => h.difficulty === "easy").length}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Fáceis</div>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-yellow-500">
                        {habits.filter((h) => h.difficulty === "medium").length}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Médios</div>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-red-500">
                        {habits.filter((h) => h.difficulty === "hard").length}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Difíceis</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4 sm:space-y-6">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Monthly XP Chart */}
                <Card className="glass">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-sm sm:text-base">XP MENSAL</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-2 sm:space-y-3">
                      {monthlyXP.map((data) => {
                        const maxXP = Math.max(...monthlyXP.map(m => m.xp), 1)
                        const percentage = (data.xp / maxXP) * 100
                        
                        return (
                          <div key={data.month} className="flex items-center gap-2 sm:gap-4">
                            <div className="w-6 sm:w-8 text-xs sm:text-sm font-medium">{data.month}</div>
                            <div className="flex-1">
                              <Progress value={percentage} className="h-1.5 sm:h-2 bg-muted">
                                <div className="h-full bg-green-500 transition-all" />
                              </Progress>
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-green-500">{data.xp} XP</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Calendar View */}
                <Card className="glass">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm sm:text-base capitalize">{monthName}</CardTitle>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button 
                          className="p-1 hover:bg-muted rounded transition-colors"
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button 
                          className="p-1 hover:bg-muted rounded transition-colors"
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
                      {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                        <div key={i} className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground p-1 sm:p-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {calendarDays.map((dayData, i) => {
                        if (!dayData) {
                          return <div key={`empty-${i}`} />
                        }

                        const { day, completions, isToday } = dayData
                        
                        // Definir cor baseada na contagem (0, 1, 2, 3+)
                        let bgColor = "#2B3137" // 0 tarefas
                        if (completions === 1) bgColor = "#026615" // 1 tarefa
                        else if (completions === 2) bgColor = "#2DBA4E" // 2 tarefas
                        else if (completions >= 3) bgColor = "#5ED364" // 3+ tarefas

                        return (
                          <div
                            key={i}
                            className={`aspect-square rounded-md flex items-center justify-center text-[10px] sm:text-xs font-medium transition-all ${
                              isToday ? "ring-1 sm:ring-2 ring-blue-500 ring-offset-1 ring-offset-background" : ""
                            }`}
                            style={{ backgroundColor: bgColor }}
                            title={`${day} - ${completions} tarefa${completions !== 1 ? 's' : ''} completada${completions !== 1 ? 's' : ''}`}
                          >
                            <span className={completions > 0 ? "text-white" : "text-muted-foreground"}>
                              {day}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Legenda */}
                    <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
                      <span>Menos</span>
                      <div className="flex gap-0.5 sm:gap-1">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: "#2B3137" }} title="0 tarefas" />
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: "#026615" }} title="1 tarefa" />
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: "#2DBA4E" }} title="2 tarefas" />
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: "#5ED364" }} title="3+ tarefas" />
                      </div>
                      <span>Mais</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <Card className="glass">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  Configurações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                {editMode ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-xs sm:text-sm">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className="glass bg-transparent text-sm sm:text-base h-9 sm:h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">Avatar</Label>
                      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3 mt-2">
                        {avatarOptions.map((avatar) => (
                          <button
                            key={avatar}
                            onClick={() => setFormData((prev) => ({ ...prev, avatar }))}
                            className={`p-2 sm:p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                              formData.avatar === avatar
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="text-lg sm:text-2xl">{avatar}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-accent text-xs sm:text-sm h-9 sm:h-10">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)} className="glass bg-transparent text-xs sm:text-sm h-9 sm:h-10">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">Informações Pessoais</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Nome: {userData.name} | Avatar: {userData.avatar}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(true)}
                        className="glass bg-transparent text-xs h-8 px-2 sm:px-3"
                      >
                        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Editar
                      </Button>
                    </div>

                    <div className="border-t border-border pt-3 sm:pt-4">
                      <h3 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">Exportar Dados</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
                        Baixe todos os seus dados em formato JSON
                      </p>
                      <Button variant="outline" onClick={exportData} className="glass bg-transparent text-xs sm:text-sm h-8 sm:h-9">
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Exportar
                      </Button>
                    </div>

                    <div className="border-t border-border pt-3 sm:pt-4">
                      <h3 className="font-medium text-sm sm:text-base mb-1 sm:mb-2">Estatísticas Gerais</h3>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-muted-foreground">Total de Hábitos:</span>
                          <span className="ml-2 font-medium">{totalHabits}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">XP Total:</span>
                          <span className="ml-2 font-medium">{userData.xp}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sequência Atual:</span>
                          <span className="ml-2 font-medium">{userData.streak} dias</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Moedas:</span>
                          <span className="ml-2 font-medium">{userData.coins}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Modal de Conquistas */}
      <AchievementsModal 
        open={achievementsModalOpen} 
        onOpenChange={setAchievementsModalOpen} 
      />
    </Dialog>
  )
}
