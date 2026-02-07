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

export interface Item {
  id?: number
  type: string
  saveQuantity: number
  price: string
  unit: string
  stockQty: number
  picture: string[]
  eng?: EngItem
  com?: ComItem
}

export interface CreateItemRequest {
  type: string
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
  saveQuantity?: number
  price?: string
  unit?: string
  stockQty?: number
  picture?: string[]
  eng?: EngItem
  com?: ComItem
}

// Enum for item category
export enum ItemCategory {
  ENGINEER = 'ENGINEER',
  CONSUMER = 'CONSUMER'
}