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
        <Button variant="ghost" size="sm" className="md:hidden glass bg-transparent h-8 w-8 p-0">
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="glass-strong w-[280px] sm:w-80 p-4 sm:p-6">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left text-base sm:text-lg">Daily Quest</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* User Profile Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/20">
                <AvatarFallback className="text-base sm:text-lg">{userData.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm sm:text-base">{userData.name}</h3>
                <Badge className="bg-gradient-to-r from-primary to-accent text-white text-[10px] sm:text-xs">
                  Nível {userData.level}
                </Badge>
              </div>
            </div>

            <XPBar currentXP={userData.xp} maxXP={userData.xpToNext} level={userData.level} animated={false} />

            <div className="flex items-center gap-2 glass px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
              <span className="font-medium text-xs sm:text-sm">{userData.coins} moedas</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1.5 sm:space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start glass bg-transparent h-9 sm:h-10 text-xs sm:text-sm"
              onClick={() => {
                onProfileOpen()
                setOpen(false)
              }}
            >
              <User className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Perfil
            </Button>

            <Button variant="ghost" className="w-full justify-start glass bg-transparent h-9 sm:h-10 text-xs sm:text-sm">
              <Trophy className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Conquistas
            </Button>

            <Button variant="ghost" className="w-full justify-start glass bg-transparent h-9 sm:h-10 text-xs sm:text-sm">
              <Calendar className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Progresso
            </Button>

            <Button variant="ghost" className="w-full justify-start glass bg-transparent h-9 sm:h-10 text-xs sm:text-sm">
              <Settings className="mr-2 sm:mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Configurações
            </Button>
          </div>

          {/* Settings */}
          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Som</span>
              <Button variant="ghost" size="sm" onClick={onSoundToggle} className="glass bg-transparent h-8 w-8 p-0">
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">Tema</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
