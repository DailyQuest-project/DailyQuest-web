"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Lock } from "lucide-react"

// Tipos baseados na resposta do backend
interface AchievementData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement_key: string
}

interface UserAchievement {
  unlocked_at: string
  achievement: AchievementData
}

interface AchievementsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AchievementsModal({ open, onOpenChange }: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchAchievements()
    }
  }, [open])

  const fetchAchievements = async () => {
    setIsLoading(true)
    try {
      const { achievementService } = await import("@/lib/api-service-complete")
      const data = await achievementService.getMyAchievements()
      console.log("🏆 Conquistas recebidas:", data)
      setAchievements(data as unknown as UserAchievement[])
    } catch (error) {
      console.error("Erro ao buscar conquistas:", error)
      setAchievements([])
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase()
    const colors: { [key: string]: string } = {
      progressão: "from-purple-500/20 to-purple-600/20 border-purple-500/40",
      "primeiros passos": "from-blue-500/20 to-blue-600/20 border-blue-500/40",
      streaks: "from-orange-500/20 to-red-500/20 border-orange-500/40",
      social: "from-green-500/20 to-emerald-600/20 border-green-500/40",
    }
    return colors[categoryLower] || "from-gray-500/20 to-gray-600/20 border-gray-500/40"
  }

  const getCategoryBadgeColor = (category: string) => {
    const categoryLower = category.toLowerCase()
    const colors: { [key: string]: string } = {
      progressão: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      "primeiros passos": "bg-blue-500/20 text-blue-400 border-blue-500/50",
      streaks: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      social: "bg-green-500/20 text-green-400 border-green-500/50",
    }
    return colors[categoryLower] || "bg-gray-500/20 text-gray-400 border-gray-500/50"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto glass border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-3xl font-bold">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/50">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            Todas as Conquistas
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            {achievements.length} conquista{achievements.length !== 1 ? 's' : ''} desbloqueada{achievements.length !== 1 ? 's' : ''}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Carregando conquistas...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {achievements.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma conquista ainda</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Complete tarefas, mantenha sequências e alcance níveis para desbloquear conquistas épicas!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((item) => {
                  const ach = item.achievement

                  return (
                    <Card
                      key={ach.id}
                      className={`glass border-2 bg-gradient-to-br ${getCategoryColor(ach.category)} hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden relative`}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-start gap-4">
                          {/* Icon with glow */}
                          <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full group-hover:bg-yellow-500/50 transition-all"></div>
                            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30 backdrop-blur-sm text-4xl group-hover:scale-110 transition-transform border-2 border-yellow-500/30">
                              {ach.icon}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-lg leading-tight group-hover:text-yellow-400 transition-colors">
                                {ach.name}
                              </h3>
                              <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 animate-pulse" />
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                              {ach.description}
                            </p>

                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`${getCategoryBadgeColor(ach.category)} text-xs font-semibold px-2 py-0.5`}
                              >
                                {ach.category}
                              </Badge>

                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                {formatDate(item.unlocked_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
