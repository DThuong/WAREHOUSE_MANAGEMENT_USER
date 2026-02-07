import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/user/login',
      name: 'UserLogin',
      component: () => import('@/views/UserLoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/user/dashboard',
      name: 'UserDashboard',
      component: () => import('@/views/UserDashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/products',
      name: 'UserProducts',
      component: () => import('@/views/UserProductsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/orders',
      name: 'UserOrders',
      component: () => import('@/views/UserOrdersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/cart',
      name: 'UserCart',
      component: () => import('@/views/UserCartView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/orders/:id',
      name: 'UserOrderDetail',
      component: () => import('@/views/UserOrderDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/user/dashboard'
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/user/login'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = userStore.isAuthenticated

  console.log('🧭 Navigation:', {
    from: from.path,
    to: to.path,
    requiresAuth,
    isAuthenticated
  })

  // Route yêu cầu auth nhưng user chưa login
  if (requiresAuth && !isAuthenticated) {
    console.warn('⚠️ Access denied, redirecting to login')
    next({
      path: '/user/login',
      query: { redirect: to.fullPath } // Lưu redirect path
    })
    return
  }

  // User đã login nhưng đang cố truy cập login page
  if (to.path === '/user/login' && isAuthenticated) {
    next('/user/dashboard')
    return
  }

  // Allow navigation
  next()
})

// ✨ AFTER NAVIGATION - Log successful navigation
router.afterEach((to, from) => {
  console.log('✅ Navigation complete:', from.path, '→', to.path)
})

export default router