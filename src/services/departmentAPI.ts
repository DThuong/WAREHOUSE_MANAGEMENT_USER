import api from './api'
import type { Department } from '@/types/organization.types'

export const departmentAPI = {
  // GET /api/Department
  getAll: async (): Promise<Department[]> => {
    try {
      return await api.get<Department[]>(`/api/Department`)
    } catch (error: unknown) {
      console.error('Error fetching departments:', error)
      throw error
    }
  },

  // GET /api/Department/{id}
  getById: async (id: number): Promise<Department> => {
    try {
      return await api.get<Department>(`/api/Department/${id}`)
    } catch (error: unknown) {
      console.error(`Error fetching department ${id}:`, error)
      throw error
    }
  },
}
