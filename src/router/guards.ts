import { useUserStore } from "@/stores/userStore"
import { isTokenExpired } from "@/utils/checkToken"
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router"

export const authGuard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('auth_token')
  const userInfo = localStorage.getItem('user_info')

  // 1. Sync store từ localStorage
  if (token && userInfo && !userStore.isAuthenticated) {
    try {
      const user = JSON.parse(userInfo)

      // Block Admin role
      if (user.role === 'Admin') {
        localStorage.clear()
        next({ 
          path: '/signin', 
          query: { 
            reason: 'blocked_admin',
            message: 'Tài khoản Admin không được phép truy cập hệ thống này'
          } 
        })
        return
      }

      // Check token hết hạn
      if (isTokenExpired(user.expiresAt)) {
        localStorage.clear()
        next({ 
          path: '/signin', 
          query: { 
            redirect: to.fullPath, 
            reason: 'expired' 
          } 
        })
        return
      }

      // Sync vào store
      userStore.currentUser = user
      userStore.authToken = token
      
    } catch (error) {
      console.error('Lỗi parse user_info:', error)
      localStorage.clear()
      userStore.resetStore()
      next('/signin')
      return
    }
  }

  // 2. Đã login mà vào signin → redirect home
  if (userStore.isAuthenticated && to.path === '/signin') {
    next('/')
    return
  }

  // 3. Chưa login nhưng route cần auth
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ path: '/signin', query: { redirect: to.fullPath } })
    return
  }

  // 4. Check role-based access
  if (to.meta.roles && userStore.currentUser) {
    const allowedRoles = to.meta.roles as string[]
    
    // Block Admin từ mọi route có roles
    if (userStore.currentUser.role === 'Admin') {
      next('/')
      return
    }
    
    if (!allowedRoles.includes(userStore.currentUser.role)) {
      next('/')
      return
    }
  }

  next()
}