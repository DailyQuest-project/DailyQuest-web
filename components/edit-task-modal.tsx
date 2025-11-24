"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Task } from "@/lib/api-types-complete"
import { Star, Repeat, CheckSquare } from "lucide-react"

interface EditTaskModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, data: any, taskType: 'habit' | 'todo') => Promise<void>
}

const difficultyOptions = [
  { value: "EASY", label: "Fácil", xp: 10, color: "bg-green-600", description: "Tarefas simples e rápidas" },
  { value: "MEDIUM", label: "Médio", xp: 20, color: "bg-yellow-600", description: "Requer esforço moderado" },
  { value: "HARD", label: "Difícil", xp: 30, color: "bg-red-600", description: "Desafios significativos" },
]

const frequencyOptions = [
  { value: "DAILY", label: "Diariamente", description: "Todos os dias da semana" },
  { value: "WEEKLY_TIMES", label: "X vezes por semana", description: "Defina quantas vezes" },
  { value: "SPECIFIC_DAYS", label: "Dias específicos", description: "Escolha os dias" },
]

export function EditTaskModal({ task, open, onClose, onUpdate }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "MEDIUM",
    frequency: "DAILY",
    frequency_target_times: 3,
    frequency_days: [] as number[],
    deadline: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Preencher formulário quando a tarefa mudar
  useEffect(() => {
    if (task) {
      const habitTask = task as any
      setFormData({
        title: task.title || "",
        description: task.description || "",
        difficulty: task.difficulty || "MEDIUM",
        frequency: habitTask.frequency_type || "DAILY",
        frequency_target_times: habitTask.frequency_target_times || 3,
        frequency_days: habitTask.frequency_days || [],
        deadline: (task as any).deadline 
          ? new Date((task as any).deadline).toISOString().split('T')[0] 
          : "",
      })
    }
  }, [task])

  const selectedDifficulty = difficultyOptions.find((d) => d.value === formData.difficulty)
  const selectedFrequency = frequencyOptions.find((f) => f.value === formData.frequency)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    if (task.task_type === 'habit' && formData.frequency === "WEEKLY_TIMES" && (!formData.frequency_target_times || formData.frequency_target_times < 1 || formData.frequency_target_times > 7)) {
      alert("Por favor, selecione quantas vezes por semana (1-7).")
      return
    }

    if (task.task_type === 'habit' && formData.frequency === "SPECIFIC_DAYS" && formData.frequency_days.length === 0) {
      alert("Por favor, selecione pelo menos um dia da semana.")
      return
    }

    setIsLoading(true)
    try {
      const updateData = {
        title: formData.title,
        description: formData.description || undefined,
        difficulty: formData.difficulty,
        ...(task.task_type === 'habit' && {
          frequency_type: formData.frequency,
          ...(formData.frequency === "WEEKLY_TIMES" && {
            frequency_target_times: formData.frequency_target_times
          }),
          ...(formData.frequency === "SPECIFIC_DAYS" && {
            frequency_days: formData.frequency_days
          })
        }),
        ...(task.task_type === 'todo' && formData.deadline && {
          deadline: new Date(formData.deadline).toISOString()
        })
      }

      await onUpdate(task.id, updateData, task.task_type as 'habit' | 'todo')
      onClose()
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) return null

  const today = new Date().toISOString().split("T")[0]
  const isHabit = task.task_type === 'habit'
  const Icon = isHabit ? Repeat : CheckSquare

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Editar {isHabit ? 'Hábito' : 'Afazer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Meditar 10 minutos"
                required
                className="glass bg-transparent"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva sua tarefa..."
                rows={3}
                className="glass bg-transparent resize-none"
              />
            </div>
          </div>

          {/* Frequência (apenas para hábitos) */}
          {isHabit && (
            <>
              <div>
                <Label>Frequência Desejada</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {frequencyOptions.map((frequency) => (
                    <Card
                      key={frequency.value}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        formData.frequency === frequency.value
                          ? "ring-2 ring-primary bg-primary/10"
                          : "glass hover:bg-card/90"
                      }`}
                      onClick={() => setFormData({ ...formData, frequency: frequency.value })}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="font-medium text-sm">{frequency.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{frequency.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {formData.frequency === "WEEKLY_TIMES" && (
                <div>
                  <Label htmlFor="frequency_target_times">Quantas vezes por semana? *</Label>
                  <Input
                    id="frequency_target_times"
                    type="number"
                    min={1}
                    max={7}
                    value={formData.frequency_target_times}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      frequency_target_times: parseInt(e.target.value) || 1 
                    })}
                    className="glass"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    De 1 a 7 vezes na semana
                  </p>
                </div>
              )}

              {formData.frequency === "SPECIFIC_DAYS" && (
                <div>
                  <Label>Dias da semana *</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {[
                      { day: 0, label: "S" },
                      { day: 1, label: "T" },
                      { day: 2, label: "Q" },
                      { day: 3, label: "Q" },
                      { day: 4, label: "S" },
                      { day: 5, label: "S" },
                      { day: 6, label: "D" }
                    ].map(({ day, label }) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            frequency_days: formData.frequency_days.includes(day)
                              ? formData.frequency_days.filter((d) => d !== day)
                              : [...formData.frequency_days, day].sort()
                          });
                        }}
                        className={`h-10 rounded-lg font-medium text-sm transition-all ${
                          formData.frequency_days.includes(day)
                            ? "bg-primary text-primary-foreground"
                            : "glass hover:bg-card/90"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione os dias que deseja realizar o hábito
                  </p>
                </div>
              )}
            </>
          )}

          {/* Deadline (apenas para TODOs) */}
          {!isHabit && (
            <div>
              <Label htmlFor="deadline">Prazo (opcional)</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                min={today}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="glass bg-transparent"
              />
            </div>
          )}

          {/* Difficulty Selection */}
          <div>
            <Label>Dificuldade</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {difficultyOptions.map((difficulty) => (
                <Card
                  key={difficulty.value}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    formData.difficulty === difficulty.value
                      ? "ring-2 ring-primary bg-primary/10"
                      : "glass hover:bg-card/90"
                  }`}
                  onClick={() => setFormData({ ...formData, difficulty: difficulty.value })}
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
          <Card className="glass bg-primary/5">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Preview das Alterações</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{formData.title || "Título da tarefa"}</div>
                    <div className="text-sm text-muted-foreground">
                      {isHabit ? 'Hábito' : 'Afazer'} • {selectedDifficulty?.label}
                      {isHabit && selectedFrequency && ` • ${selectedFrequency.label}`}
                      {!isHabit &&
                        formData.deadline &&
                        ` • ${new Date(formData.deadline).toLocaleDateString("pt-BR")}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium">
                  <Star className="w-4 h-4" />+{selectedDifficulty?.xp} XP
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 glass bg-transparent"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
