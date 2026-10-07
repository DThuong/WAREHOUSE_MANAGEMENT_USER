import { useUserStore } from "@/stores/userStore"
import { isTokenExpired } from "@/utils/checkToken"
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router"

const LOGIN_PATH = '/user/login'
const HOME_PATH = '/user/dashboard'

const redirectIfNeeded = (
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
  target: string | { path: string; query?: Record<string, string | undefined> }
) => {
  const targetPath = typeof target === 'string' ? target : target.path

  if (to.path === targetPath) {
    next()
    return
  }

  next(target)
}

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
        userStore.resetStore()
        redirectIfNeeded(to, next, {
          path: LOGIN_PATH,
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
        userStore.resetStore()
        redirectIfNeeded(to, next, {
          path: LOGIN_PATH,
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
      redirectIfNeeded(to, next, LOGIN_PATH)
      return
    }
  }

  // 2. Đã login mà vào login page -> redirect home
  if (userStore.isAuthenticated && to.path === LOGIN_PATH) {
    redirectIfNeeded(to, next, HOME_PATH)
    return
  }

  // 3. Chưa login nhưng route cần auth
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    redirectIfNeeded(to, next, {
      path: LOGIN_PATH,
      query: { redirect: to.fullPath }
    })
    return
  }

  // 4. Check role-based access
  if (to.meta.roles && userStore.currentUser) {
    const allowedRoles = to.meta.roles as string[]
    
    // Block Admin từ mọi route có roles
    if (userStore.currentUser.role === 'Admin') {
      userStore.resetStore()
      redirectIfNeeded(to, next, {
        path: LOGIN_PATH,
        query: {
          reason: 'blocked_admin',
          message: 'Tài khoản Admin không được phép truy cập hệ thống này'
        }
      })
      return
    }
    
    if (!allowedRoles.includes(userStore.currentUser.role)) {
      redirectIfNeeded(to, next, HOME_PATH)
      return
    }
  }

  next()
}
