import api from './api'
import type { FactoryPart } from '@/types/organization.types'

export const factoryPartAPI = {
  // GET /api/FactoryPart
  getAll: async (): Promise<FactoryPart[]> => {
    try {
      return await api.get<FactoryPart[]>(`/api/FactoryPart`)
    } catch (error: unknown) {
      console.error('Error fetching factory parts:', error)
      throw error
    }
  },

  // GET /api/FactoryPart/{id}
  getById: async (id: number): Promise<FactoryPart> => {
    try {
      return await api.get<FactoryPart>(`/api/FactoryPart/${id}`)
    } catch (error: unknown) {
      console.error(`Error fetching factory part ${id}:`, error)
      throw error
    }
  },
}
