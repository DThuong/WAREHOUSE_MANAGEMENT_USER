<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <UserLayout>
    <div class="user-dashboard animate-fade-in mt-6">
      <!-- Welcome Banner -->
      <Card class="welcome-banner overflow-hidden border-none shadow-lg">
        <div class="banner-overlay" />
        <CardContent class="banner-content relative z-10 p-4">
          <div>
            <h1 class="welcome-title">Xin Chào, {{ userStore.currentUser?.username }}!</h1>
            <p class="welcome-subtitle">Chào mừng đến với kho Dong Yang !!!</p>
          </div>
          <Button 
            class="cursor-pointer transition-all hover:scale-105 border-none shadow-lg font-semibold text-white"
            style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);"
            size="lg"
            @click="router.push('/user/products')"
          >
            <ShoppingBag class="mr-2 h-5 w-5" />
            Xem danh sách vật tư
          </Button>
        </CardContent>
      </Card>

      <!-- Stats Grid -->
      <div class="stats-grid mt-6">
        <Card 
          v-for="stat in stats" 
          :key="stat.label"
          class="stat-card cursor-pointer transition-all hover:scale-[1.02] hover:-translate-y-1 border-none shadow-md"
        >
          <CardContent class="flex items-center gap-5 p-4">
            <div class="stat-icon" :style="{ background: stat.color }">
              <component :is="stat.icon" class="h-7 w-7" />
            </div>
            <div class="stat-content flex-1">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Orders -->
      <Card class="orders-card border-none shadow-lg mt-6 mb-6">
        <CardHeader style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%); border-bottom: 2px solid #BDE8F5;">
          <div class="flex justify-between items-center p-4">
            <CardTitle class="section-title">Recent Orders</CardTitle>
            <Button 
              variant="ghost"
              class="hover:bg-blue-50 border-none bg-blue-100 shadow-2xl cursor-pointer "
              style="color: #1C4D8D; font-weight: 600;"
              @click="router.push('/user/orders')"
            >
              Xem Tất Cả
            </Button>
          </div>
        </CardHeader>
        <CardContent class="pt-4">
          <!-- Loading State -->
          <div v-if="orderStore.loading" class="flex justify-center items-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-slate-600">Đang tải đơn hàng...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="orderStore.error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p class="text-red-600 font-medium">{{ orderStore.error }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="recentOrders.length === 0" class="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
            <Package class="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p class="text-slate-600 font-medium text-lg">Chưa có đơn hàng nào</p>
            <Button 
              @click="router.push('/user/products')"
              class="mt-4"
              style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%); color: #fff"
            >
              Đặt hàng ngay
            </Button>
          </div>

          <template v-else>
            <!-- Desktop: Table (hidden on mobile) -->
            <Table class="border-none hidden md:table">
              <TableHeader>
                <TableRow class="border-none border-b border-blue-100">
                  <TableHead class="font-semibold border-none" style="color: #1C4D8D;">ID Đặt Hàng</TableHead>
                  <TableHead class="font-semibold border-none" style="color: #1C4D8D;">Ngày Đặt</TableHead>
                  <TableHead class="font-semibold border-none" style="color: #1C4D8D;">Trạng Thái</TableHead>
                  <TableHead class="text-right font-semibold border-none" style="color: #1C4D8D;">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow 
                  v-for="order in recentOrders" 
                  :key="order.id" 
                  class="hover:bg-blue-50/50 transition-colors border-b border-blue-100 last:border-none"
                >
                  <TableCell class="font-medium border-none" style="color: #374151;">#{{ order.id }}</TableCell>
                  <TableCell class="border-none" style="color: #6b7280;">{{ formatDate(order.orderDate) }}</TableCell>
                  <TableCell class="border-none">
                    <Badge :variant="getStatusVariant(order.status)" :class="getStatusClass(order.status)">
                      {{ getStatusLabel(order.status) }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right border-none">
                    <Button 
                      variant="secondary"
                      size="sm"
                      class="hover:opacity-70 bg-blue-950 font-medium cursor-pointer text-white!"
                      @click="viewOrder(order.id)"
                    >
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Mobile: Card list (hidden on desktop) -->
            <div class="md:hidden flex flex-col gap-3.5">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="order-card-mobile"
              >
                <div class="order-card-mobile__header">
                  <span class="order-card-mobile__id">#{{ order.id }}</span>
                  <Badge :variant="getStatusVariant(order.status)" :class="getStatusClass(order.status)">
                    {{ getStatusLabel(order.status) }}
                  </Badge>
                </div>
                <div class="order-card-mobile__date">
                  <Clock class="h-3.5 w-3.5 mr-1 inline-block" style="color: #9ca3af;" />
                  {{ formatDate(order.orderDate) }}
                </div>
                <div class="order-card-mobile__footer">
                  <Button 
                    size="sm"
                    class="w-full hover:opacity-80 cursor-pointer font-semibold text-white"
                    style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);"
                    @click="viewOrder(order.id)"
                  >
                    Xem Chi Tiết
                  </Button>
                </div>
              </div>
            </div>
          </template>
        </CardContent>
      </Card>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useOrderStore } from '@/stores/orderStore'
import { orderAPI } from '@/services/orderAPI'
import UserLayout from '@/components/UserLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Package, 
  List 
} from 'lucide-vue-next'
import { signalRService } from '@/services/orderNotiService'
import type { updateStatusRealtime } from '@/types/notification.types'
import { OrderStatus } from '@/types/order.types'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

// Computed stats from orderStore
const stats = computed(() => [
  { 
    icon: Clock, 
    label: 'Đang chờ', 
    value: orderStore.pendingOrders.length.toString(), 
    color: 'linear-gradient(135deg, #BDE8F5 0%, #A5D8F0 100%)' 
  },
  { 
    icon: CheckCircle2, 
    label: 'Xác Nhận', 
    value: orderStore.approvedOrders.length.toString(), 
    color: 'linear-gradient(135deg, #4988C4 0%, #5FA0D9 100%)' 
  },
  { 
    icon: Package, 
    label: 'Hoàn Thành', 
    value: orderStore.completedOrders.length.toString(), 
    color: 'linear-gradient(135deg, #1C4D8D 0%, #3A6BAF 100%)' 
  },
  { 
    icon: List, 
    label: 'Tổng Order', 
    value: orderStore.totalOrders.toString(), 
    color: 'linear-gradient(135deg, #0F2854 0%, #1C4D8D 100%)' 
  }
])

// Get recent orders (top 5)
const recentOrders = computed(() => {
  return orderStore.orders
    .slice()
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5)
})

// Fetch orders from API
const fetchOrders = async () => {
  orderStore.setLoading(true)
  orderStore.setError(null)
  
  try {
    const orders = await orderAPI.getMyOrder()
    orderStore.setOrders(orders)
  } finally {
    orderStore.setLoading(false)
  }
}

// Helper functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    Pending: 'Đang chờ',
    Approved: 'Đã duyệt',
    Processing: 'Đang xử lý',
    Completed: 'Hoàn thành',
    Rejected: 'Từ chối'
  }
  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    Pending: 'outline',
    Approved: 'default',
    Processing: 'secondary',
    Completed: 'default',
    Rejected: 'destructive'
  }
  return variants[status] || 'default'
}

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    Pending:    'bg-amber-100 text-amber-600 border-amber-300 font-semibold',
    Approved:   'bg-blue-100 text-blue-600 border-blue-300 font-semibold',
    Completed:  'bg-emerald-100 text-emerald-600 border-emerald-300 font-semibold',
    Rejected:   'bg-red-50 text-red-500 border-red-300 font-semibold'
  }
  return classes[status] || ''
}

const viewOrder = (id: number) => {
  router.push(`/user/orders/${id}`)
}

// Handler cập nhật realtime - giống OrdersView
const handleOrderStatusUpdated = (response: updateStatusRealtime) => {
  orderStore.updateOrderStatus(response.orderId, response.newStatus as OrderStatus, response.note)
}

onMounted(async () => {
  // Kết nối SignalR nếu chưa kết nối
  if (!signalRService.isConnected()) {
    await signalRService.start()
  }
  // Đăng ký listener realtime
  signalRService.on('OrderStatusUpdated', handleOrderStatusUpdated)
  
  // Fetch orders như cũ
  fetchOrders()
})

onUnmounted(() => {
  signalRService.off('OrderStatusUpdated')
})
</script>

<style scoped>
.user-dashboard {
  max-width: 100%;
}

.welcome-banner {
  position: relative;
  background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(28, 77, 141, 0.05) 0%, rgba(73, 136, 196, 0.05) 100%);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title {
  font-family: 'Rubik', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
}

.welcome-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: white;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 10px 25px rgba(28, 77, 141, 0.2);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9375rem;
  color: #6b7280;
  font-weight: 600;
}

.section-title {
  font-family: 'Rubik', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Mobile card styles */
.order-card-mobile {
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  border: 1px solid #BDE8F5;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  box-shadow: 0 2px 8px rgba(28, 77, 141, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.order-card-mobile:active {
  transform: scale(0.99);
}

.order-card-mobile__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-card-mobile__id {
  font-size: 1rem;
  font-weight: 700;
  color: #1C4D8D;
}

.order-card-mobile__date {
  font-size: 0.8125rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.order-card-mobile__footer {
  margin-top: 0.25rem;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-title {
    font-size: 1.5rem;
  }
}
</style>