"use client"

import { useState, useCallback } from "react"
import { LevelUpModal } from "@/components/level-up-modal"
import { XPGainAnimation } from "@/components/xp-gain-animation"
import { CoinAnimation } from "@/components/coin-animation"
import { ConfettiCelebration } from "@/components/confetti-celebration"
import { useToast } from "@/hooks/use-toast"
import type { CompleteTaskResponse } from "@/lib/api-types-complete"

interface GamificationFeedback {
  showLevelUp: (newLevel: number) => void
  showXPGain: (xp: number, position?: { x: number; y: number }) => void
  showCoins: (coins: number, position?: { x: number; y: number }) => void
  showConfetti: () => void
  handleTaskComplete: (response: CompleteTaskResponse, oldLevel: number) => void
}

export function useGamificationFeedback(): GamificationFeedback {
  const { toast } = useToast()
  const [levelUpState, setLevelUpState] = useState({ isOpen: false, level: 1 })
  const [xpAnimations, setXpAnimations] = useState<Array<{ id: string; xp: number; position?: { x: number; y: number } }>>([])
  const [coinAnimations, setCoinAnimations] = useState<Array<{ id: string; coins: number; position?: { x: number; y: number } }>>([])
  const [showConfetti, setShowConfetti] = useState(false)

  const showLevelUp = useCallback((newLevel: number) => {
    setLevelUpState({ isOpen: true, level: newLevel })
    setShowConfetti(true)
    
    // Auto-hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000)
  }, [])

  const showXPGain = useCallback((xp: number, position?: { x: number; y: number }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setXpAnimations(prev => [...prev, { id, xp, position }])
    
    // Remove animation after it completes
    setTimeout(() => {
      setXpAnimations(prev => prev.filter(anim => anim.id !== id))
    }, 2000)
  }, [])

  const showCoins = useCallback((coins: number, position?: { x: number; y: number }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setCoinAnimations(prev => [...prev, { id, coins, position }])
    
    // Remove animation after it completes
    setTimeout(() => {
      setCoinAnimations(prev => prev.filter(anim => anim.id !== id))
    }, 2000)
  }, [])

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }, [])

  const handleTaskComplete = useCallback((response: CompleteTaskResponse, oldLevel: number) => {
    console.log("🎮 [DEBUG] handleTaskComplete chamado")
    console.log("   - Old Level:", oldLevel, typeof oldLevel)
    console.log("   - New Level:", response.user?.level, typeof response.user?.level)
    console.log("   - Response completo:", response)
    
    // Show XP gain
    if (response.task_completion?.xp_earned) {
      showXPGain(response.task_completion.xp_earned)
      
      toast({
        title: "🎉 Tarefa Completada!",
        description: `Você ganhou ${response.task_completion.xp_earned} XP!`,
      })
    }

    // CRÍTICO: Verificar level up usando valores exatos da API
    // Garantir comparação numérica, não string
    const newLevel = Number(response.user?.level)
    const previousLevel = Number(oldLevel)
    
    console.log("🔢 [DEBUG] Comparação de nível:")
    console.log("   - Previous Level (number):", previousLevel)
    console.log("   - New Level (number):", newLevel)
    console.log("   - Level up?:", newLevel > previousLevel)
    
    if (response.user && newLevel > previousLevel) {
      // Level up detectado!
      console.log("🚀 [DEBUG] LEVEL UP DETECTADO!")
      showLevelUp(newLevel)
      
      toast({
        title: "🚀 LEVEL UP!",
        description: `Parabéns! Você alcançou o nível ${newLevel}!`,
      })
    }

    // Show streak info if available
    if (response.streak_info?.current_streak && response.streak_info.current_streak > 1) {
      toast({
        title: `🔥 ${response.streak_info.current_streak} dias de sequência!`,
        description: "Continue assim para manter seu streak!",
      })
    }

    // Show confetti for special occasions (múltiplos de 7 dias de streak)
    if (response.streak_info?.current_streak && response.streak_info.current_streak % 7 === 0) {
      triggerConfetti()
    }
    
    // Show confetti on level up
    if (response.user && newLevel > previousLevel) {
      triggerConfetti()
    }
  }, [showXPGain, showLevelUp, toast, triggerConfetti])

  return {
    showLevelUp,
    showXPGain,
    showCoins,
    showConfetti: triggerConfetti,
    handleTaskComplete,
  }
}

// Provider component to render animations
interface GamificationFeedbackProviderProps {
  children: React.ReactNode
}

export function GamificationFeedbackProvider({ children }: GamificationFeedbackProviderProps) {
  return (
    <>
      {children}
    </>
  )
}
