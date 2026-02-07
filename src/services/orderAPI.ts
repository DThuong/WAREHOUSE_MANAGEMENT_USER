import api from './api'
import type { 
  Order,
  CreateOrderRequest, 
} from '@/types/order.types'

interface FilterOrderParams {
  id?: number
  fromDate?: string
  toDate?: string
  status?: string
  department?: string
}

export const orderAPI = {
  // Get all orders - GET /api/Order
  getAll: async (): Promise<Order[]> => {
    try {
      return await api.get<Order[]>(`/api/Order`)
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  getMyOrder: async (): Promise<Order[]> => {
    try {
      return await api.get<Order[]>(`/api/Order/my-orders`)
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  // Filter orders - GET /api/Order/filter
  filterOrders: async (params: FilterOrderParams): Promise<Order[]> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.id) queryParams.append('Id', params.id.toString())
      if (params.fromDate) queryParams.append('FromDate', params.fromDate)
      if (params.toDate) queryParams.append('ToDate', params.toDate)
      if (params.status) queryParams.append('Status', params.status)
      if (params.department) queryParams.append('Department', params.department)
      
      const queryString = queryParams.toString()
      const url = `/api/Order/filter${queryString ? `?${queryString}` : ''}`
      
      return await api.get<Order[]>(url)
    } catch (error) {
      console.error('Error filtering orders:', error)
      return []
    }
  },

  // Get order by ID - GET /api/Order/{id}
  getById: async (id: number): Promise<Order> => {
    try {
      return await api.get<Order>(`/api/Order/${id}`)
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  },

  // Create new order - POST /api/Order
  create: async (data: CreateOrderRequest): Promise<Order> => {
    try {
      return await api.post<Order>(`/api/Order`, data)
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  // Delete order - DELETE /api/Order/{id}
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/api/Order/${id}`)
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  },

  // ===================== IMAGE APIs =====================
  // Get image by filename - GET /api/Order/image/{fileName}
  getImage: async (fileName: string): Promise<Blob> => {
    try {
      return await api.get<Blob>(`/api/Order/image/${fileName}`)
    } catch (error) {
      console.error('Error getting image:', error)
      throw error
    }
  },

  // Delete image - DELETE /api/Order/image/{id}/{imageName}
  deleteImage: async (orderId: number, imageName: string): Promise<void> => {
    try {
      await api.delete<void>(`/api/Order/image/${orderId}/${imageName}`)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }
}