import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  id: number
  username: string
  password: string
  name: string
  email: string
  department: string
  role: string
}

export const useUserAuthStore = defineStore('userAuth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = ref<boolean>(false)

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data
      user.value = {
        id: 1,
        username: username,
        password: password,
        name: 'Nguyễn Văn A',
        email: `${username}@company.com`,
        department: 'Production',
        role: 'User'
      }
      
      token.value = 'mock-token-' + Date.now()
      isAuthenticated.value = true
      
      // Save to localStorage
      localStorage.setItem('user-token', token.value)
      localStorage.setItem('user-data', JSON.stringify(user.value))
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user-token')
    localStorage.removeItem('user-data')
  }

  const checkAuth = () => {
    const savedToken = localStorage.getItem('user-token')
    const savedUser = localStorage.getItem('user-data')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
