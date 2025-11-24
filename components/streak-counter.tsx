"use client"

import { Flame, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StreakCounterProps {
  streak: number
  animated?: boolean
  size?: "sm" | "md" | "lg"
}

export function StreakCounter({ streak, animated = true, size = "md" }: StreakCounterProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "from-red-500 to-orange-600"
    if (streak >= 14) return "from-orange-500 to-yellow-500"
    if (streak >= 7) return "from-yellow-500 to-orange-400"
    return "from-gray-400 to-gray-500"
  }

  const getStreakIntensity = (streak: number) => {
    if (streak >= 30) return "animate-pulse"
    if (streak >= 14) return "animate-bounce"
    if (streak >= 7) return ""
    return "opacity-70"
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <Badge
      className={`
        bg-gradient-to-r ${getStreakColor(streak)} text-white border-0
        ${animated ? getStreakIntensity(streak) : ""}
        ${sizeClasses[size]}
        transition-all duration-300
      `}
    >
      <Flame className={`${iconSizes[size]} mr-1`} />
      {streak} dias
      {streak >= 7 && <Zap className={`${iconSizes[size]} ml-1`} />}
    </Badge>
  )
}
