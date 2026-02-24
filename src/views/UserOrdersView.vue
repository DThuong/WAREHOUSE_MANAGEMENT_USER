<template>
  <UserLayout>
    <div class="orders-page space-y-6 animate-fade-in">
      <!-- Page Header -->
      <Card class="border-none shadow-lg" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);">
        <CardHeader class="space-y-4">
          <div>
            <CardTitle class="text-4xl font-bold font-rubik" style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              Đơn Hàng Của Tôi
            </CardTitle>
            <CardDescription class="text-lg mt-2" style="color: #6b7280;">
              Quản lý tất cả các đơn đặt hàng của bạn ở đây !!!
            </CardDescription>
          </div>

          <!-- Filter Tabs -->
          <div class="flex gap-2 flex-wrap">
            <Button
              v-for="filter in statusFilters"
              :key="filter.value"
              :variant="selectedStatus === filter.value ? 'default' : 'outline'"
              :class="[
                selectedStatus === filter.value 
                  ? 'border-none shadow-md font-semibold text-white' 
                  : 'hover:bg-blue-50 border-2'
              ]"
              :style="selectedStatus === filter.value ? 'background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);' : 'border-color: #4988C4; color: #1C4D8D; cursor: pointer;'"
              @click="selectedStatus = filter.value"
            >
              {{ filter.label }}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <!-- Empty State -->
      <Card v-if="filteredOrders.length === 0" class="border-none shadow-lg">
        <CardContent class="flex flex-col items-center justify-center py-16 space-y-4">
          <div class="rounded-full p-6" style="background: linear-gradient(135deg, #E8F4FA 0%, #BDE8F5 100%);">
            <Inbox class="h-16 w-16" style="color: #4988C4;" />
          </div>
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-semibold font-rubik" style="color: #1f2937;">Không Tìm Thấy Đơn Hàng Nào!</h2>
            <p class="text-lg" style="color: #6b7280;">Bạn chưa đặt đơn hàng nào</p>
          </div>
          <Button 
            size="lg"
            class="mt-4 border-none shadow-lg font-semibold text-white cursor-pointer"
            style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);"
            @click="router.push('/user/products')"
          >
            <ShoppingBag class="mr-2 h-5 w-5" />
            Bắt Đầu Đặt Hàng
          </Button>
        </CardContent>
      </Card>

      <!-- Orders Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card
          v-for="order in filteredOrders"
          :key="order.id"
          class="group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-none shadow-md overflow-hidden"
          style="border: 2px solid #BDE8F5;"
          @click="viewOrderDetail(order.id)"
        >
          <!-- Order Header -->
          <CardHeader class="space-y-3" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);">
            <div class="flex justify-between items-start p-3">
              <div class="space-y-2">
                <CardTitle class="text-xl font-rubik" style="color: #1f2937;">
                  Đơn hàng #{{ order.id }}
                </CardTitle>
                <CardDescription class="flex items-center gap-1.5">
                  <Calendar class="h-3.5 w-3.5" />
                  {{ formatDate(order.orderDate) }}
                </CardDescription>
              </div>
              <Badge :class="getStatusClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </Badge>
            </div>
          </CardHeader>

          <!-- Order Body -->
          <CardContent class="space-y-4">
            <!-- Order Info -->
            <div class="flex items-center gap-6 text-sm">
              <div class="flex items-center gap-2" style="color: #6b7280;">
                <Package class="h-4 w-4" style="color: #4988C4;" />
                <span class="font-medium">{{ order.orderDetails?.length || 0 }} vật tư</span>
              </div>
            </div>

            <!-- Show worker name if available -->
            <div v-if="order.nameWorker" class="text-sm" style="color: #6b7280;">
              <span class="font-medium">Người đặt:</span> {{ order.nameWorker }}
            </div>
          </CardContent>

          <!-- Order Footer -->
          <CardFooter class="flex justify-between items-center p-3 border-t pt-3!" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%); border-color: #BDE8F5;">
            <Button 
              variant="ghost" 
              size="sm"
              class="hover:bg-blue-200 font-medium cursor-pointer bg-blue-400/20"
              style="color: #1C4D8D;"
            >
              Xem Chi Tiết
              <ArrowRight class="h-4 w-4 ml-1" />
            </Button>
            <!-- Nút đặt lại -->
            <Button
              variant="ghost"
              size="sm"
              class="hover:bg-green-100 font-medium cursor-pointer bg-green-50"
              style="color: #065F46;"
              :disabled="reorderLoading === order.id"
              @click.stop="openReorder(order)"
            >
              <!-- Hiển thị spinner khi đang fetch -->
              <Loader2 v-if="reorderLoading === order.id" class="h-4 w-4 mr-1 animate-spin" />
              <RotateCcw v-else class="h-4 w-4 mr-1" />
              {{ reorderLoading === order.id ? 'Đang tải...' : 'Đặt Lại' }}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    <ReorderDialog
      v-model:open="reorderDialogOpen"
      :order="selectedOrderForReorder"
      @confirmed="handleReorderConfirmed"
    />
  </UserLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'
import UserLayout from '@/components/UserLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Inbox, 
  ShoppingBag, 
  Calendar, 
  Package, 
  ArrowRight, 
  RotateCcw,
  Loader2
} from 'lucide-vue-next'
import ReorderDialog from '@/views/ReorderDialog.vue'
import type { Order } from '@/types/order.types'
import { signalRService } from '@/services/orderNotiService'
import type { updateStatusRealtime } from '@/types/notification.types'
import { OrderStatus } from '@/types/order.types'
import { toast } from 'sonner'
import { orderAPI } from '@/services/orderAPI'

// Define types
type StatusFilterValue = 'all' | 'pending' | 'approved' | 'completed' | 'rejected'

interface StatusFilter {
  label: string
  value: StatusFilterValue
}

const router = useRouter()
const ordersStore = useOrderStore()

const selectedStatus = ref<StatusFilterValue>('all')
const reorderDialogOpen = ref(false)
const selectedOrderForReorder = ref<Order | null>(null)
const reorderLoading = ref<number | null>(null)

const statusFilters: StatusFilter[] = [
  { label: 'Tất Cả', value: 'all' },
  { label: 'Chờ Duyệt', value: 'pending' },
  { label: 'Đã Duyệt', value: 'approved' },
  { label: 'Hoàn Thành', value: 'completed' },
  { label: 'Đã Hủy', value: 'rejected' }
]

const filteredOrders = computed(() => {
  let list = ordersStore.orders
  if (selectedStatus.value !== 'all') {
    list = list.filter(order =>
      order.status.toLowerCase() === selectedStatus.value
    )
  }
  return [...list].sort((a, b) => {
    return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  })
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusLabel = (status: string): string => {
  const normalizedStatus = status.toLowerCase()
  const labels: Record<string, string> = {
    pending: 'Chờ Duyệt',
    approved: 'Đã Duyệt',
    processing: 'Đang Xử Lý',
    completed: 'Hoàn Thành',
    rejected: 'Đã Hủy'
  }
  return labels[normalizedStatus] || status
}

const getStatusClass = (status: string): string => {
  const normalizedStatus = status.toLowerCase()
  const classes: Record<string, string> = {
    pending: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B] font-medium',
    approved: 'bg-[#DBEAFE] text-[#1E40AF] border-[#3B82F6] font-medium',
    processing: 'bg-[#E0E7FF] text-[#3730A3] border-[#6366F1] font-medium',
    completed: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981] font-medium',
    rejected: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444] font-medium'
  }
  return classes[normalizedStatus] || 'bg-slate-100 text-slate-800'
}

const viewOrderDetail = (orderId: number): void => {
  router.push(`/user/orders/${orderId}`)
}

// hàm openReorder
const openReorder = async (order: Order) => {
  reorderLoading.value = order.id
  try {
    // Gọi API lấy full order detail (có đủ item data)
    const fullOrder = await orderAPI.getById(order.id)
    selectedOrderForReorder.value = fullOrder
    reorderDialogOpen.value = true
  } catch (error) {
    console.log('Không thể tải thông tin đơn hàng', error);
  } finally {
    reorderLoading.value = null
  }
}

const handleReorderConfirmed = () => {
  toast.success('Đã thêm vào giỏ hàng!', {
    description: 'Kiểm tra giỏ hàng để tiếp tục đặt hàng',
    action: {
      label: 'Xem giỏ hàng',
      onClick: () => router.push('/user/cart')
    }
  })
}

const handleOrderStatusUpdated = (response: updateStatusRealtime) => {
  // Update status trong store
  ordersStore.updateOrderStatus(response.orderId, response.newStatus as OrderStatus)
}

onMounted(async () => {
  // 1. Kết nối SignalR
  if (!signalRService.isConnected()) {
    await signalRService.start()
  }
  // 2. Đăng ký listener
  signalRService.on('OrderStatusUpdated', handleOrderStatusUpdated)
  // 3. Load orders
  ordersStore.fetchMyOrders()
})

onUnmounted(() => {
  signalRService.off('OrderStatusUpdated')
})
</script>

<style scoped>
.orders-page {
  max-width: 100%;
}

.font-rubik {
  font-family: 'Rubik', sans-serif;
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
</style>