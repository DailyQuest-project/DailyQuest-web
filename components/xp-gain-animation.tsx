"use client"

import { useEffect, useState } from "react"
import { Star, Plus } from "lucide-react"

interface XPGainAnimationProps {
  xp: number
  show: boolean
  onComplete?: () => void
}

export function XPGainAnimation({ xp, show, onComplete }: XPGainAnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-bounce">
        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-lg">
          <Plus className="w-5 h-5" />
          <Star className="w-5 h-5" />
          {xp} XP
        </div>
      </div>

      {/* Particle burst */}
      <div className="absolute">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
            style={{
              transform: `rotate(${i * 45}deg) translateY(-40px)`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    </div>
  )
}
