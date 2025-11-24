"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Flame, Clock, Check, MoreHorizontal, Edit, Trash2, Calendar, Star } from "lucide-react"
import type { Task, Habit, Todo } from "@/lib/api-types-complete"
import { TaskType } from "@/lib/api-types-complete"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TaskCardProps {
  task: Task
  onComplete: (id: string) => Promise<void>
  onEdit?: (task: Task) => void
  onDelete: (id: string, taskType: 'habit' | 'todo') => Promise<void>
}

const difficultyConfig = {
  EASY: { label: "Fácil", color: "bg-green-600", xp: 15 },
  MEDIUM: { label: "Médio", color: "bg-yellow-600", xp: 25 },
  HARD: { label: "Difícil", color: "bg-red-600", xp: 40 },
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isHabit = task.task_type === TaskType.HABIT
  const habit = isHabit ? (task as Habit) : null
  const todo = !isHabit ? (task as Todo) : null

  const difficulty = difficultyConfig[task.difficulty]

  // VALIDAÇÃO CRÍTICA: Verificar se hábito já foi completado hoje
  const isHabitCompletedToday = (): boolean => {
    if (!isHabit || !habit?.last_completed_at) return false
    
    const lastCompletedString = habit.last_completed_at
    const lastCompleted = new Date(lastCompletedString)
    const today = new Date()
    
    const isSameDay = (
      lastCompleted.getDate() === today.getDate() &&
      lastCompleted.getMonth() === today.getMonth() &&
      lastCompleted.getFullYear() === today.getFullYear()
    )
    
    console.log("🔍 [DEBUG] isHabitCompletedToday para tarefa:", task.id)
    console.log("   - Last Completed (string):", lastCompletedString)
    console.log("   - Last Completed (Date):", lastCompleted)
    console.log("   - Today:", today)
    console.log("   - Is Same Day?:", isSameDay)
    
    return isSameDay
  }

  // VALIDAÇÃO CRÍTICA: ToDo completado não pode ser completado novamente
  const canComplete = (): boolean => {
    const isCurrentlyCompleting = isCompleting
    const isHabitDoneToday = isHabit && isHabitCompletedToday()
    const isTodoCompleted = !isHabit && task.completed
    
    const canDo = !isCurrentlyCompleting && !isHabitDoneToday && !isTodoCompleted
    
    console.log("🎯 [DEBUG] canComplete para tarefa:", task.id)
    console.log("   - isCompleting:", isCurrentlyCompleting)
    console.log("   - isHabit:", isHabit)
    console.log("   - isHabitDoneToday:", isHabitDoneToday)
    console.log("   - task.completed:", task.completed)
    console.log("   - Pode completar?:", canDo)
    
    return canDo
  }

  const handleComplete = async () => {
    console.log("🎯 [DEBUG] handleComplete clicado para tarefa:", task.id)
    
    if (!canComplete()) {
      console.warn("⚠️ [DEBUG] Ação bloqueada - tarefa não pode ser completada")
      return
    }
    
    console.log("✅ [DEBUG] Iniciando completar tarefa...")
    setIsCompleting(true)
    try {
      await onComplete(task.id)
      console.log("✅ [DEBUG] Tarefa completada com sucesso!")
    } catch (error) {
      console.error("❌ [DEBUG] Erro ao completar tarefa:", error)
    } finally {
      setIsCompleting(false)
      console.log("🔄 [DEBUG] isCompleting resetado para false")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(task.id, task.task_type === TaskType.HABIT ? 'habit' : 'todo')
      setShowDeleteDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const getFrequencyLabel = (habit: Habit): string => {
    switch (habit.frequency_type) {
      case "DAILY":
        return "Diariamente"
      case "WEEKLY_TIMES":
        return `${habit.frequency_target_times}x por semana`
      case "SPECIFIC_DAYS":
        const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
        const selectedDays = habit.frequency_days?.map(d => days[d]).join(", ")
        return selectedDays || "Dias específicos"
      default:
        return ""
    }
  }

  const isOverdue = (deadline?: string): boolean => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  return (
    <>
      <Card
        className={`transition-all duration-300 hover:shadow-lg ${
          task.completed || isHabitCompletedToday()
            ? "opacity-60 border-green-500/50 bg-green-50 dark:bg-green-950/20" 
            : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={`${difficulty.color} text-white`}>
                  <Star className="w-3 h-3 mr-1" />
                  {difficulty.xp} XP
                </Badge>
                
                {isHabit && habit && (
                  <>
                    <Badge variant="outline" className="gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {habit.current_streak} dias
                    </Badge>
                    {habit.best_streak > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Recorde: {habit.best_streak}
                      </Badge>
                    )}
                  </>
                )}

                {todo && todo.deadline && (
                  <Badge
                    variant={isOverdue(todo.deadline) ? "destructive" : "outline"}
                    className="gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(todo.deadline), {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                  </Badge>
                )}
              </div>

              <h3
                className={`font-semibold text-lg ${
                  task.completed || isHabitCompletedToday()
                    ? "line-through text-muted-foreground" 
                    : ""
                }`}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}

              {isHabit && habit && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {getFrequencyLabel(habit)}
                  {habit.frequency_type === "WEEKLY_TIMES" && habit.times_completed_this_week !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {habit.times_completed_this_week}/{habit.frequency_target_times} esta semana
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Button
            onClick={handleComplete}
            disabled={!canComplete()}
            className={`w-full ${
              task.completed || isHabitCompletedToday()
                ? "bg-green-600 hover:bg-green-600 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isCompleting ? (
              "Completando..."
            ) : task.completed || isHabitCompletedToday() ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isHabit ? "Completado Hoje" : "Completado"}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Completar (+{difficulty.xp} XP)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente{" "}
              <strong>{task.title}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
