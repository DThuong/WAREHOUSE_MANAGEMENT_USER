<template>
  <UserLayout>
    <div class="orders-page mt-6 animate-fade-in">
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

          <!-- Search and Filter Section -->
          <div class="space-y-4 mt-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="space-y-2">
                <Label for="orderId" class="text-sm font-medium" style="color: #1C4D8D;">Mã đơn hàng</Label>
                <div class="relative">
                  <Input
                    id="orderId"
                    v-model="searchId"
                    type="number"
                    min="1"
                    placeholder="Nhập mã đơn..."
                    class="border-2 focus:ring-blue-400 pl-9"
                    style="border-color: #BDE8F5;"
                  />
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div class="space-y-2">
                <Label for="fromDate" class="text-sm font-medium" style="color: #1C4D8D;">Từ ngày</Label>
                <Input
                  id="fromDate"
                  v-model="fromDate"
                  type="date"
                  class="border-2 focus:ring-blue-400"
                  style="border-color: #BDE8F5;"
                />
              </div>
              <div class="space-y-2">
                <Label for="toDate" class="text-sm font-medium" style="color: #1C4D8D;">Đến ngày</Label>
                <Input
                  id="toDate"
                  v-model="toDate"
                  type="date"
                  class="border-2 focus:ring-blue-400"
                  style="border-color: #BDE8F5;"
                />
              </div>
              <div class="flex items-end gap-2">
                <Button
                  variant="outline"
                  class="flex-1 border-2 hover:bg-blue-50 font-semibold cursor-pointer"
                  style="border-color: #4988C4; color: #1C4D8D;"
                  @click="resetFilters"
                >
                  <RotateCw class="h-4 w-4 mr-2" />
                  Đặt lại
                </Button>
              </div>
            </div>

            <!-- Filter Tabs -->
            <div class="flex gap-2 flex-wrap items-center pt-2">
              <span class="text-sm font-medium mr-2" style="color: #6b7280;">Trạng thái:</span>
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
          </div>
        </CardHeader>
      </Card>

      <!-- Empty State -->
      <Card v-if="paginatedOrders.length === 0" class="border-none shadow-lg mt-6">
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
      <div v-else class="space-y-6 mt-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card
            v-for="order in paginatedOrders"
            :key="order.id"
            :id="`order-${order.id}`"
            :class="[
              'group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-none shadow-md overflow-hidden flex flex-col',
              activeOrderId === order.id ? 'ring-2 ring-blue-500 shadow-2xl scale-[1.02]' : ''
            ]"
            :style="activeOrderId === order.id ? 'border: 2px solid #3B82F6;' : 'border: 2px solid #BDE8F5;'"
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
          <CardFooter
            class="flex flex-wrap w-full justify-between items-center p-3 border-t pt-3! gap-2"
            style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%); border-color: #BDE8F5;"
          >
            <Button
              variant="ghost"
              size="sm"
              class="hover:bg-blue-200 font-medium cursor-pointer bg-blue-400/20 flex-1 min-w-25"
              style="color: #1C4D8D;"
            >
              Xem Chi Tiết
            </Button>

            <Button
              v-if="order.status.toLowerCase() === 'rejected'"
              variant="ghost"
              size="sm"
              class="hover:bg-red-100 font-medium cursor-pointer bg-red-50 flex-1 min-w-25"
              style="color: #991B1B;"
              @click.stop="openRejectNote(order)"
            >
              <XCircle class="h-4 w-4 mr-1" />
              Lý Do Hủy
            </Button>

            <Button
              variant="ghost"
              size="sm"
              class="hover:bg-green-100 font-medium cursor-pointer bg-green-50 flex-1 min-w-25"
              style="color: #065F46;"
              :disabled="reorderLoading === order.id"
              @click.stop="openReorder(order)"
            >
              <Loader2 v-if="reorderLoading === order.id" class="h-4 w-4 mr-1 animate-spin" />
              <RotateCcw v-else class="h-4 w-4 mr-1" />
              {{ reorderLoading === order.id ? 'Đang tải...' : 'Đặt Lại' }}
            </Button>
            <Button
              v-if="order.status.toLowerCase() === 'pending'"
              variant="ghost"
              size="sm"
              class="hover:bg-red-100 font-medium cursor-pointer bg-red-50 flex-1 min-w-25"
              style="color: #991B1B;"
              @click.stop="openDeleteDialog(order)"
            >
              <Trash2 class="h-4 w-4 mr-1" />
              Xóa Đơn
            </Button>
          </CardFooter>
        </Card>
      </div>

      <!-- Pagination Section -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-8">
        <div class="text-sm font-medium" style="color: #6b7280;">
          Hiển thị <span class="font-bold text-blue-800">{{ startIndex + 1 }}-{{ Math.min(endIndex, filteredOrders.length) }}</span> trên tổng số <span class="font-bold text-blue-800">{{ filteredOrders.length }}</span> đơn hàng
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            <ChevronsLeft class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronLeft class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>

          <div class="flex items-center gap-1 mx-2">
            <template v-for="page in displayedPages" :key="page">
              <Button
                v-if="page !== -1"
                :variant="currentPage === page ? 'default' : 'outline'"
                class="h-9 w-9 p-0 font-bold transition-all duration-200"
                :class="[currentPage === page ? 'shadow-md border-none text-white' : 'border-2 hover:bg-blue-50']"
                :style="currentPage === page ? 'background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);' : 'border-color: #BDE8F5; color: #1C4D8D; cursor: pointer;'"
                @click="currentPage = page"
              >
                {{ page }}
              </Button>
              <span v-else class="px-1 text-slate-400">...</span>
            </template>
          </div>

          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <ChevronRight class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="h-9 w-9 border-2 cursor-pointer hover:bg-blue-50"
            style="border-color: #BDE8F5;"
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          >
            <ChevronsRight class="h-4 w-4" style="color: #1C4D8D;" />
          </Button>
        </div>
      </div>
    </div> <!-- Closes the div v-else (line 111) -->
  </div> <!-- Closes the div class="orders-page" (line 3) -->
    <ReorderDialog
      v-model:open="reorderDialogOpen"
      :order="selectedOrderForReorder"
      @confirmed="handleReorderConfirmed"
    />
    <!-- Reject Note Dialog -->
    <Dialog v-model:open="rejectNoteDialogOpen" class="">
      <DialogContent class="max-w-md border-none shadow-2xl bg-amber-100 w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-red-700">
            <XCircle class="h-5 w-5" />
            Lý Do Từ Chối
          </DialogTitle>
          <DialogDescription>
            Đơn hàng #{{ selectedRejectOrder?.id }}
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <p class="text-red-600 font-medium text-base leading-relaxed bg-red-50 border border-red-200 rounded-lg p-4">
            {{ selectedRejectOrder?.note || 'Không có lý do được cung cấp' }}
          </p>
        </div>
        <DialogFooter>
          <Button
            class="w-full border-none text-white cursor-pointer"
            style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);"
            @click="rejectNoteDialogOpen = false"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- Delete Confirm Dialog -->
<Dialog v-model:open="deleteDialogOpen">
  <DialogContent class="max-w-md border-none bg-amber-100 shadow-2xl w-[calc(100%-2rem)]">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2 text-red-700">
        <Trash2 class="h-5 w-5" />
        Xác Nhận Xóa Đơn Hàng
      </DialogTitle>
      <DialogDescription>
        Bạn có chắc muốn xóa đơn hàng <span class="font-semibold">#{{ selectedDeleteOrder?.id }}</span> không? Hành động này không thể hoàn tác.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter class="flex flex-col sm:flex-row gap-2 mt-2">
      <Button
        variant="outline"
        class="flex-1 cursor-pointer"
        :disabled="deleteLoading"
        @click="deleteDialogOpen = false"
      >
        Hủy Bỏ
      </Button>
      <Button
        class="flex-1 border-none text-white cursor-pointer bg-red-600 hover:bg-red-700"
        :disabled="deleteLoading"
        @click="handleDeleteOrder"
      >
        <Loader2 v-if="deleteLoading" class="h-4 w-4 mr-1 animate-spin" />
        <Trash2 v-else class="h-4 w-4 mr-1" />
        {{ deleteLoading ? 'Đang xóa...' : 'Xác Nhận Xóa' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  </UserLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
  RotateCcw,
  Loader2,
  XCircle,
  Trash2,
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-vue-next'
import ReorderDialog from '@/views/ReorderDialog.vue'
import type { Order } from '@/types/order.types'
import { signalRService } from '@/services/orderNotiService'
import type { updateStatusRealtime } from '@/types/notification.types'
import { OrderStatus } from '@/types/order.types'
import { toast } from 'vue-sonner'
import { orderAPI } from '@/services/orderAPI'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Define types
type StatusFilterValue = 'all' | 'pending' | 'approved' | 'completed' | 'rejected'

interface StatusFilter {
  label: string
  value: StatusFilterValue
}

const router = useRouter()
const ordersStore = useOrderStore()
const selectedStatus = ref<StatusFilterValue>('all')
const searchId = ref<string>('')
const fromDate = ref<string>('')
const toDate = ref<string>('')
const currentPage = ref(parseInt(sessionStorage.getItem('user_orders_page') || '1'))
const itemsPerPage = ref(6)

const activeOrderId = ref<number | null>(parseInt(sessionStorage.getItem('user_orders_active_id') || '0'))



watch(currentPage, (newVal) => {
  sessionStorage.setItem('user_orders_page', newVal.toString())
})

const reorderDialogOpen = ref(false)
const selectedOrderForReorder = ref<Order | null>(null)
const reorderLoading = ref<number | null>(null)
const rejectNoteDialogOpen = ref(false)
const selectedRejectOrder = ref<Order | null>(null)
const deleteDialogOpen = ref(false)
const selectedDeleteOrder = ref<Order | null>(null)
const deleteLoading = ref(false)

const statusFilters: StatusFilter[] = [
  { label: 'Tất Cả', value: 'all' },
  { label: 'Chờ Duyệt', value: 'pending' },
  { label: 'Đã Duyệt', value: 'approved' },
  { label: 'Hoàn Thành', value: 'completed' },
  { label: 'Đã Hủy', value: 'rejected' }
]

const openDeleteDialog = (order: Order) => {
  selectedDeleteOrder.value = order
  deleteDialogOpen.value = true
}

// Hàm xử lý xóa
const handleDeleteOrder = async () => {
  if (!selectedDeleteOrder.value) return
  deleteLoading.value = true
  try {
    await orderAPI.delete(selectedDeleteOrder.value.id)
    ordersStore.removeOrder(selectedDeleteOrder.value.id)
    deleteDialogOpen.value = false
    toast.success('Đã xóa đơn hàng thành công!')
  } catch (error) {
    console.log(error);
    toast.error('Không thể xóa đơn hàng. Vui lòng thử lại!')
  } finally {
    deleteLoading.value = false
  }
}

const openRejectNote = (order: Order) => {
  selectedRejectOrder.value = order
  rejectNoteDialogOpen.value = true
}

const resetFilters = () => {
  searchId.value = ''
  fromDate.value = ''
  toDate.value = ''
  selectedStatus.value = 'all'
  currentPage.value = 1
}

const filteredOrders = computed(() => {
  let list = ordersStore.orders
  
  // 1. Filter by Search ID
  if (searchId.value) {
    list = list.filter(order => order.id.toString().includes(searchId.value))
  }

  // 2. Filter by Date Range
  if (fromDate.value) {
    const start = new Date(fromDate.value)
    start.setHours(0, 0, 0, 0)
    list = list.filter(order => new Date(order.orderDate) >= start)
  }
  if (toDate.value) {
    const end = new Date(toDate.value)
    end.setHours(23, 59, 59, 999)
    list = list.filter(order => new Date(order.orderDate) <= end)
  }

  // 3. Filter by Status
  if (selectedStatus.value !== 'all') {
    list = list.filter(order =>
      order.status.toLowerCase() === selectedStatus.value
    )
  }

  // 4. Sort by Date Descending
  return [...list].sort((a, b) => {
    return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  })
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedOrders = computed(() => {
  return filteredOrders.value.slice(startIndex.value, endIndex.value)
})

const hasScrolled = ref(false)
watch(paginatedOrders, async (orders) => {
  if (!hasScrolled.value && activeOrderId.value && orders.some(o => o.id === activeOrderId.value)) {
    await nextTick()
    const el = document.getElementById(`order-${activeOrderId.value}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      hasScrolled.value = true
    }
  }
}, { immediate: true })

// Reset to page 1 whenever filters change
watch([selectedStatus, searchId, fromDate, toDate], ([, newId]) => {
  if (typeof newId === 'string' && parseInt(newId) < 1) {
    searchId.value = ''
  }
  currentPage.value = 1
})

const displayedPages = computed(() => {
  const pages: number[] = []
  const maxDisplayed = 5
  
  if (totalPages.value <= maxDisplayed) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    // Luôn có trang 1
    pages.push(1)
    
    if (currentPage.value > 3) pages.push(-1) // Ellipsis
    
    // Các trang xung quanh currentPage
    const start = Math.max(2, currentPage.value - 1)
    const end = Math.min(totalPages.value - 1, currentPage.value + 1)
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    
    if (currentPage.value < totalPages.value - 2) pages.push(-1) // Ellipsis
    
    // Luôn có trang cuối
    if (!pages.includes(totalPages.value)) pages.push(totalPages.value)
  }
  return pages
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
  sessionStorage.setItem('user_orders_active_id', orderId.toString())
  activeOrderId.value = orderId
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
  ordersStore.updateOrderStatus(response.orderId, response.newStatus as OrderStatus, response.note)
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
