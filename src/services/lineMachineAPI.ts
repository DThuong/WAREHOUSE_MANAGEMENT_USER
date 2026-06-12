/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'
import type {
  Line,
  CreateLineRequest,
  UpdateLineRequest,
} from '@/types/line_machine.types'
import type {
  Machine,
  CreateAndUpdateMachineRequest,
} from '@/types/line_machine.types'


export const lineMachineAPI = {
  // GET /api/Lines
  getAllLines: async (): Promise<Line[]> => {
    try {
      return await api.get<Line[]>(`/api/Lines`)
    } catch (error: any) {
      console.error('Error fetching lines:', error)
      throw error
    }
  },

  // GET /api/Lines/{id}
  getLineById: async (id: number): Promise<Line> => {
    try {
      return await api.get<Line>(`/api/Lines/${id}`)
    } catch (error: any) {
      console.error('Error fetching line:', error)
      throw error
    }
  },

  // POST /api/Lines
  createLine: async (data: CreateLineRequest): Promise<Line> => {
    try {
      return await api.post<Line>(`/api/Lines`, data)
    } catch (error: any) {
      console.error('Error creating line:', error)
      throw error
    }
  },

  // PUT /api/Lines/{id}
  updateLine: async (
    id: number,
    data: UpdateLineRequest,
  ): Promise<Line> => {
    try {
      return await api.put<Line>(`/api/Lines/${id}`, data)
    } catch (error: any) {
      console.error('Error updating line:', error)
      throw error
    }
  },

  // DELETE /api/Lines/{id}
  deleteLine: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/api/Lines/${id}`)
    } catch (error: any) {
      console.error('Error deleting line:', error)
      throw error
    }
  },

   // GET /api/Machines
  getAllMachines: async (): Promise<Machine[]> => {
    try {
      return await api.get<Machine[]>(`/api/Machines`)
    } catch (error: any) {
      console.error('Error fetching machines:', error)
      throw error
    }
  },

  // GET /api/Machines/{id}
  getMachineById: async (id: number): Promise<Machine> => {
    try {
      return await api.get<Machine>(`/api/Machines/${id}`)
    } catch (error: any) {
      console.error('Error fetching machine:', error)
      throw error
    }
  },

  // POST /api/Machines
  createMachine: async (
    data: CreateAndUpdateMachineRequest,
  ): Promise<Machine> => {
    try {
      return await api.post<Machine>(`/api/Machines`, data)
    } catch (error: any) {
      console.error('Error creating machine:', error)
      throw error
    }
  },

  // PUT /api/Machines/{id}
  updateMachine: async (
    id: number,
    data: CreateAndUpdateMachineRequest,
  ): Promise<Machine> => {
    try {
      return await api.put<Machine>(`/api/Machines/${id}`, data)
    } catch (error: any) {
      console.error('Error updating machine:', error)
      throw error
    }
  },

  // DELETE /api/Machines/{id}
  deleteMachine: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/api/Machines/${id}`)
    } catch (error: any) {
      console.error('Error deleting machine:', error)
      throw error
    }
  },
}
