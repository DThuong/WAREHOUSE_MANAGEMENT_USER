import api from './api'
import type { Plant } from '@/types/organization.types'

export const plantAPI = {
  // GET /api/Plant
  getAll: async (): Promise<Plant[]> => {
    try {
      return await api.get<Plant[]>(`/api/Plant`)
    } catch (error: unknown) {
      console.error('Error fetching plants:', error)
      throw error
    }
  },

  // GET /api/Plant/{id}
  getById: async (id: number): Promise<Plant> => {
    try {
      return await api.get<Plant>(`/api/Plant/${id}`)
    } catch (error: unknown) {
      console.error(`Error fetching plant ${id}:`, error)
      throw error
    }
  },
}
