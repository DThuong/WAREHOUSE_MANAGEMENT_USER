import type { Item } from "./item.types"
import type { User } from "./user.types"
import type { machine } from "./line_machine.types"

// Order Detail
export interface OrderDetail {
  id: number
  orderId: number
  itemId: number
  orderQty: number
  item: Item
  note: string
  timeUsed: string
  machineId: number | null
  machine: machine
}

// Order
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

export interface OrderPendingRealtime {
  accountId: number
  orderDate: string
  status: OrderStatus
  nameWorker: string
  image: string[]
}

export interface CreateOrderRequest {
  nameWorker: string
  itemIds: {
    itemId: number
    orderQty: number
    note: string
    timeUsed: string
    machineId: number | null
  }[]
}

export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}
