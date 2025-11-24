"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated, getUser } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    // Verificar autenticação no client-side
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      
      if (!authenticated) {
        // Redirecionar para login se não autenticado
        router.push(`/login?redirect=${pathname}`)
      } else {
        setIsAuth(true)
      }
      
      setIsChecking(false)
    }

    // Executar verificação apenas no cliente
    if (typeof window !== 'undefined') {
      checkAuth()
    }
  }, [router, pathname])

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não autenticado, não renderizar nada (já está redirecionando)
  if (!isAuth) {
    return null
  }

  // Se autenticado, renderizar children
  return <>{children}</>
}
