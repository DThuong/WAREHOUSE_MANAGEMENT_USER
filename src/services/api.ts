/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosInstance, AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/user.types'
import { useUserStore } from '@/stores/userStore'
import { isTokenExpired } from '@/utils/checkToken'
import router from '@/router'

// Custom API Instance Type - return data directly, not AxiosResponse
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
  get<T = any>(url: string, config?: any): Promise<T>
  post<T = any>(url: string, data?: any, config?: any): Promise<T>
  put<T = any>(url: string, data?: any, config?: any): Promise<T>
  delete<T = any>(url: string, config?: any): Promise<T>
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>
}

const axiosInstance = axios.create({
  baseURL: 'http://172.16.162.103:7001/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Biến flag để tránh loop redirect
let isRedirecting = false

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    const token = localStorage.getItem('auth_token')
    
    // Check token expiration TRƯỚC khi gửi request
    if (userStore.currentUser?.expiresAt) {
      if (isTokenExpired(userStore.currentUser.expiresAt)) {
        // Clear localStorage và store
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        userStore.resetStore()
        
        // Redirect to login
        router.push({ 
          path: '/login', 
          query: { reason: 'expired' } 
        })
        
        // Cancel request
        return Promise.reject(new Error('Token expired'))
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - return data directly
// Response interceptor - return data directly
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): any => {
    console.log('🔍 API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response.data
  },
  (error: AxiosError): Promise<ApiError> => {
    console.error('💥 API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    // Xử lý 401 - Token invalid/expired
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true
      
      console.warn('⚠️ 401 Unauthorized - Token expired or invalid')
      
      // Clear auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // Import dynamically để tránh circular dependency
      import('@/stores/userStore').then(({ useUserStore }) => {
        const userStore = useUserStore()
        userStore.resetStore()
      })
      
      // Redirect về signin với reason
      const currentPath = window.location.pathname
      if (currentPath !== '/user/login') {
        window.location.href = `/user/login?reason=unauthorized&redirect=${encodeURIComponent(currentPath)}`
      }
      
      // Reset flag sau 2s
      setTimeout(() => {
        isRedirecting = false
      }, 2000)
    }
    
    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'Đã có lỗi xảy ra',
      status: error.response?.status,
      data: error.response?.data
    }
    
    return Promise.reject(apiError)
  }
)

const api = axiosInstance as CustomAxiosInstance

export default api