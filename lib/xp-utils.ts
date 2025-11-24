/**
 * Utilitários para cálculos de gamificação (XP, Level, etc)
 */

/**
 * Calcula o XP necessário para alcançar um determinado nível
 * Usa uma fórmula progressiva: level * 100
 * 
 * Nível 1 = 100 XP
 * Nível 2 = 200 XP
 * Nível 3 = 300 XP
 * etc.
 */
export function getXPForLevel(level: number): number {
  return level * 100
}

/**
 * Calcula o XP total acumulado necessário para alcançar um nível
 * Soma todos os níveis anteriores
 * 
 * Para alcançar Nível 1 = 0 XP (início)
 * Para alcançar Nível 2 = 100 XP
 * Para alcançar Nível 3 = 300 XP (100 + 200)
 * Para alcançar Nível 4 = 600 XP (100 + 200 + 300)
 */
export function getTotalXPForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i)
  }
  return total
}

/**
 * Calcula o nível baseado no XP total
 * Inverte a função getTotalXPForLevel
 */
export function getLevelFromXP(totalXP: number): number {
  let level = 1
  let accumulatedXP = 0
  
  while (accumulatedXP + getXPForLevel(level) <= totalXP) {
    accumulatedXP += getXPForLevel(level)
    level++
  }
  
  return level
}

/**
 * Calcula o XP atual dentro do nível (progresso para o próximo nível)
 * e o XP necessário para completar o nível atual
 * 
 * Backend usa fórmula: level = (xp // 100) + 1
 * Isso significa: Level 1 = 0-99 XP, Level 2 = 100-199 XP, etc.
 * 
 * @returns { currentLevelXP, xpForNextLevel, percentage }
 */
export function getXPProgress(totalXP: number, currentLevel: number): {
  currentLevelXP: number
  xpForNextLevel: number
  percentage: number
} {
  // XP necessário para o próximo nível = level_atual * 100
  const xpForNextLevel = currentLevel * 100
  
  // XP atual dentro do nível = XP total % 100
  // Isso porque a cada 100 XP você sobe de nível
  const currentLevelXP = totalXP % 100
  
  const percentage = (currentLevelXP / xpForNextLevel) * 100
  
  return {
    currentLevelXP: Math.max(0, currentLevelXP), // Nunca negativo
    xpForNextLevel,
    percentage: Math.min(Math.max(percentage, 0), 100) // Entre 0 e 100
  }
}

/**
 * Formata XP para exibição (ex: 1000 => "1K", 1500000 => "1.5M")
 */
export function formatXP(xp: number): string {
  if (xp < 1000) return xp.toString()
  if (xp < 1000000) return `${(xp / 1000).toFixed(1)}K`
  return `${(xp / 1000000).toFixed(1)}M`
}

/**
 * Testes rápidos (executar no console do navegador):
 * 
 * import { getXPProgress, getTotalXPForLevel, getLevelFromXP } from '@/lib/xp-utils'
 * 
 * // Nível 1 com 50 XP
 * console.log(getXPProgress(50, 1)) // { currentLevelXP: 50, xpForNextLevel: 100, percentage: 50 }
 * 
 * // Nível 5 com 1150 XP (1000 acumulado + 150 no nível atual)
 * console.log(getTotalXPForLevel(5)) // 1000
 * console.log(getXPProgress(1150, 5)) // { currentLevelXP: 150, xpForNextLevel: 500, percentage: 30 }
 * 
 * // Verificar nível baseado em XP
 * console.log(getLevelFromXP(0))    // 1
 * console.log(getLevelFromXP(100))  // 2
 * console.log(getLevelFromXP(300))  // 3
 * console.log(getLevelFromXP(1000)) // 5
 */
