/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'
import type { 
  Item,
  CreateItemRequest, 
  UpdateItemRequest,
  PagedResult,
} from '@/types/item.types'

/** Query params của GET /api/Item/filter. departmentId là nguồn lọc bộ phận. */
export interface FilterItemParams {
  type?: string;
  unit?: string;
  keyword?: string;
  factoryName?: string;
  departmentId?: number;
  /** Trang hiện tại, bắt đầu từ 1 */
  pageNumber?: number;
  /** Số bản ghi mỗi trang */
  pageSize?: number;
}

/** Bỏ các param rỗng để query string gọn & không làm backend lọc sai ("" / null). */
const cleanParams = <T extends object>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Partial<T>

/**
 * Chuẩn hoá response phân trang. Chấp nhận các dạng .NET hay gặp:
 *  - { items|data|records|results, totalCount|totalRecords|totalItems|total, totalPages, pageNumber, pageSize }
 *  - Bọc thêm 1 lớp { data: {...} }
 *  - Mảng thuần (backend chưa phân trang) → serverPaged = false
 */
const toPagedResult = <T>(res: any, pageNumber: number, pageSize: number): PagedResult<T> => {
  if (Array.isArray(res)) {
    return {
      items: res,
      totalCount: res.length,
      totalPages: Math.max(1, Math.ceil(res.length / pageSize)),
      pageNumber,
      pageSize,
      serverPaged: false,
    }
  }

  const body = res && !Array.isArray(res.data) && typeof res.data === 'object' && res.data !== null
    ? res.data
    : res
  const items: T[] =
    body?.items ?? body?.Items ?? body?.data ?? body?.records ?? body?.results ?? []
  const totalCount = Number(
    body?.totalCount ?? body?.TotalCount ?? body?.totalRecords ?? body?.totalItems ?? body?.total ?? items.length
  )
  const size = Number(body?.pageSize ?? body?.PageSize ?? pageSize) || pageSize

  return {
    items: Array.isArray(items) ? items : [],
    totalCount,
    totalPages: Number(body?.totalPages ?? body?.TotalPages) || Math.max(1, Math.ceil(totalCount / size)),
    pageNumber: Number(body?.pageNumber ?? body?.PageNumber ?? pageNumber) || pageNumber,
    pageSize: size,
    serverPaged: true,
  }
}

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

  // Filter items (server-side pagination) - GET /api/Item/filter
  // Ném lỗi ra ngoài để view hiển thị thông báo; hỗ trợ AbortSignal để huỷ request cũ.
  filter: async (
    params: FilterItemParams,
    options: { signal?: AbortSignal } = {}
  ): Promise<PagedResult<Item>> => {
    const pageNumber = params.pageNumber ?? 1
    const pageSize = params.pageSize ?? 9
    const res = await api.get(`/api/Item/filter`, {
      params: cleanParams({ ...params, pageNumber, pageSize }),
      signal: options.signal,
    })
    return toPagedResult<Item>(res, pageNumber, pageSize)
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
