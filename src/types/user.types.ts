/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: number
  username: string
  role: string
  token: string
  department: string
  phoneNumber: string
  expiresAt?: string
  createdAt: string
  isActive: boolean
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