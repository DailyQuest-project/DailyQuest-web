"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Sword, User, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { PublicRoute } from "@/components/public-route"
import { useAuth } from "@/hooks/use-auth"

function RegisterPageContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { register, isLoading } = useAuth()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem!")
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    if (!formData.email.includes("@")) {
      setError("Por favor, insira um email válido")
      return
    }

    setError(null)

    try {
      console.log('🚀 [Register Page] Attempting registration:', {
        username: formData.name,
        email: formData.email,
        hasPassword: !!formData.password
      });
      
      await register({
        username: formData.name,
        email: formData.email,
        password: formData.password,
      })

      console.log('✅ [Register Page] Registration successful');
      setSuccess(true)
    } catch (err: any) {
      console.error("❌ [Register Page] Registration error:", {
        message: err.message,
        detail: err.detail,
        statusCode: err.statusCode,
        fullError: err
      });
      
      // Melhor extração de mensagem de erro
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (err.detail) {
        // FastAPI validation errors
        if (Array.isArray(err.detail)) {
          errorMessage = err.detail.map((e: any) => e.msg).join(', ');
        } else if (typeof err.detail === 'string') {
          errorMessage = err.detail;
        }
      } else if (err.message && err.message !== '[object Object]') {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="relative">
                <Shield className="w-8 h-8 text-primary" />
                <Sword className="w-4 h-4 text-secondary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Daily Quest</h1>
            </div>

            <CardTitle className="text-xl text-foreground">Comece sua jornada!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Crie sua conta e transforme seus hábitos em uma aventura épica
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                  <AlertDescription>
                    Conta criada com sucesso! Redirecionando para login...
                  </AlertDescription>
                </Alert>
              )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  required
                  autoComplete="name"
                  className="bg-background/50 border-border/50 focus:border-primary pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-background/50 border-border/50 focus:border-primary pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-background/50 border-border/50 focus:border-primary pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-background/50 border-border/50 focus:border-primary pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Criando conta...
                </div>
              ) : success ? (
                "Conta criada! Redirecionando..."
              ) : (
                "Criar conta"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Fazer login
              </Link>
            </div>
          </form>

          {/* Welcome bonus preview */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="text-center text-xs text-muted-foreground mb-3">🎁 Bônus de boas-vindas</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">+100 XP</div>
                <div className="text-xs text-muted-foreground">Inicial</div>
              </div>
              <div>
                <div className="text-lg font-bold text-secondary">+50 🪙</div>
                <div className="text-xs text-muted-foreground">Moedas</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">3 🏆</div>
                <div className="text-xs text-muted-foreground">Conquistas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterPageContent />
    </PublicRoute>
  )
}
