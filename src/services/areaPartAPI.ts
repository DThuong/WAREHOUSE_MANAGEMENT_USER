import api from './api'
import type { AreaPart } from '@/types/organization.types'

export const areaPartAPI = {
  // GET /api/AreaPart
  getAll: async (): Promise<AreaPart[]> => {
    try {
      return await api.get<AreaPart[]>(`/api/AreaPart`)
    } catch (error: unknown) {
      console.error('Error fetching area parts:', error)
      throw error
    }
  },

  // GET /api/AreaPart/{id}
  getById: async (id: number): Promise<AreaPart> => {
    try {
      return await api.get<AreaPart>(`/api/AreaPart/${id}`)
    } catch (error: unknown) {
      console.error(`Error fetching area part ${id}:`, error)
      throw error
    }
  },
}
