import { apiClient } from './api-client'

export interface Tag {
  id: string
  user_id: string
  name: string
  color?: string
}

export interface CreateTagRequest {
  name: string
  color?: string
}

export interface UpdateTagRequest {
  name?: string
  color?: string
}

export const tagService = {
  // Listar todas as tags do usuário
  async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>('/tags/')
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch tags')
    }

    return response.data
  },

  // Criar nova tag
  async createTag(data: CreateTagRequest): Promise<Tag> {
    const response = await apiClient.post<Tag>('/tags/', data)

    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create tag')
    }

    return response.data
  },

  // Atualizar tag
  async updateTag(tagId: string, data: UpdateTagRequest): Promise<Tag> {
    const response = await apiClient.put<Tag>(`/tags/${tagId}`, data)

    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update tag')
    }

    return response.data
  },

  // Deletar tag
  async deleteTag(tagId: string): Promise<void> {
    const response = await apiClient.delete<void>(`/tags/${tagId}`)

    if (response.error) {
      throw new Error(response.error || 'Failed to delete tag')
    }
  },
}
