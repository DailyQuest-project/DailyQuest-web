"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Se já está autenticado, redirecionar para home
      if (isAuthenticated()) {
        router.push('/')
      } else {
        setShouldRender(true)
      }
    }
  }, [router])

  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}
