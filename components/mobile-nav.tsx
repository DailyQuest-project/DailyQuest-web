"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { XPBar } from "@/components/xp-bar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, Coins, Volume2, VolumeX, User, Trophy, Calendar, Settings } from "lucide-react"

interface MobileNavProps {
  userData: any
  soundEnabled: boolean
  onSoundToggle: () => void
  onProfileOpen: () => void
}

export function MobileNav({ userData, soundEnabled, onSoundToggle, onProfileOpen }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden glass bg-transparent">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="glass-strong w-80">
        <SheetHeader>
          <SheetTitle className="text-left">Daily Quest</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* User Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarFallback className="text-lg">{userData.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{userData.name}</h3>
                <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                  Nível {userData.level}
                </Badge>
              </div>
            </div>

            <XPBar currentXP={userData.xp} maxXP={userData.xpToNext} level={userData.level} animated={false} />

            <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{userData.coins} moedas</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start glass bg-transparent"
              onClick={() => {
                onProfileOpen()
                setOpen(false)
              }}
            >
              <User className="mr-3 h-4 w-4" />
              Perfil
            </Button>

            <Button variant="ghost" className="w-full justify-start glass bg-transparent">
              <Trophy className="mr-3 h-4 w-4" />
              Conquistas
            </Button>

            <Button variant="ghost" className="w-full justify-start glass bg-transparent">
              <Calendar className="mr-3 h-4 w-4" />
              Progresso
            </Button>

            <Button variant="ghost" className="w-full justify-start glass bg-transparent">
              <Settings className="mr-3 h-4 w-4" />
              Configurações
            </Button>
          </div>

          {/* Settings */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Som</span>
              <Button variant="ghost" size="sm" onClick={onSoundToggle} className="glass bg-transparent">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tema</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
