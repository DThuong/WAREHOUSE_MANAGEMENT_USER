/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tài khoản theo cấu trúc tổ chức MỚI (Plant > FactoryPart > Department > AreaPart).
 *
 * Bỏ hai field cũ `areaPart: string` và `department: string`: chúng chỉ chứa
 * chuỗi "SMD" / "MAINLINE" và không nối được với AreaPart/Department thật.
 * Nguồn sự thật để lọc dữ liệu theo bộ phận là `departmentId`.
 */
export interface User {
  id: number
  username: string
  fullName?: string | null
  phoneNumber: string
  role: string

  // Vị trí trong cây tổ chức
  departmentId?: number | null
  departmentName?: string | null
  factoryPartId?: number | null
  factoryPartName?: string | null
  plantId?: number | null
  plantName?: string | null

  // Chức vụ
  positionId?: number | null
  positionName?: string | null

  isActive: boolean
  createdAt: string
  lastLoginAt?: string | null

  // Chỉ có trong response đăng nhập
  token: string
  expiresAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
  deviceInfo: string
}

export interface ChangePasswordByAdminData {
  accountId: number
  newPassword: string
}

export interface ApiError {
  message: string
  status: number | undefined
  data: any
}

export interface ChangePasswordByUserData {
  currentPassword: string
  newPassword: string
}
