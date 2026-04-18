import type { Item } from "./item.types"
import type { User } from "./user.types"
import type { machine } from "./line_machine.types"

// Order Detail - chi tiết từng sản phẩm trong đơn hàng
export interface OrderDetail {
  id: number
  orderId: number
  itemId: number
  orderQty: number
  item: Item
  note: string
  timeUsed: string
  machine: machine
  machineId: number
}

// Order - đơn hàng chính
export interface Order {
  id: number
  accountId: number
  orderDate: string
  status: OrderStatus
  nameWorker: string
  image: string[]
  note: string
  account: User
  orderDetails: OrderDetail[]
}

export interface CreateOrderRequest {
  nameWorker: string
  itemIds: {
    itemId: number
    orderQty: number
    note: string
    timeUsed: string
    machineId?: number
  }[]
}

export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}
