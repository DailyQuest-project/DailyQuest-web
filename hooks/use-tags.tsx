"use client"

import { useState, useCallback } from 'react'
import { tagService, Tag, CreateTagRequest, UpdateTagRequest } from '@/lib/api-service-tags'
import { useToast } from './use-toast'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('🏷️ [useTags] Fetching tags...')
      const data = await tagService.getTags()
      console.log('🏷️ [useTags] Tags fetched:', data)
      setTags(data)
    } catch (error) {
      console.error('Error fetching tags:', error)
      // Não mostrar toast de erro no carregamento inicial
      // toast({
      //   title: "Erro",
      //   description: "Não foi possível carregar as tags",
      //   variant: "destructive",
      // })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTag = useCallback(async (data: CreateTagRequest) => {
    try {
      const newTag = await tagService.createTag(data)
      setTags(prev => [...prev, newTag])
      toast({
        title: "✅ Tag criada",
        description: `Tag "${newTag.name}" criada com sucesso!`,
      })
      return newTag
    } catch (error) {
      console.error('Error creating tag:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a tag",
        variant: "destructive",
      })
      throw error
    }
  }, [toast])

  const updateTag = useCallback(async (tagId: string, data: UpdateTagRequest) => {
    try {
      const updatedTag = await tagService.updateTag(tagId, data)
      setTags(prev => prev.map(t => t.id === tagId ? updatedTag : t))
      toast({
        title: "✅ Tag atualizada",
        description: "Tag atualizada com sucesso!",
      })
      return updatedTag
    } catch (error) {
      console.error('Error updating tag:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tag",
        variant: "destructive",
      })
      throw error
    }
  }, [toast])

  const deleteTag = useCallback(async (tagId: string) => {
    try {
      await tagService.deleteTag(tagId)
      setTags(prev => prev.filter(t => t.id !== tagId))
      toast({
        title: "✅ Tag removida",
        description: "Tag removida com sucesso!",
      })
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover a tag",
        variant: "destructive",
      })
      throw error
    }
  }, [toast])

  return {
    tags,
    isLoading,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
  }
}
