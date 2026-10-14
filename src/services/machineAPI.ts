import api from './api'
import type { Machine, CreateMachineRequest } from '@/types/organization.types'

export const machineAPI = {
  // GET /api/Machine?isActive=true — bỏ trống isActive để lấy tất cả
  getAll: async (params?: { isActive?: boolean }): Promise<Machine[]> => {
    try {
      const query = params?.isActive !== undefined ? { isActive: params.isActive } : undefined
      return await api.get<Machine[]>(`/api/Machine`, { params: query })
    } catch (error: unknown) {
      console.error('Error fetching machines:', error)
      throw error
    }
  },

  // POST /api/Machine — body { machineName, areaPartId }
  create: async (data: CreateMachineRequest): Promise<Machine> => {
    try {
      return await api.post<Machine>(`/api/Machine`, data)
    } catch (error: unknown) {
      console.error('Error creating machine:', error)
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
