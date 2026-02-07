import api from './api'
import type { 
  User, 
  LoginCredentials, 
  ChangePasswordByAdminData
} from '@/types/user.types'

export const userAPI = {
  // Auth
  login(credentials: LoginCredentials): Promise<User> {
    return api.post('/api/Account/login', credentials)
  },

  logout(): Promise<{ message: string }> {
    return api.post('/api/Account/logout')
  },

  // User Management
  getAllAccounts(): Promise<User[]> {
    return api.get('/api/Account')
  },

  getAccountById(accountId: number): Promise<User> {
    return api.get(`/api/Account/${accountId}`)
  },

  changePasswordByAdmin(data: ChangePasswordByAdminData): Promise<{ message: string }> {
    return api.put('/api/Account/change-password-by-admin', data)
  }
}