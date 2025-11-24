"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface HealthStatus {
  frontend: 'checking' | 'ok' | 'error'
  backend: 'checking' | 'ok' | 'error'
  backendMessage?: string
}

export function ConnectionTest() {
  const [status, setStatus] = useState<HealthStatus>({
    frontend: 'ok',
    backend: 'checking',
  })

  const checkBackendConnection = async () => {
    setStatus(prev => ({ ...prev, backend: 'checking' }))
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/health`)
      
      if (response.ok) {
        const data = await response.json()
        setStatus(prev => ({
          ...prev,
          backend: 'ok',
          backendMessage: data.status || 'healthy',
        }))
      } else {
        setStatus(prev => ({ ...prev, backend: 'error' }))
      }
    } catch (error) {
      console.error('Backend connection error:', error)
      setStatus(prev => ({ ...prev, backend: 'error' }))
    }
  }

  useEffect(() => {
    checkBackendConnection()
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (state: 'checking' | 'ok' | 'error') => {
    switch (state) {
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'checking':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
    }
  }

  const getStatusBadge = (state: 'checking' | 'ok' | 'error') => {
    switch (state) {
      case 'ok':
        return <Badge variant="default" className="bg-green-500">Online</Badge>
      case 'error':
        return <Badge variant="destructive">Offline</Badge>
      case 'checking':
        return <Badge variant="secondary">Verificando...</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔌 Status da Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon(status.frontend)}
            <div>
              <p className="font-medium">Frontend</p>
              <p className="text-sm text-muted-foreground">Next.js App</p>
            </div>
          </div>
          {getStatusBadge(status.frontend)}
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon(status.backend)}
            <div>
              <p className="font-medium">Backend API</p>
              <p className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}
              </p>
              {status.backendMessage && (
                <p className="text-xs text-green-600 mt-1">
                  Status: {status.backendMessage}
                </p>
              )}
            </div>
          </div>
          {getStatusBadge(status.backend)}
        </div>

        <Button 
          onClick={checkBackendConnection}
          disabled={status.backend === 'checking'}
          className="w-full"
        >
          {status.backend === 'checking' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Testar Conexão'
          )}
        </Button>

        {status.backend === 'error' && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ Não foi possível conectar ao backend. Verifique se:
            </p>
            <ul className="text-xs text-red-600 dark:text-red-400 mt-2 ml-4 space-y-1">
              <li>• O backend está rodando na porta 8000</li>
              <li>• As variáveis de ambiente estão configuradas</li>
              <li>• O CORS está habilitado no backend</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
