import type { Item } from "./item.types"

// Order Detail
/** AreaPart rút gọn BE trả kèm trong orderDetail.areaPartsInfo */
export interface OrderAreaPartInfo {
  id: number
  areaPartName?: string | null
  departmentId?: number | null
  departmentName?: string | null
  factoryPartId?: number | null
  factoryPartName?: string | null
}

/** Machine rút gọn BE trả kèm trong orderDetail.machinesInfo */
export interface OrderMachineInfo {
  id: number
  machineName?: string | null
  areaPartId?: number | null
  areaPartName?: string | null
  departmentId?: number | null
  departmentName?: string | null
}

export interface OrderDetail {
  id: number
  orderId: number
  itemId: number
  orderQty: number
  item: Item
  note: string | null
  timeUsed: string | null
  /** Khớp OrderItemDto.areaPartId (mảng) khi tạo đơn */
  areaPartIds: number[]
  /** Khớp OrderItemDto.machineId (mảng) khi tạo đơn */
  machineIds: number[]
  /** BE có trả nhưng FE chưa dùng — để unknown[] cho tới khi cần định nghĩa kiểu cụ thể */
  orderDetailBatches?: unknown[]
  machinesInfo?: OrderMachineInfo[] | null
  areaPartsInfo?: OrderAreaPartInfo[] | null
}

/** Thông tin tài khoản nhúng trong Order (subset của User do BE trả về). */
export interface OrderAccountInfo {
  id?: number
  username?: string | null
  fullName?: string | null
  phoneNumber?: string | null
  role?: string | null
  departmentId?: number | null
  departmentName?: string | null
  factoryPartId?: number | null
  factoryPartName?: string | null
  plantId?: number | null
  plantName?: string | null
  positionId?: number | null
  positionName?: string | null
}

// Order
export interface Order {
  id: number
  accountId: number
  totalPrice: string
  orderDate: string
  status: OrderStatus
  nameWorker: string
  image: string[]
  note: string
  orderDetails: OrderDetail[]
  accountInfo?: OrderAccountInfo | null
}

export interface OrderPendingRealtime {
  accountId: number
  orderDate: string
  status: OrderStatus
  nameWorker: string
  image: string[]
}

/** Khớp OrderItemDto trong swagger.json (tên field số ít, giá trị là MẢNG). */
export interface CreateOrderItemRequest {
  itemId: number
  orderQty: number
  note: string
  timeUsed: string
  areaPartId: number[]
  machineId: number[]
}

/** Khớp CreateOrderDto trong swagger.json. */
export interface CreateOrderRequest {
  nameWorker: string
  itemIds: CreateOrderItemRequest[]
}

export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}
