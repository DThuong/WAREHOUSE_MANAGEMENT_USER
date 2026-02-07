import type { Item } from "./item.types"
import type { User } from "./user.types"

// Order Detail - chi tiết từng sản phẩm trong đơn hàng
export interface OrderDetail {
  id: number
  orderId: number
  itemId: number
  orderQty: number
  item: Item
}

// Order - đơn hàng chính
export interface Order {
  id: number
  accountId: number
  orderDate: string
  status: OrderStatus
  nameWorker: string
  image: string[]
  account: User
  orderDetails: OrderDetail[]
}

export interface CreateOrderRequest {
  nameWorker: string
  itemIds: {
    itemId: number
    orderQty: number
  }[]
}

export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}