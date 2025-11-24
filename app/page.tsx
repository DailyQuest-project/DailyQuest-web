"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar usuários logados para o dashboard
    const user = getUser()
    if (user) {
      console.log("✅ Usuário logado detectado, redirecionando para /dashboard")
      router.push('/dashboard')
    } else {
      console.log("⚠️ Usuário não logado, redirecionando para /login")
      router.push('/login')
    }
  }, [router])

  // Mostrar loading enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}
