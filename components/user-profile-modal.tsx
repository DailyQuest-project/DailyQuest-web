"use client"

import type React from "react"

import { useState } from "react"
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
}: UserProfileModalProps) {
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: userData.name,
    avatar: userData.avatar,
  })

  const handleSave = () => {
    onUpdateUser({ ...userData, ...formData })
    setEditMode(false)
  }

  const totalHabits = habits.length
  const completedToday = completedHabits.size
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0
  const totalXPEarned = habits.reduce((sum, habit) => sum + (completedHabits.has(habit.id) ? habit.xp : 0), 0)
  const averageStreak = habits.length > 0 ? habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length : 0
  const longestStreak = Math.max(...habits.map((h) => h.streak), 0)
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length

  // Mock historical data for charts
  const weeklyProgress = [
    { day: "Dom", completed: 3, total: 4 },
    { day: "Seg", completed: 4, total: 4 },
    { day: "Ter", completed: 2, total: 4 },
    { day: "Qua", completed: 4, total: 4 },
    { day: "Qui", completed: 3, total: 4 },
    { day: "Sex", completed: 4, total: 4 },
    { day: "Sáb", completed: 2, total: 4 },
  ]

  const monthlyXP = [
    { month: "Jan", xp: 450 },
    { month: "Fev", xp: 520 },
    { month: "Mar", xp: 680 },
    { month: "Abr", xp: 750 },
    { month: "Mai", xp: 890 },
    { month: "Jun", xp: 920 },
  ]

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
      <DialogContent className="glass-strong max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Perfil do Usuário
          </DialogTitle>
          <DialogDescription>
            Visualize seu progresso, conquistas e configurações de perfil
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Header */}
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 border-4 border-primary/20">
                    <AvatarFallback className="text-3xl">{userData.avatar}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{userData.name}</h2>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Nível {userData.level}
                      </Badge>
                      <StreakCounter streak={userData.streak} size="md" />
                    </div>
                    <XPBar currentXP={userData.xp} maxXP={userData.xpToNext} level={userData.level} animated={false} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/20">
                    <Target className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {completedToday}/{totalHabits}
                  </div>
                  <div className="text-sm text-muted-foreground">Hoje</div>
                </CardContent>
              </Card>

              <Card className="glass text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-yellow-500/20">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold">{totalXPEarned}</div>
                  <div className="text-sm text-muted-foreground">XP Hoje</div>
                </CardContent>
              </Card>

              <Card className="glass text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-orange-500/20">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold">{longestStreak}</div>
                  <div className="text-sm text-muted-foreground">Maior Sequência</div>
                </CardContent>
              </Card>

              <Card className="glass text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-purple-500/20">
                    <Trophy className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {unlockedAchievements}/{achievements.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Conquistas</div>
                </CardContent>
              </Card>
            </div>

            {/* Habit Breakdown */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Resumo dos Hábitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Taxa de Conclusão Hoje</span>
                      <span>{completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-500">
                        {habits.filter((h) => h.difficulty === "easy").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Fáceis</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-500">
                        {habits.filter((h) => h.difficulty === "medium").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Médios</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-500">
                        {habits.filter((h) => h.difficulty === "hard").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Difíceis</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Weekly Progress Chart */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Progresso Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyProgress.map((day, index) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <div className="w-8 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <Progress value={(day.completed / day.total) * 100} className="h-3" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {day.completed}/{day.total}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly XP Chart */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  XP Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyXP.map((month, index) => (
                    <div key={month.month} className="flex items-center gap-4">
                      <div className="w-8 text-sm font-medium">{month.month}</div>
                      <div className="flex-1">
                        <Progress value={(month.xp / 1000) * 100} className="h-3" />
                      </div>
                      <div className="text-sm font-medium text-primary">{month.xp} XP</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Calendário de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const intensity = Math.random()
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm border ${
                          intensity > 0.7
                            ? "bg-green-500"
                            : intensity > 0.4
                              ? "bg-green-400"
                              : intensity > 0.2
                                ? "bg-green-300"
                                : "bg-muted"
                        }`}
                        title={`${Math.floor(intensity * 4)} hábitos completados`}
                      />
                    )
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <span>Menos</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-muted" />
                    <div className="w-3 h-3 rounded-sm bg-green-300" />
                    <div className="w-3 h-3 rounded-sm bg-green-400" />
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                  </div>
                  <span>Mais</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`glass transition-all hover:scale-105 ${
                    achievement.unlocked
                      ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                      : "opacity-60"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={achievement.unlocked ? "default" : "secondary"}
                            className={achievement.unlocked ? "bg-gradient-to-r from-yellow-400 to-orange-500" : ""}
                          >
                            {achievement.unlocked ? "Desbloqueada" : "Bloqueada"}
                          </Badge>
                          {achievement.rarity && (
                            <Badge variant="outline" className="capitalize">
                              {achievement.rarity}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {achievement.unlocked && <Medal className="w-6 h-6 text-yellow-500" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className="glass bg-transparent"
                      />
                    </div>

                    <div>
                      <Label>Avatar</Label>
                      <div className="grid grid-cols-6 gap-3 mt-2">
                        {avatarOptions.map((avatar) => (
                          <button
                            key={avatar}
                            onClick={() => setFormData((prev) => ({ ...prev, avatar }))}
                            className={`p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                              formData.avatar === avatar
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="text-2xl">{avatar}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-accent">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)} className="glass bg-transparent">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Informações Pessoais</h3>
                        <p className="text-sm text-muted-foreground">
                          Nome: {userData.name} | Avatar: {userData.avatar}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditMode(true)}
                        className="glass bg-transparent"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h3 className="font-medium mb-2">Exportar Dados</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Baixe todos os seus dados do HabitFlow em formato JSON
                      </p>
                      <Button variant="outline" onClick={exportData} className="glass bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Dados
                      </Button>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h3 className="font-medium mb-2">Estatísticas Gerais</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total de Hábitos:</span>
                          <span className="ml-2 font-medium">{totalHabits}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">XP Total:</span>
                          <span className="ml-2 font-medium">{userData.xp}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sequência Média:</span>
                          <span className="ml-2 font-medium">{averageStreak.toFixed(1)} dias</span>
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
    </Dialog>
  )
}
