"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X, SlidersHorizontal } from "lucide-react"

interface HabitFiltersProps {
  onFilterChange: (filters: FilterState) => void
  availableTags: string[]
}

export interface FilterState {
  search: string
  selectedTags: string[]
  difficulties: string[]
  types: string[]
  completionStatus: "all" | "completed" | "pending"
}

const difficultyOptions = [
  { value: "easy", label: "Fácil", color: "bg-green-500" },
  { value: "medium", label: "Médio", color: "bg-yellow-500" },
  { value: "hard", label: "Difícil", color: "bg-red-500" },
]

const typeOptions = [
  { value: "habit", label: "Hábitos" },
  { value: "daily", label: "Diárias" },
  { value: "todo", label: "Afazeres" },
]

export function HabitFilters({ onFilterChange, availableTags }: HabitFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    selectedTags: [],
    difficulties: [],
    types: [],
    completionStatus: "all",
  })

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      selectedTags: [],
      difficulties: [],
      types: [],
      completionStatus: "all",
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.search ||
    filters.selectedTags.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.types.length > 0 ||
    filters.completionStatus !== "all"

  const toggleArrayFilter = (array: string[], value: string, key: keyof FilterState) => {
    const newArray = array.includes(value) ? array.filter((item) => item !== value) : [...array, value]
    updateFilters({ [key]: newArray })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar hábitos..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10 glass bg-transparent"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Advanced Filters Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="glass bg-transparent">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros Avançados
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 glass-strong" align="start">
            <div className="space-y-4">
              {/* Completion Status */}
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "Todos" },
                    { value: "completed", label: "Completos" },
                    { value: "pending", label: "Pendentes" },
                  ].map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={status.value}
                        checked={filters.completionStatus === status.value}
                        onCheckedChange={() => updateFilters({ completionStatus: status.value as any })}
                      />
                      <label htmlFor={status.value} className="text-sm">
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Types */}
              <div>
                <h4 className="font-medium mb-2">Tipos</h4>
                <div className="space-y-2">
                  {typeOptions.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={filters.types.includes(type.value)}
                        onCheckedChange={() => toggleArrayFilter(filters.types, type.value, "types")}
                      />
                      <label htmlFor={type.value} className="text-sm">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulties */}
              <div>
                <h4 className="font-medium mb-2">Dificuldade</h4>
                <div className="space-y-2">
                  {difficultyOptions.map((difficulty) => (
                    <div key={difficulty.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={difficulty.value}
                        checked={filters.difficulties.includes(difficulty.value)}
                        onCheckedChange={() =>
                          toggleArrayFilter(filters.difficulties, difficulty.value, "difficulties")
                        }
                      />
                      <div className={`w-3 h-3 rounded-full ${difficulty.color}`} />
                      <label htmlFor={difficulty.value} className="text-sm">
                        {difficulty.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={filters.selectedTags.includes(tag)}
                          onCheckedChange={() => toggleArrayFilter(filters.selectedTags, tag, "selectedTags")}
                        />
                        <label htmlFor={tag} className="text-sm">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}

        {/* Active Filter Tags */}
        {filters.selectedTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="glass">
            {tag}
            <button
              onClick={() => toggleArrayFilter(filters.selectedTags, tag, "selectedTags")}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
