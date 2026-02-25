<template>
  <UserLayout>
    <div class="order-detail-page animate-fade-in">
      <div v-if="orderStore.loading" class="loading-state">
        <Loader2 class="h-12 w-12 animate-spin text-blue-500" />
        <p class="text-blue-600">Đang tải...</p>
      </div>

      <div v-else-if="!orderStore.currentOrder" class="loading-state">
        <AlertCircle class="h-12 w-12 text-red-500" />
        <p class="text-red-600">Không tìm thấy đơn hàng</p>
        <Button @click="router.push('/user/orders')">
          Quay lại danh sách
        </Button>
      </div>

      <div v-else class="space-y-6">
        <!-- Header -->
        <Card class="border-none shadow-xl" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);">
          <CardContent class="pt-6">
            <div class="header-top">
              <Button 
                variant="ghost"
                class="cursor-pointer text-gray-600 hover:text-blue-900 hover:bg-blue-300 transition-all duration-200 bg-blue-200"
                @click="router.push('/user/orders')"
              >
                <ArrowLeft class="h-4 w-4" />
                Quay lại Đơn Hàng
              </Button>
              <Badge 
                :variant="getStatusVariant(orderStore.currentOrder.status)"
                class="border-none px-4 py-2 shadow-lg text-center status-tag-large"
                :style="getStatusStyle(orderStore.currentOrder.status)"
              >
                {{ getStatusLabel(orderStore.currentOrder.status) }}
              </Badge>
            </div>

            <div class="header-main">
              <div>
                <h1 class="order-title">Đơn hàng #{{ orderStore.currentOrder.id }}</h1>
                <p class="order-meta">Ngày Tạo: {{ formatDate(orderStore.currentOrder.orderDate) }}</p>
                <p class="order-meta">Người Nhận: {{ orderStore.currentOrder.nameWorker }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

                <Card 
        v-if="orderStore.currentOrder.status === OrderStatus.REJECTED && orderStore.currentOrder.note" 
        class="border-none shadow-xl"
        style="background: linear-gradient(135deg, #FEE2E2 0%, #ffffff 100%);"
      >
        <CardHeader>
          <CardTitle class="text-red-700 flex items-center gap-2">
            <AlertCircle class="h-5 w-5" />
            Lý Do Từ Chối
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-red-600 font-medium text-base leading-relaxed bg-red-50 border border-red-200 rounded-lg p-4">
            {{ orderStore.currentOrder.note }}
          </p>
        </CardContent>
      </Card>

        <!-- Order Status Timeline -->
        <Card class="timeline-card border-none shadow-xl" style="background: linear-gradient(135deg, #F0F9FF 0%, #ffffff 100%);">
          <CardHeader>
            <CardTitle class="text-blue-900">Trạng Thái Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="timeline">
              <div 
                v-for="(stage, index) in statusTimeline" 
                :key="index"
                class="timeline-item"
                :class="{ active: stage.active, completed: stage.completed }"
              >
                <div class="timeline-dot">
                  <component :is="stage.icon" class="h-5 w-5" />
                </div>
                <div class="timeline-content">
                  <h3>{{ stage.title }}</h3>
                  <p>{{ stage.description }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Items -->
        <Card class="items-card border-none shadow-xl" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);">
          <CardHeader>
            <CardTitle class="text-blue-900">Danh Sách Vật Tư</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="items-list">
              <div 
                v-for="detail in orderStore.currentOrder.orderDetails" 
                :key="detail.id"
                class="order-item"
              >
                <img 
                  :src="detail.item.picture?.[0] || '/placeholder-image.jpg'" 
                  :alt="getItemName(detail.item)" 
                  class="item-image" 
                />
                <div class="item-details">
                  <h3 class="item-name">{{ getItemName(detail.item) }}</h3>
                  <p class="item-description">{{ getItemDescription(detail.item) }}</p>
                  <div class="flex gap-2 mt-2">
                    <Badge variant="secondary" class="item-category">
                      {{ detail.item.type }}
                    </Badge>
                    <Badge variant="outline">
                      {{ detail.item.unit }}
                    </Badge>
                  </div>
                </div>
                <div class="item-pricing">
                  <div class="item-quantity">Số lượng: {{ detail.orderQty }}</div>
                  <div class="item-price">{{ detail.item.price }}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Images (if any) -->
        <Card v-if="orderStore.currentOrder.image?.length > 0" class="border-none shadow-xl">
          <CardHeader>
            <CardTitle class="text-blue-900">Hình Ảnh Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <img 
                v-for="(img, index) in orderStore.currentOrder.image" 
                :key="index"
                :src="img"
                alt="Order image"
                class="w-full h-40 object-cover rounded-lg border-2 border-blue-200"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'
import { orderAPI } from '@/services/orderAPI'
import { OrderStatus } from '@/types/order.types'
import { toast } from 'sonner'
import UserLayout from '@/components/UserLayout.vue'
import { signalRService } from '@/services/orderNotiService'
import type { updateStatusRealtime } from '@/types/notification.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  Check,
  Loader2,
  AlertCircle
} from 'lucide-vue-next'
import type { Component } from 'vue'

// Define proper types for item
interface ItemData {
  picture?: string[]
  type: string
  unit: string
  price?: string | number
  eng?: {
    partname?: string
    description?: string
  }
  com?: {
    name?: string
    specifications?: string
  }
}

// Define timeline stage type
interface TimelineStage {
  title: string
  description: string
  icon: Component
  active: boolean
  completed: boolean
}

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const statusTimeline = computed<TimelineStage[]>(() => {
  const status = orderStore.currentOrder?.status || OrderStatus.PENDING
  console.log('[Timeline] Current status:', status)
  
  return [
    {
      title: 'Đã Đặt',
      description: 'Đơn hàng đã được tạo thành công',
      icon: CheckCircle2,
      active: true,
      completed: true
    },
    {
      title: 'Chờ Duyệt',
      description: 'Đang chờ quản lý phê duyệt',
      icon: Clock,
      active: status === OrderStatus.PENDING,
      completed: [OrderStatus.APPROVED, OrderStatus.COMPLETED].includes(status as OrderStatus)
    },
    {
      title: 'Đã Duyệt',
      description: 'Đơn hàng đã được phê duyệt',
      icon: ThumbsUp,
      active: status === OrderStatus.APPROVED,
      completed: status === OrderStatus.COMPLETED
    },
    {
      title: 'Hoàn Thành',
      description: 'Đơn hàng đã hoàn tất',
      icon: Check,
      active: status === OrderStatus.COMPLETED,
      completed: status === OrderStatus.COMPLETED
    }
  ]
})

const getItemName = (item: ItemData): string => {
  return item.eng?.partname || item.com?.name || 'N/A'
}

const getItemDescription = (item: ItemData): string => {
  return item.eng?.description || item.com?.specifications || 'No description'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    [OrderStatus.PENDING]: 'Chờ Duyệt',
    [OrderStatus.APPROVED]: 'Đã Duyệt',
    [OrderStatus.COMPLETED]: 'Hoàn Thành',
    [OrderStatus.REJECTED]: 'Đã Hủy'
  }
  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [OrderStatus.PENDING]: 'outline',
    [OrderStatus.APPROVED]: 'default',
    [OrderStatus.COMPLETED]: 'default',
    [OrderStatus.REJECTED]: 'destructive'
  }
  return variants[status] || 'default'
}

const getStatusStyle = (status: string): string => {
  const styles: Record<string, string> = {
    [OrderStatus.PENDING]: 'background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); color: #92400E; border: 2px solid #F59E0B;',
    [OrderStatus.APPROVED]: 'background: linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%); color: #1E40AF; border: 2px solid #3B82F6;',
    [OrderStatus.COMPLETED]: 'background: linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%); color: #065F46; border: 2px solid #10B981;',
    [OrderStatus.REJECTED]: 'background: linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%); color: #991B1B; border: 2px solid #EF4444;'
  }
  return styles[status] || ''
}

const fetchOrderDetail = async (orderId?: number): Promise<void> => {
  const id = orderId ?? parseInt(route.params.id as string)
  
  if (isNaN(id)) {
    toast.error('ID đơn hàng không hợp lệ')
    router.push('/user/orders')
    return
  }

  orderStore.setCurrentOrder(null)
  orderStore.setLoading(true)
  try {
    const order = await orderAPI.getById(id)
    orderStore.setCurrentOrder(order)
  } catch {
    // Order không tồn tại hoặc đã bị xóa
    toast.error('Đơn hàng này không tồn tại hoặc đã bị xóa')
    router.push('/user/orders')
  } finally {
    orderStore.setLoading(false)
  }
}

onMounted(async () => {
  // 1. Kết nối SignalR
  if (!signalRService.isConnected()) {
    await signalRService.start()
  }
  
  // 3. Đăng ký listener cho SignalR
  signalRService.on('OrderStatusUpdated', (response: updateStatusRealtime) => {
    
    // Check nếu đúng order đang xem
    if (orderStore.currentOrder && orderStore.currentOrder.id === response.orderId) {
      
      // Update status trong store
      orderStore.updateOrderStatus(response.orderId, response.newStatus as OrderStatus, response.note)
      
      // Hiển thị toast notification
      toast.success('Cập nhật trạng thái', {
        description: `Đơn hàng #${response.orderId} → ${getStatusLabel(response.newStatus)}`,
        duration: 5000
      })
      
    }
  })
})

// Watch khi id thay đổi (navigate từ thông báo)
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchOrderDetail(parseInt(newId as string))
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  signalRService.off('OrderStatusUpdated')
})
</script>
<style scoped>
.order-detail-page {
  max-width: 1600px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-tag-large {
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  font-weight: 700;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-title {
  font-family: 'Rubik', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0F2854 0%, #1C4D8D 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
}

.order-meta {
  font-size: 1rem;
  color: #64748b;
  margin: 0.25rem 0;
}

.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 2rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #BDE8F5 0%, #4988C4 100%);
  transform: translateY(-50%);
  margin-top: -5px;
  border-radius: 2px;
}

.timeline-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.timeline-dot {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  transition: all 0.3s ease;
  border: 3px solid #CBD5E1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.timeline-item.active .timeline-dot {
  background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);
  color: white;
  border-color: #4988C4;
  box-shadow: 0 8px 24px rgba(73, 136, 196, 0.4);
  transform: scale(1.1);
}

.timeline-item.completed .timeline-dot {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border-color: #10B981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.timeline-content {
  text-align: center;
  max-width: 150px;
}

.timeline-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 0.25rem 0;
}

.timeline-content p {
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  align-items: center;
  transition: all 0.3s ease;
  border: 2px solid #BDE8F5;
  box-shadow: 0 2px 8px rgba(73, 136, 196, 0.1);
}

.order-item:hover {
  background: linear-gradient(135deg, #F0F9FF 0%, #ffffff 100%);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(73, 136, 196, 0.2);
  border-color: #4988C4;
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
  border: 2px solid #BDE8F5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-details {
  flex: 1;
}

.item-name {
  font-family: 'Rubik', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0F2854;
  margin: 0 0 0.5rem 0;
}

.item-description {
  font-size: 0.9375rem;
  color: #64748B;
  margin: 0 0 0.75rem 0;
}

.item-category {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%);
  color: #1E40AF;
  border: 1px solid #3B82F6;
  padding: 0.25rem 0.75rem;
}

.item-pricing {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-quantity {
  font-size: 1rem;
  font-weight: 600;
  color: #1C4D8D;
  background: linear-gradient(135deg, #E8F4FA 0%, #BDE8F5 100%);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #4988C4;
}

.item-price {
  font-size: 0.875rem;
  color: #64748B;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .timeline {
    flex-direction: column;
    gap: 2rem;
  }

  .timeline::before {
    left: 28px;
    right: auto;
    width: 3px;
    height: 100%;
    top: 0;
    transform: none;
  }

  .timeline-item {
    flex-direction: row;
    text-align: left;
  }

  .timeline-content {
    text-align: left;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .header-main {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .order-item {
    flex-direction: column;
    text-align: center;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }

  .item-pricing {
    text-align: center;
    width: 100%;
  }

  .item-quantity {
    width: 100%;
  }
}
</style>