/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'
import type { 
  Item,
  CreateItemRequest, 
  UpdateItemRequest,
} from '@/types/item.types'

export const itemAPI = {
  // Get all items
  getAll: async (): Promise<Item[]> => {
    try {
      return await api.get<Item[]>(`/api/Item`)
    } catch (error: any) {
      console.error('Error fetching items:', error)
      return []
    }
  },

  // Get item by ID
  getById: async (id: number): Promise<Item> => {
    try {
      return await api.get<Item>(`/api/Item/${id}`)
    } catch (error: any) {
      console.error('Error fetching item:', error)
      throw error
    }
  },

  // Create new item
  create: async (data: CreateItemRequest): Promise<Item> => {
    try {
      return await api.post<Item>(`/api/Item`, data)
    } catch (error: any) {
      console.error('Error creating item:', error)
      throw error
    }
  },

  // Update item
  update: async (id: number, data: UpdateItemRequest): Promise<Item> => {
    try {
      return await api.put<Item>(`/api/Item/${id}`, data)
    } catch (error: any) {
      console.error('Error updating item:', error)
      throw error
    }
  },

  // Delete item
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/api/Item/${id}`)
    } catch (error: any) {
      console.error('Error deleting item:', error)
      throw error
    }
  },

  // Upload SINGLE image - PUT /api/Item/image/{id}
  uploadImage: async (itemId: number, image: File): Promise<void> => {
    try {
      const formData = new FormData()
      formData.append('image', image)

      await api.put<void>(`/api/Item/image/${itemId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw error
    }
  },

  // Upload MULTIPLE images sequentially
  uploadImagesSequentially: async (itemId: number, images: File[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const image of images) {
      try {
        await itemAPI.uploadImage(itemId, image)
        success++
      } catch (error: any) {
        failed++
        errors.push(`${image.name}: ${error.message}`)
      }
    }

    return { success, failed, errors }
  },
  // Get image by filename - GET /api/Item/image/{fileName}
  getImage: async (fileName: string) => {
    try {
      const res = await api.get<Item>(`/api/Item/image/${fileName}`)
      return res
    } catch (error: any) {
      console.error('Error deleting image:', error)
      throw error
    }
  },

  // Delete image - DELETE /api/Item/image/{id}/{imageName}
  deleteImage: async (itemId: number, imageName: string): Promise<void> => {
    try {
      const res = await api.delete<void>(`/api/Item/image/${itemId}/${imageName}`)
      return res
    } catch (error: any) {
      console.error('Error deleting image:', error)
      throw error
    }
  }
}