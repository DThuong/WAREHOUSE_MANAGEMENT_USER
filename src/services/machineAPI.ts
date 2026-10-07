import api from './api'
import type { Machine } from '@/types/organization.types'

export const machineAPI = {
  // GET /api/Machine
  getAll: async (): Promise<Machine[]> => {
    try {
      return await api.get<Machine[]>(`/api/Machine`)
    } catch (error: unknown) {
      console.error('Error fetching machines:', error)
      throw error
    }
  },

  // GET /api/Machine/{id}
  getById: async (id: number): Promise<Machine> => {
    try {
      return await api.get<Machine>(`/api/Machine/${id}`)
    } catch (error: unknown) {
      console.error(`Error fetching machine ${id}:`, error)
      throw error
    }
  },
}
