import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/user/login',
    name: 'UserLogin',
    component: () => import('@/views/UserLoginView.vue'),
    meta: { title: 'Login - Kho DongYang' }
  },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: () => import('@/views/UserDashboardView.vue'),
    meta: { title: 'Dashboard - Kho DongYang', requiresAuth: true }
  },
  {
    path: '/user/products',
    name: 'UserProducts',
    component: () => import('@/views/UserProductsView.vue'),
    meta: { title: 'Products - Kho DongYang', requiresAuth: true }
  },
  {
    path: '/user/cart',
    name: 'UserCart',
    component: () => import('@/views/UserCartView.vue'),
    meta: { title: 'Shopping Cart - Kho DongYang', requiresAuth: true }
  },
  {
    path: '/user/orders',
    name: 'UserOrders',
    component: () => import('@/views/UserOrdersView.vue'),
    meta: { title: 'My Orders - Kho DongYang', requiresAuth: true }
  },
  {
    path: '/user/orders/:id',
    name: 'UserOrderDetail',
    component: () => import('@/views/UserOrderDetailView.vue'),
    meta: { title: 'Order Detail - Kho DongYang', requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/user/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'Kho DongYang'
  
  // Simple auth check
  const isAuthenticated = localStorage.getItem('user-token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/user/login')
  } else {
    next()
  }
})

export default router
