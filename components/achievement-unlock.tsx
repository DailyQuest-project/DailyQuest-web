"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Sparkles } from "lucide-react"

interface Achievement {
  id: number
  name: string
  icon: string
  description: string
  rarity?: "common" | "rare" | "epic" | "legendary"
}

interface AchievementUnlockProps {
  achievement: Achievement | null
  show: boolean
  onComplete?: () => void
}

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-500",
}

export function AchievementUnlock({ achievement, show, onComplete }: AchievementUnlockProps) {
  const [visible, setVisible] = useState(false)
  const [stage, setStage] = useState(0) // 0: hidden, 1: appearing, 2: showing, 3: disappearing

  useEffect(() => {
    if (show && achievement) {
      setVisible(true)
      setStage(1)

      const timer1 = setTimeout(() => setStage(2), 500)
      const timer2 = setTimeout(() => setStage(3), 3000)
      const timer3 = setTimeout(() => {
        setVisible(false)
        setStage(0)
        onComplete?.()
      }, 3500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [show, achievement, onComplete])

  if (!visible || !achievement) return null

  const rarity = achievement.rarity || "common"
  const gradientClass = rarityColors[rarity]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card
        className={`glass-strong max-w-md w-full transform transition-all duration-500 ${
          stage === 1 ? "scale-0 rotate-180" : stage === 2 ? "scale-100 rotate-0" : "scale-110 opacity-0"
        }`}
      >
        <CardContent className="p-6 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10`} />

          {/* Sparkle effects */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute w-4 h-4 text-yellow-400 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="mb-4">
              <Trophy className="w-12 h-12 mx-auto text-yellow-500 animate-bounce" />
            </div>

            <Badge className={`bg-gradient-to-r ${gradientClass} text-white mb-3`}>Conquista Desbloqueada!</Badge>

            <div className="text-4xl mb-3">{achievement.icon}</div>

            <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
            <p className="text-muted-foreground text-sm">{achievement.description}</p>

            <Badge variant="outline" className="mt-4 capitalize">
              {rarity}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
