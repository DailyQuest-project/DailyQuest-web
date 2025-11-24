"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Lock, Search, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface AchievementData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement_key: string
  rarity?: "common" | "rare" | "epic" | "legendary"
  progress?: number
  target?: number
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
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-br from-amber-500/15 to-orange-600/15 border-amber-500/40 hover:from-amber-500/20 hover:to-orange-600/20 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/20"
      case "epic":
        return "bg-gradient-to-br from-purple-500/15 to-pink-500/15 border-purple-500/40 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20"
      case "rare":
        return "bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border-blue-500/40 hover:from-blue-500/20 hover:to-cyan-500/20 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20"
      case "common":
      default:
        return "bg-gradient-to-br from-slate-500/10 to-gray-500/10 border-slate-500/30 hover:from-slate-500/15 hover:to-gray-500/15 hover:border-slate-400/50 hover:shadow-md hover:shadow-slate-500/10"
    }
  }

  const getRarityLabel = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "Lendário"
      case "epic":
        return "Épico"
      case "rare":
        return "Raro"
      case "common":
      default:
        return "Comum"
    }
  }

  const getRarityTextColor = (rarity?: string) => {
    switch (rarity) {
      case "legendary":
        return "text-amber-400"
      case "epic":
        return "text-purple-400"
      case "rare":
        return "text-blue-400"
      case "common":
      default:
        return "text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const filteredAchievements = achievements.filter((item) =>
    item.achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.achievement.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.achievement.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalAchievements = achievements.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glass border-border/50 flex flex-col">
        <DialogHeader className="pb-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3 text-3xl font-bold">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Suas Conquistas
            </span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 flex-1">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Carregando conquistas...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {achievements.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="glass bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-400" />
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">{totalAchievements}</div>
                        <div className="text-xs text-muted-foreground">Desbloqueadas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">
                          {achievements.filter(a => a.achievement.rarity === 'epic' || a.achievement.rarity === 'legendary').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Épicas/Lendárias</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conquistas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass bg-transparent text-sm"
              />
            </div>

            {achievements.length === 0 ? (
              <div className="text-center py-16 flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma conquista ainda</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Complete tarefas, mantenha sequências e alcance níveis para desbloquear conquistas!
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                {filteredAchievements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">Nenhuma conquista encontrada</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      Tente buscar por outro termo ou limpe a busca para ver todas as conquistas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAchievements.map((item, index) => {
                      const ach = item.achievement
                      const isExpanded = expandedId === ach.id

                      return (
                        <Card
                          key={ach.id}
                          style={{
                            animationDelay: `${index * 0.03}s`,
                          }}
                          className={`glass border-2 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-2 ${getRarityColor(ach.rarity)}`}
                          onClick={() => setExpandedId(isExpanded ? null : ach.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-yellow-500/20 blur-lg rounded-full"></div>
                                  <div className="relative text-4xl transform hover:scale-110 transition-transform">
                                    {ach.icon}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-base truncate">{ach.name}</h4>
                                  <p className={`text-xs font-semibold ${getRarityTextColor(ach.rarity)}`}>
                                    {getRarityLabel(ach.rarity)}
                                  </p>
                                </div>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-border/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium mb-1.5">Descrição</p>
                                  <p className="text-sm text-foreground leading-relaxed">{ach.description}</p>
                                </div>

                                {ach.progress !== undefined && ach.target !== undefined && (
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-muted-foreground font-medium">Progresso</span>
                                      <span className="text-xs font-bold text-primary">
                                        {ach.progress} / {ach.target}
                                      </span>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 shadow-lg shadow-primary/50"
                                        style={{ width: `${Math.min((ach.progress / ach.target) * 100, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2">
                                  <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                                    {ach.category}
                                  </Badge>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    {formatDate(item.unlocked_at)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
