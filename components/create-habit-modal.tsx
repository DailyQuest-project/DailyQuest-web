"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TagSelector } from "@/components/tag-selector"
import { Plus, X, Star, Repeat, CheckSquare } from "lucide-react"
import type { Tag } from "@/lib/api-types-complete"

interface CreateHabitModalProps {
  onCreateHabit: (habit: any) => void
  children: React.ReactNode
  availableTags?: Tag[]
  onManageTags?: () => void
}

const difficultyOptions = [
  { value: "easy", label: "Fácil", xp: 15, color: "bg-green-600", description: "Tarefas simples e rápidas" },
  { value: "medium", label: "Médio", xp: 25, color: "bg-yellow-600", description: "Requer esforço moderado" },
  { value: "hard", label: "Difícil", xp: 40, color: "bg-red-600", description: "Desafios significativos" },
]

const habitTypes = [
  { value: "habit", label: "Hábito", icon: Repeat, description: "Ações recorrentes sem prazo fixo" },
  { value: "todo", label: "Afazer", icon: CheckSquare, description: "Tarefas únicas com deadline" },
]

const frequencyOptions = [
  { value: "DAILY", label: "Diariamente", description: "Todos os dias da semana" },
  { value: "WEEKLY_TIMES", label: "X vezes por semana", description: "Defina quantas vezes" },
  { value: "SPECIFIC_DAYS", label: "Dias específicos", description: "Escolha os dias" },
]

const predefinedTags = ["saúde", "educação", "trabalho", "fitness", "mental", "social", "criatividade", "finanças"]

export function CreateHabitModal({ onCreateHabit, children, availableTags = [], onManageTags }: CreateHabitModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "medium",
    type: "habit",
    frequency: "DAILY",
    frequency_target_times: 3,
    frequency_days: [] as number[],
    deadline: "",
    tags: [] as string[], // IDs das tags selecionadas
    newTag: "",
  })

  const selectedDifficulty = difficultyOptions.find((d) => d.value === formData.difficulty)
  const selectedType = habitTypes.find((t) => t.value === formData.type)
  const selectedFrequency = frequencyOptions.find((f) => f.value === formData.frequency)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    if (formData.type === "todo" && !formData.deadline) {
      alert("Por favor, selecione um deadline para o afazer.")
      return
    }

    if (formData.type === "habit" && formData.frequency === "WEEKLY_TIMES" && (!formData.frequency_target_times || formData.frequency_target_times < 1 || formData.frequency_target_times > 7)) {
      alert("Por favor, selecione quantas vezes por semana (1-7).")
      return
    }

    if (formData.type === "habit" && formData.frequency === "SPECIFIC_DAYS" && formData.frequency_days.length === 0) {
      alert("Por favor, selecione pelo menos um dia da semana.")
      return
    }

    const newHabit = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      type: formData.type,
      xp: selectedDifficulty?.xp || 25,
      completed: false,
      streak: 0,
      tag_ids: formData.tags, // IDs das tags selecionadas
      frequency: formData.type === "habit" ? formData.frequency : undefined,
      frequency_target_times: formData.type === "habit" && formData.frequency === "WEEKLY_TIMES" ? formData.frequency_target_times : undefined,
      frequency_days: formData.type === "habit" && formData.frequency === "SPECIFIC_DAYS" ? formData.frequency_days : undefined,
      deadline: formData.type === "todo" ? formData.deadline : undefined,
      weeklyProgress: formData.type === "habit" ? 0 : undefined,
      weeklyTarget: formData.type === "habit" ? getWeeklyTarget(formData.frequency) : undefined,
    }

    onCreateHabit(newHabit)
    setFormData({
      title: "",
      description: "",
      difficulty: "medium",
      type: "habit",
      frequency: "DAILY",
      frequency_target_times: 3,
      frequency_days: [],
      deadline: "",
      tags: [],
      newTag: "",
    })
    setOpen(false)
  }

  const getWeeklyTarget = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return 7
      case "weekly":
        return 1
      case "3x-week":
        return 3
      case "flexible":
        return 0
      default:
        return 0
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag], newTag: "" }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="glass-strong max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Criar Novo Hábito</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Meditar 10 minutos"
                className="glass bg-transparent"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva seu hábito..."
                className="glass bg-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <Label>Tipo de Atividade</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {habitTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      formData.type === type.value ? "ring-2 ring-primary bg-primary/10" : "glass hover:bg-card/90"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
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

          {formData.type === "habit" && (
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
                      onClick={() => setFormData((prev) => ({ ...prev, frequency: frequency.value }))}
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
                    onChange={(e) => setFormData((prev) => ({ 
                      ...prev, 
                      frequency_target_times: parseInt(e.target.value) || 1 
                    }))}
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
                          setFormData((prev) => ({
                            ...prev,
                            frequency_days: prev.frequency_days.includes(day)
                              ? prev.frequency_days.filter((d) => d !== day)
                              : [...prev.frequency_days, day].sort()
                          }));
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

          {formData.type === "todo" && (
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                min={today}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                className="glass bg-transparent"
                required
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

          {/* Tags */}
          <TagSelector
            availableTags={availableTags}
            selectedTagIds={formData.tags}
            onTagSelect={(tagId) => setFormData(prev => ({ ...prev, tags: [...prev.tags, tagId] }))}
            onTagRemove={(tagId) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(id => id !== tagId) }))}
            onManageTags={onManageTags}
          />

          {/* Preview */}
          <Card className="glass bg-primary/5">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Preview da Recompensa</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{formData.title || "Seu hábito"}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedType?.label} • {selectedDifficulty?.label}
                    {formData.type === "habit" && selectedFrequency && ` • ${selectedFrequency.label}`}
                    {formData.type === "todo" &&
                      formData.deadline &&
                      ` • ${new Date(formData.deadline).toLocaleDateString("pt-BR")}`}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium">
                  <Star className="w-4 h-4" />+{selectedDifficulty?.xp} XP
                  {formData.type === "habit" && formData.frequency !== "flexible" && (
                    <span className="text-xs text-green-500 ml-2">+5 XP bônus</span>
                  )}
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
              className="flex-1 glass bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-accent">
              Criar {formData.type === "habit" ? "Hábito" : "Afazer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
