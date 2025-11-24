"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Star, Repeat, CheckSquare } from "lucide-react"
import type { CreateHabitRequest, CreateTodoRequest } from "@/lib/api-types-complete"
import { TaskDifficulty, FrequencyType } from "@/lib/api-types-complete"

interface CreateTaskModalProps {
  onCreateHabit: (data: CreateHabitRequest) => Promise<void>
  onCreateTodo: (data: CreateTodoRequest) => Promise<void>
  children: React.ReactNode
}

const difficultyOptions = [
  { value: TaskDifficulty.EASY, label: "Fácil", xp: 15, color: "bg-green-600", description: "Tarefas simples e rápidas" },
  { value: TaskDifficulty.MEDIUM, label: "Médio", xp: 25, color: "bg-yellow-600", description: "Requer esforço moderado" },
  { value: TaskDifficulty.HARD, label: "Difícil", xp: 40, color: "bg-red-600", description: "Desafios significativos" },
]

const taskTypes = [
  { value: "habit", label: "Hábito", icon: Repeat, description: "Ações recorrentes sem prazo fixo" },
  { value: "todo", label: "Afazer", icon: CheckSquare, description: "Tarefas únicas com deadline" },
]

const frequencyOptions = [
  { value: FrequencyType.DAILY, label: "Diariamente", description: "Todos os dias" },
  { value: FrequencyType.WEEKLY_TIMES, label: "N vezes por semana", description: "Defina quantas vezes" },
  { value: FrequencyType.SPECIFIC_DAYS, label: "Dias específicos", description: "Escolha os dias" },
]

const weekDays = [
  { value: 0, label: "Seg" },
  { value: 1, label: "Ter" },
  { value: 2, label: "Qua" },
  { value: 3, label: "Qui" },
  { value: 4, label: "Sex" },
  { value: 5, label: "Sáb" },
  { value: 6, label: "Dom" },
]

export function CreateTaskModal({ onCreateHabit, onCreateTodo, children }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: TaskDifficulty.MEDIUM,
    type: "habit" as "habit" | "todo",
    frequencyType: FrequencyType.DAILY,
    frequencyTargetTimes: 3,
    selectedDays: [] as number[],
    deadline: "",
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Título obrigatório
    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório"
    }

    // Validações específicas de hábito
    if (formData.type === "habit") {
      if (formData.frequencyType === FrequencyType.WEEKLY_TIMES) {
        if (formData.frequencyTargetTimes < 1 || formData.frequencyTargetTimes > 7) {
          newErrors.frequencyTargetTimes = "Meta deve ser entre 1 e 7 vezes por semana"
        }
      }
      
      if (formData.frequencyType === FrequencyType.SPECIFIC_DAYS) {
        if (formData.selectedDays.length === 0) {
          newErrors.selectedDays = "Selecione pelo menos um dia da semana"
        }
      }
    }

    // Validações específicas de ToDo
    if (formData.type === "todo") {
      if (!formData.deadline) {
        newErrors.deadline = "Deadline é obrigatório para afazeres"
      } else {
        const deadlineDate = new Date(formData.deadline)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (deadlineDate < today) {
          newErrors.deadline = "Deadline não pode ser no passado"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      if (formData.type === "habit") {
        // VALIDAÇÃO: Garantir que os enums estão corretos
        const habitData: CreateHabitRequest = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          difficulty: formData.difficulty, // Enum: "EASY", "MEDIUM", "HARD"
          frequency_type: formData.frequencyType, // Enum: "DAILY", "WEEKLY_TIMES", "SPECIFIC_DAYS"
        }

        // REGRA: Adicionar campos opcionais baseados no tipo de frequência
        if (formData.frequencyType === FrequencyType.WEEKLY_TIMES) {
          if (!formData.frequencyTargetTimes || formData.frequencyTargetTimes < 1 || formData.frequencyTargetTimes > 7) {
            throw new Error("Meta semanal deve ser entre 1 e 7")
          }
          habitData.frequency_target_times = formData.frequencyTargetTimes
        }
        
        if (formData.frequencyType === FrequencyType.SPECIFIC_DAYS) {
          if (!formData.selectedDays || formData.selectedDays.length === 0) {
            throw new Error("Selecione pelo menos um dia da semana")
          }
          // REGRA: Dias devem ser 0-6 (0=Segunda, 6=Domingo)
          habitData.frequency_days = [...formData.selectedDays].sort((a, b) => a - b)
        }

        await onCreateHabit(habitData)
      } else {
        const todoData: CreateTodoRequest = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          difficulty: formData.difficulty, // Enum: "EASY", "MEDIUM", "HARD"
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        }

        await onCreateTodo(todoData)
      }

      // Resetar formulário
      setFormData({
        title: "",
        description: "",
        difficulty: TaskDifficulty.MEDIUM,
        type: "habit",
        frequencyType: FrequencyType.DAILY,
        frequencyTargetTimes: 3,
        selectedDays: [],
        deadline: "",
      })
      setErrors({})
      setOpen(false)
    } catch (error) {
      console.error("Error creating task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }))
  }

  const selectedDifficulty = difficultyOptions.find((d) => d.value === formData.difficulty)
  const selectedType = taskTypes.find((t) => t.value === formData.type)

  // Data mínima para deadline (hoje)
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Crie um novo hábito ou afazer para sua jornada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título e Descrição */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Meditar por 10 minutos"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva sua tarefa..."
                rows={3}
              />
            </div>
          </div>

          {/* Tipo de Atividade */}
          <div>
            <Label>Tipo de Atividade</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {taskTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      formData.type === type.value ? "ring-2 ring-primary bg-primary/10" : "hover:bg-card/90"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, type: type.value as "habit" | "todo" }))}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Frequência (apenas para hábitos) */}
          {formData.type === "habit" && (
            <div className="space-y-4">
              <div>
                <Label>Frequência</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {frequencyOptions.map((frequency) => (
                    <Card
                      key={frequency.value}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        formData.frequencyType === frequency.value
                          ? "ring-2 ring-primary bg-primary/10"
                          : "hover:bg-card/90"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, frequencyType: frequency.value }))}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="font-medium text-sm">{frequency.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{frequency.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Meta semanal */}
              {formData.frequencyType === FrequencyType.WEEKLY_TIMES && (
                <div>
                  <Label htmlFor="weeklyTarget">Meta Semanal (1-7 vezes) *</Label>
                  <Input
                    id="weeklyTarget"
                    type="number"
                    min={1}
                    max={7}
                    value={formData.frequencyTargetTimes}
                    onChange={(e) => setFormData((prev) => ({ 
                      ...prev, 
                      frequencyTargetTimes: parseInt(e.target.value) || 1 
                    }))}
                    className={errors.frequencyTargetTimes ? "border-destructive" : ""}
                  />
                  {errors.frequencyTargetTimes && (
                    <p className="text-sm text-destructive mt-1">{errors.frequencyTargetTimes}</p>
                  )}
                </div>
              )}

              {/* Dias específicos */}
              {formData.frequencyType === FrequencyType.SPECIFIC_DAYS && (
                <div>
                  <Label>Dias da Semana *</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {weekDays.map((day) => (
                      <div
                        key={day.value}
                        className={`flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.selectedDays.includes(day.value)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => toggleDay(day.value)}
                      >
                        <Checkbox
                          checked={formData.selectedDays.includes(day.value)}
                          onCheckedChange={() => toggleDay(day.value)}
                          className="pointer-events-none"
                        />
                        <span className="text-xs mt-1">{day.label}</span>
                      </div>
                    ))}
                  </div>
                  {errors.selectedDays && (
                    <p className="text-sm text-destructive mt-1">{errors.selectedDays}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Deadline (apenas para ToDos) */}
          {formData.type === "todo" && (
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                min={today}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                className={errors.deadline ? "border-destructive" : ""}
              />
              {errors.deadline && <p className="text-sm text-destructive mt-1">{errors.deadline}</p>}
            </div>
          )}

          {/* Dificuldade */}
          <div>
            <Label>Dificuldade</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {difficultyOptions.map((difficulty) => (
                <Card
                  key={difficulty.value}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    formData.difficulty === difficulty.value
                      ? "ring-2 ring-primary bg-primary/10"
                      : "hover:bg-card/90"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, difficulty: difficulty.value }))}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-4 h-4 rounded-full ${difficulty.color} mx-auto mb-2`} />
                    <div className="font-medium text-sm">{difficulty.label}</div>
                    <div className="text-xs text-muted-foreground">{difficulty.description}</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-primary">
                      <Star className="w-3 h-3" />
                      <span className="text-xs font-medium">+{difficulty.xp} XP</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview */}
          <Card className="bg-primary/5">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Preview da Recompensa</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{formData.title || "Sua tarefa"}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedType?.label} • {selectedDifficulty?.label}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium">
                  <Star className="w-4 h-4" />
                  +{selectedDifficulty?.xp} XP
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : `Criar ${formData.type === "habit" ? "Hábito" : "Afazer"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
