"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

interface XPBarProps {
  currentXP: number
  maxXP: number
  level: number
  animated?: boolean
  showParticles?: boolean
}

export function XPBar({ currentXP, maxXP, level, animated = true, showParticles = true }: XPBarProps) {
  const [displayXP, setDisplayXP] = useState(0)
  const [isLevelingUp, setIsLevelingUp] = useState(false)
  const percentage = (currentXP / maxXP) * 100

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayXP(currentXP)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayXP(currentXP)
    }
  }, [currentXP, animated])

  const triggerLevelUp = () => {
    setIsLevelingUp(true)
    setTimeout(() => setIsLevelingUp(false), 2000)
  }

  return (
    <div className="relative">
      {/* Level Badge */}
      <div className="flex items-center gap-3 mb-2">
        <Badge
          variant="secondary"
          className={`glass transition-all duration-300 ${isLevelingUp ? "scale-110 bg-gradient-to-r from-yellow-400 to-orange-500" : ""}`}
        >
          <Zap className="w-3 h-3 mr-1" />
          Nível {level}
        </Badge>
        <div className="text-sm text-muted-foreground">
          {displayXP.toLocaleString()}/{maxXP.toLocaleString()} XP
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="relative">
        <Progress
          value={percentage}
          className={`h-3 transition-all duration-500 ${isLevelingUp ? "animate-pulse" : ""}`}
        />

        {/* Particles Effect */}
        {showParticles && percentage > 80 && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        )}

        {/* Glow Effect */}
        {percentage > 90 && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-sm animate-pulse" />
        )}
      </div>

      {/* Level Up Animation */}
      {isLevelingUp && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold animate-bounce">
            LEVEL UP!
          </div>
        </div>
      )}
    </div>
  )
}
