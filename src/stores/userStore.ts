/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { userAPI } from '@/services/userAPI'
import type { 
  User, 
  LoginCredentials, 
} from '@/types/user.types'

export const useUserStore = defineStore('user', {
  state: () => {
    const token = localStorage.getItem('auth_token')
    const userInfoStr = localStorage.getItem('user_info')
    let currentUser: User | null = null
    
    if (userInfoStr) {
      try {
        currentUser = JSON.parse(userInfoStr)
      } catch (error) {
        console.error('Failed to parse user_info', error)
      }
    }

    return {
      // Auth state
      currentUser,
      authToken: token,
      
      // Users list
      users: [] as User[],
      
      // Loading states
      loading: false,
      authLoading: false,
      
      // Error messages (không dùng toast trong store)
      error: null as string | null,
      authError: null as string | null,
      justLogin: false,
    }
  },

  getters: {
    isAuthenticated: (state) => !!(state.authToken && state.currentUser),
    activeUsers: (state) => state.users.filter(u => u.isActive),
    inactiveUsers: (state) => state.users.filter(u => !u.isActive),
    totalUsers: (state) => state.users.length,
    
    getUserById: (state) => {
      return (id: number) => state.users.find(u => u.id === id)
    },
    
    getUsersByRole: (state) => {
      return (role: string) => state.users.filter(u => u.role === role)
    },
    
    getUsersByDepartment: (state) => {
      return (department: string) => state.users.filter(u => u.department === department)
    },
  },

  actions: {
    // ==================== AUTH ACTIONS ====================
    
    async login(credentials: LoginCredentials) {
      this.authLoading = true
      this.authError = null
      
      try {
        const user = await userAPI.login(credentials)
        this.currentUser = user
        this.authToken = user.token
        localStorage.setItem('auth_token', user.token)
        localStorage.setItem('user_info', JSON.stringify(user))
        this.justLogin = true
        return { success: true, data: user }
      } catch (error: any) {
        this.authError = error.message || 'Đăng nhập thất bại'
        return { success: false, error: this.authError }
      } finally {
        this.authLoading = false
      }
    },

    clearLoginFlag() {
      this.justLogin = false
    },

    async logout() {
      this.authLoading = true
      this.authError = null
      
      try {
        await userAPI.logout()
        
        this.currentUser = null
        this.authToken = null
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        
        return { success: true }
      } catch (error: any) {
        this.authError = error.message || 'Đăng xuất thất bại'
        return { success: false, error: this.authError }
      } finally {
        this.authLoading = false
      }
    },

    // ==================== USER MANAGEMENT ACTIONS ====================
    
    async fetchUsers() {
      this.loading = true
      this.error = null
      
      try {
        const users = await userAPI.getAllAccounts()
        this.users = users
        return { success: true, data: users }
      } catch (error: any) {
        this.error = error.message || 'Không thể tải danh sách'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async changePassword(userId: number, newPassword: string) {
      this.loading = true
      this.error = null
      
      try {
        await userAPI.changePasswordByAdmin({
          accountId: userId,
          newPassword
        })
        return { success: true }
      } catch (error: any) {
        console.error('❌ API Error:', error)
        this.error = error.message || 'Không thể đổi mật khẩu'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // ==================== UTILITY ACTIONS ====================
    
    clearError() {
      this.error = null
      this.authError = null
    },
    
    resetStore() {
      this.currentUser = null
      this.authToken = null
      this.users = []
      this.loading = false
      this.authLoading = false
      this.error = null
      this.authError = null
    }
  }
})