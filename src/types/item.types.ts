// Item Types
export interface EngItem {
  partname: string
  location: string
  description: string
  vender: string
}

export interface ComItem {
  name: string
  location: string
  specifications: string
  manufacturer: string
}

export interface PriceHistory {
  batchId: number
  price: number
  previousPrice: number | null
  changeAmount: number | null
  changePercent: number | null
  quantity: number
  remainingQty: number
  createdAt: string
  isInitialStock: boolean
}

/**
 * Khớp 1-1 với ReadItemDto trong swagger.json.
 * departmentId là nguồn sự thật để xác định vật tư thuộc bộ phận nào;
 * departmentName chỉ để hiển thị.
 */
export interface Item {
  id: number
  type: string
  departmentId: number | null
  departmentName: string | null
  itemIndentifyId: string | null
  saveQuantity: number
  price: string | null
  currentEffectivePrice: string | null
  stockPrice: string | null
  unit: string | null
  stockQty: number | null
  picture: string[] | null
  eng?: EngItem | null
  com?: ComItem | null
  priceHistory?: PriceHistory[] | null
}

export interface CreateItemRequest {
  type: string
  departmentId: number
  saveQuantity: number
  price: string
  unit: string
  stockQty: number
  picture: string[]
  eng?: EngItem
  com?: ComItem
}

export interface UpdateItemRequest {
  type?: string
  departmentId?: number
  saveQuantity?: number
  price?: string
  unit?: string
  stockQty?: number
  picture?: string[]
  eng?: EngItem
  com?: ComItem
}

export interface ItemUsageStat {
  itemId: number
  itemName: string | null
  totalOrdered: number
  totalStockIn: number
  openingStock: number | null
  closingStock: number | null
  item: Item
}

// Enum for item category
export enum ItemCategory {
  ENGINEER = 'ENGINEER',
  CONSUMER = 'CONSUMER'
}

/** Kết quả phân trang chuẩn hoá từ các API filter (vd GET /api/Item/filter). */
export interface PagedResult<T> {
  items: T[]
  totalCount: number
  totalPages: number
  pageNumber: number
  pageSize: number
  /** false nếu backend trả mảng thuần (chưa phân trang) → FE phải tự cắt trang. */
  serverPaged: boolean
}
