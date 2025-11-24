"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Trophy, Zap } from "lucide-react"

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
}

export function LevelUpModal({ isOpen, onClose, newLevel }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="relative">
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: [
                      "#FFD700",
                      "#FFA500",
                      "#FF6347",
                      "#4169E1",
                      "#32CD32",
                    ][Math.floor(Math.random() * 5)],
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
          )}

          <DialogHeader className="text-center space-y-4">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              LEVEL UP!
            </DialogTitle>

            {/* Level Badge */}
            <div className="flex justify-center">
              <Badge className="px-6 py-3 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500">
                <Zap className="w-6 h-6 mr-2" />
                Nível {newLevel}
              </Badge>
            </div>

            {/* Description */}
            <DialogDescription className="text-center text-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>Parabéns, você evoluiu!</span>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-muted-foreground">
                Continue completando suas tarefas para alcançar novos níveis e desbloquear conquistas épicas!
              </p>
            </DialogDescription>

            {/* Rewards */}
            <div className="bg-primary/10 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm">Recompensas Desbloqueadas:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">
                  +50 Moedas
                </Badge>
                <Badge variant="secondary">
                  Nova Conquista
                </Badge>
                <Badge variant="secondary">
                  +100 XP Bônus
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  )
}
