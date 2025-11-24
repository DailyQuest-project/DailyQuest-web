"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import type { Tag } from "@/lib/api-types-complete"

interface TagSelectorProps {
  availableTags: Tag[]
  selectedTagIds: string[]
  onTagSelect: (tagId: string) => void
  onTagRemove: (tagId: string) => void
  onManageTags?: () => void
}

export function TagSelector({
  availableTags,
  selectedTagIds,
  onTagSelect,
  onTagRemove,
  onManageTags,
}: TagSelectorProps) {
  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id))
  const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Tags</Label>
        {onManageTags && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onManageTags}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Gerenciar Tags
          </Button>
        )}
      </div>

      {/* Tags Selecionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                borderColor: tag.color || undefined,
                color: tag.color || undefined,
              }}
            >
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => onTagRemove(tag.id)}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tags Disponíveis */}
      {unselectedTags.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Clique para adicionar:
          </p>
          <div className="flex flex-wrap gap-2">
            {unselectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors"
                style={{
                  borderColor: tag.color || undefined,
                  color: tag.color || undefined,
                }}
                onClick={() => onTagSelect(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {availableTags.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma tag disponível. {onManageTags && "Clique em 'Gerenciar Tags' para criar."}
        </p>
      )}
    </div>
  )
}
