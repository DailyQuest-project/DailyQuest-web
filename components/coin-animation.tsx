"use client"

import { useEffect, useState } from "react"
import { Coins, Plus } from "lucide-react"

interface CoinAnimationProps {
  coins: number
  show: boolean
  onComplete?: () => void
}

export function CoinAnimation({ coins, show, onComplete }: CoinAnimationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div className="fixed top-20 right-4 pointer-events-none z-50">
      <div className="animate-bounce">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold">
          <Plus className="w-4 h-4" />
          <Coins className="w-4 h-4" />
          {coins}
        </div>
      </div>
    </div>
  )
}
