"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Tag as TagIcon, X } from "lucide-react"
import type { Tag } from "@/lib/api-types-complete"

interface TagManagerModalProps {
  open: boolean
  onClose: () => void
  tags: Tag[]
  onCreateTag: (name: string, color?: string) => Promise<void>
  onUpdateTag: (tagId: string, name: string, color?: string) => Promise<void>
  onDeleteTag: (tagId: string) => Promise<void>
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
]

export function TagManagerModal({
  open,
  onClose,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: TagManagerModalProps) {
  const [newTagName, setNewTagName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    if (!newTagName.trim()) return

    setIsLoading(true)
    try {
      await onCreateTag(newTagName.trim(), selectedColor)
      setNewTagName("")
      setSelectedColor(PRESET_COLORS[0])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingTag || !newTagName.trim()) return

    setIsLoading(true)
    try {
      await onUpdateTag(editingTag.id, newTagName.trim(), selectedColor)
      setEditingTag(null)
      setNewTagName("")
      setSelectedColor(PRESET_COLORS[0])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm("Tem certeza que deseja remover esta tag? Ela será removida de todas as tarefas.")) {
      return
    }

    setIsLoading(true)
    try {
      await onDeleteTag(tagId)
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setSelectedColor(tag.color || PRESET_COLORS[0])
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setNewTagName("")
    setSelectedColor(PRESET_COLORS[0])
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-primary" />
            Gerenciar Tags
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Criar/Editar Tag */}
          <div className="glass rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm">
              {editingTag ? "Editar Tag" : "Nova Tag"}
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="tag-name">Nome da Tag *</Label>
                <Input
                  id="tag-name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ex: saúde, trabalho, estudo..."
                  className="glass"
                  maxLength={30}
                />
              </div>

              <div>
                <Label>Cor da Tag</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                        selectedColor === color
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {editingTag ? (
                  <>
                    <Button
                      onClick={handleUpdate}
                      disabled={!newTagName.trim() || isLoading}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Atualizar Tag
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant="outline"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleCreate}
                    disabled={!newTagName.trim() || isLoading}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Tag
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Tags */}
          <div>
            <h3 className="font-medium text-sm mb-3">Suas Tags ({tags.length})</h3>
            
            {tags.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma tag criada ainda</p>
                <p className="text-xs">Crie tags para organizar suas tarefas</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="glass rounded-lg p-3 flex items-center justify-between hover:bg-card/90 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color || "#6366f1" }}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(tag)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tag.id)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
