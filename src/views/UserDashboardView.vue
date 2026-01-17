<template>
  <UserLayout>
    <div class="user-dashboard animate-fade-in space-y-6">
      <!-- Welcome Banner -->
      <Card class="welcome-banner overflow-hidden border-none shadow-lg">
        <div class="banner-overlay" />
        <CardContent class="banner-content relative z-10 p-8">
          <div>
            <h1 class="welcome-title">Xin Chào, {{ authStore.user?.name }}!</h1>
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
      <div class="stats-grid">
        <Card 
          v-for="stat in stats" 
          :key="stat.label"
          class="stat-card cursor-pointer transition-all hover:scale-[1.02] hover:-translate-y-1 border-none shadow-md"
        >
          <CardContent class="flex items-center gap-5 p-6">
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
      <Card class="orders-card border-none shadow-lg">
        <CardHeader style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%); border-bottom: 2px solid #BDE8F5;">
          <div class="flex justify-between items-center p-4">
            <CardTitle class="section-title">Recent Orders</CardTitle>
            <Button 
              variant="ghost"
              class="hover:bg-blue-50 border bg-blue-100 shadow-2xl cursor-pointer "
              style="color: #1C4D8D; font-weight: 600;"
              @click="router.push('/user/orders')"
            >
              Xem Tất Cả
            </Button>
          </div>
        </CardHeader>
        <CardContent class="pt-6">
          <Table>
            <TableHeader>
              <TableRow class="border-b-2" style="border-color: #BDE8F5;">
                <TableHead class="font-semibold" style="color: #1C4D8D;">ID Đặt Hàng</TableHead>
                <TableHead class="font-semibold" style="color: #1C4D8D;">Ngày Đặt</TableHead>
                <TableHead class="font-semibold" style="color: #1C4D8D;">Tổng Tiền</TableHead>
                <TableHead class="font-semibold" style="color: #1C4D8D;">Trạng Thái</TableHead>
                <TableHead class="text-right font-semibold" style="color: #1C4D8D;">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="order in recentOrders" :key="order.id" class="hover:bg-blue-50/50 transition-colors">
                <TableCell class="font-medium" style="color: #374151;">{{ order.orderNumber }}</TableCell>
                <TableCell style="color: #6b7280;">{{ order.date }}</TableCell>
                <TableCell>
                  <span class="amount font-bold" style="color: #1C4D8D;">${{ order.totalAmount.toFixed(2) }}</span>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(order.status)" :class="getStatusClass(order.status)">
                    {{ getStatusLabel(order.status) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <Button 
                    variant="ghost"
                    size="sm"
                    class="hover:bg-blue-50 font-medium"
                    style="color: #1C4D8D;"
                    @click="viewOrder(order.id)"
                  >
                    Xem
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAuthStore } from '@/stores/userAuth'
import { useOrdersStore } from '@/stores/orders'
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

interface Order {
  id: number
  orderNumber: string
  date: string
  totalAmount: number
  status: string
}

const router = useRouter()
const authStore = useUserAuthStore()
const ordersStore = useOrdersStore()

const stats = ref([
  { 
    icon: Clock, 
    label: 'Đang chờ', 
    value: '3', 
    color: 'linear-gradient(135deg, #BDE8F5 0%, #A5D8F0 100%)' 
  },
  { 
    icon: CheckCircle2, 
    label: 'Xác Nhận', 
    value: '5', 
    color: 'linear-gradient(135deg, #4988C4 0%, #5FA0D9 100%)' 
  },
  { 
    icon: Package, 
    label: 'Hoàn Thành', 
    value: '12', 
    color: 'linear-gradient(135deg, #1C4D8D 0%, #3A6BAF 100%)' 
  },
  { 
    icon: List, 
    label: 'Tổng Order', 
    value: '20', 
    color: 'linear-gradient(135deg, #0F2854 0%, #1C4D8D 100%)' 
  }
])

const recentOrders = ref<Order[]>([])

onMounted(() => {
  ordersStore.loadOrders()
  recentOrders.value = ordersStore.orders.slice(0, 5)
})

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    processing: 'Processing',
    completed: 'Completed',
    rejected: 'Rejected'
  }
  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    approved: 'default',
    processing: 'secondary',
    completed: 'default',
    rejected: 'destructive'
  }
  return variants[status] || 'default'
}

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'bg-[#E8F4FA] text-[#4988C4] border-[#BDE8F5] font-medium',
    approved: 'bg-[#D4E8F5] text-[#1C4D8D] border-[#A5D8F0] font-medium',
    processing: 'bg-[#C3DCF2] text-[#0F2854] border-[#4988C4] font-medium',
    completed: 'bg-[#D4F4DD] text-[#2D8659] border-[#A8E6CF] font-medium',
    rejected: 'bg-[#FFE6E6] text-[#E05D5D] border-[#FFB3B3] font-medium'
  }
  return classes[status] || ''
}

const viewOrder = (id: number) => {
  router.push(`/user/orders/${id}`)
}
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