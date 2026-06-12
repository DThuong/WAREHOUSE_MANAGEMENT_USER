<template>
  <UserLayout>
    <div class="order-detail-page animate-fade-in">
      <div v-if="orderStore.loading" class="loading-state py-12">
        <AppLoading text="Đang tải thông tin chi tiết..." size="lg" />
      </div>

      <div v-else-if="!orderStore.currentOrder" class="loading-state">
        <AlertCircle class="h-12 w-12 text-red-500" />
        <p class="text-red-600">Không tìm thấy đơn hàng</p>
        <Button class="cursor-pointer" @click="handleBack">
          Quay lại danh sách
        </Button>
      </div>

      <div v-else class="space-y-6 mt-6">
        <!-- Header -->
        <Card
          class="border-none shadow-xl"
          style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);"
        >
          <CardContent class="pt-6">
            <div class="header-top">
              <Button
                variant="ghost"
                class="cursor-pointer text-gray-600 hover:text-blue-900 hover:bg-blue-300 transition-all duration-200 bg-blue-200"
                @click="handleBack"
              >
                <ArrowLeft class="h-4 w-4" />
                Quay lại
              </Button>

              <Badge
                :variant="getStatusVariant(orderStore.currentOrder.status)"
                class="border-none! px-3! py-1.5! shadow-lg text-center text-sm! status-tag-large"
                :style="getStatusStyle(orderStore.currentOrder.status)"
              >
                {{ getStatusLabel(orderStore.currentOrder.status) }}
              </Badge>
            </div>

            <div class="header-main">
              <div>
                <h1 class="order-title">Đơn hàng #{{ orderStore.currentOrder.id }}</h1>
                <p class="order-meta">
                  Ngày Tạo: {{ formatDate(orderStore.currentOrder.orderDate) }}
                </p>
                <p class="order-meta">
                  Người Nhận: {{ orderStore.currentOrder.nameWorker }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Rejected Reason -->
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
        <Card
          class="timeline-card border-none shadow-xl"
          style="background: linear-gradient(135deg, #F0F9FF 0%, #ffffff 100%);"
        >
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
        <Card
          class="items-card border-none shadow-xl"
          style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);"
        >
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
                  :src="getItemImageUrl(detail.item.picture?.[0])"
                  :alt="getItemName(detail.item)"
                  class="item-image"
                />

                <div class="item-details">
                  <h3 class="item-name">{{ getItemName(detail.item) }}</h3>

                  <p class="item-description">
                    {{ getItemDescription(detail.item) }}
                  </p>

                  <div class="flex gap-2 mt-2 flex-wrap md:justify-start lg:justify-start justify-center">
                    <Badge
                      variant="secondary"
                      class="item-category"
                      :class="detail.item.type === 'ENG' ? 'item-category-eng' : 'item-category-com'"
                    >
                      {{ getItemTypeLabel(detail.item.type) }}
                    </Badge>

                    <Badge variant="outline">
                      {{ detail.item.unit }}
                    </Badge>
                  </div>

                  <!-- Mục đích / vị trí / máy / thời gian -->
                  <div class="item-usage-info">
                    <div class="usage-row">
                      <span class="usage-label">
                        <Target class="h-3.5 w-3.5" />
                        Mục đích
                      </span>
                      <span class="usage-value">
                        {{ detail.note || '—' }}
                      </span>
                    </div>

                    <div class="usage-row">
                      <span class="usage-label">
                        <MapPin class="h-3.5 w-3.5" />
                        Vị trí
                      </span>
                      <span class="usage-value usage-value-strong">
                        {{ getMachineLineLabel(detail as OrderDetailLocal) }}
                      </span>
                    </div>

                    <div class="usage-row">
                      <span class="usage-label">
                        <Cpu class="h-3.5 w-3.5" />
                        Máy
                      </span>
                      <span
                        class="usage-value"
                        :class="{ 'usage-value-muted': !detail.machineId }"
                      >
                        {{ getMachineLabel(detail as OrderDetailLocal) }}
                      </span>
                    </div>

                    <div class="usage-row">
                      <span class="usage-label">
                        <Timer class="h-3.5 w-3.5" />
                        Thời gian dùng
                      </span>
                      <span class="usage-value">
                        {{ detail.timeUsed || '—' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="item-pricing">
                  <div class="item-quantity">
                    Số lượng: {{ detail.orderQty }}
                  </div>
                  <div class="item-price">
                    {{ formatPrice(detail.item.price) }}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Images -->
        <Card
          v-if="orderStore.currentOrder.image?.length > 0"
          class="border-none shadow-xl"
        >
          <CardHeader>
            <CardTitle class="text-blue-900">Hình Ảnh Đơn Hàng</CardTitle>
          </CardHeader>

          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="(img, index) in orderStore.currentOrder.image"
                :key="index"
                class="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-blue-200 h-40"
                @click="openImagePreview(index)"
              >
                <img
                  :src="getItemImageUrl(img)"
                  alt="Order image"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Eye class="text-white w-8 h-8 drop-shadow-md" />
                </div>
              </div>
            </div>

            <ImagePreviewViewer
              v-model:open="previewOpen"
              :images="fullImageUrls"
              :initial-index="previewInitialIndex"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Component } from 'vue'

import { useOrderStore } from '@/stores/orderStore'
import { orderAPI } from '@/services/orderAPI'
import { getItemImageUrl } from '@/utils/imageUtils'
import { OrderStatus } from '@/types/order.types'
import { toast } from 'vue-sonner'

import UserLayout from '@/components/UserLayout.vue'
import AppLoading from '@/components/AppLoading.vue'
import ImagePreviewViewer from '@/components/ImagePreviewViewer.vue'

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
  AlertCircle,
  Target,
  Timer,
  Eye,
  MapPin,
  Cpu,
} from 'lucide-vue-next'

// ========================
// Local Types
// ========================
interface LineLocal {
  id?: number
  lineName?: string | null
  areaPart?: string | null
}

interface MachineLocal {
  id?: number
  machineName?: string | null
  lineId?: number | null

  // Đúng theo type của bạn: machine bên trong orderDetail có object line
  line?: LineLocal | null

  // Một số API có thể trả lineName riêng
  lineName?: string | null
}

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

interface OrderDetailLocal {
  id: number
  orderId: number
  itemId: number
  orderQty: number
  item: ItemData
  note?: string | null
  timeUsed?: string | null
  machineId?: number | null
  machine?: MachineLocal | null
}

interface TimelineStage {
  title: string
  description: string
  icon: Component
  active: boolean
  completed: boolean
}

// ========================
// Stores & Router
// ========================
const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

// ========================
// Preview State
// ========================
const previewOpen = ref(false)
const previewInitialIndex = ref(0)

const fullImageUrls = computed(() => {
  return orderStore.currentOrder?.image?.map((img) => getItemImageUrl(img)) || []
})

const openImagePreview = (index: number) => {
  previewInitialIndex.value = index
  previewOpen.value = true
}

// ========================
// Timeline
// ========================
const statusTimeline = computed<TimelineStage[]>(() => {
  const status = orderStore.currentOrder?.status || OrderStatus.PENDING

  return [
    {
      title: 'Đã Đặt',
      description: 'Đơn hàng đã được tạo thành công',
      icon: CheckCircle2,
      active: true,
      completed: true,
    },
    {
      title: 'Chờ Duyệt',
      description: 'Đang chờ quản lý phê duyệt',
      icon: Clock,
      active: status === OrderStatus.PENDING,
      completed: [OrderStatus.APPROVED, OrderStatus.COMPLETED].includes(status as OrderStatus),
    },
    {
      title: 'Đã Duyệt',
      description: 'Đơn hàng đã được phê duyệt',
      icon: ThumbsUp,
      active: status === OrderStatus.APPROVED,
      completed: status === OrderStatus.COMPLETED,
    },
    {
      title: 'Hoàn Thành',
      description: 'Đơn hàng đã hoàn tất',
      icon: Check,
      active: status === OrderStatus.COMPLETED,
      completed: status === OrderStatus.COMPLETED,
    },
  ]
})

// ========================
// Item Helpers
// ========================
const getItemName = (item: ItemData): string => {
  return item.eng?.partname || item.com?.name || 'N/A'
}

const getItemDescription = (item: ItemData): string => {
  return item.eng?.description || item.com?.specifications || 'No description'
}

const getItemTypeLabel = (type: string): string => {
  if (type === 'ENG') return 'Hàng Kỹ Thuật'
  if (type === 'COM') return 'Hàng Tiêu Dùng'
  return type || '—'
}

const getMachineLineLabel = (detail: OrderDetailLocal): string => {
  const machine = detail.machine

  if (!machine) return '—'

  const line = machine.line

  const areaPart = line?.areaPart?.trim() || ''
  const lineName = line?.lineName?.trim() || machine.lineName?.trim() || ''

  if (areaPart && lineName) return `${areaPart} - ${lineName}`
  if (lineName) return lineName
  if (areaPart) return areaPart
  if (machine.lineId) return `Vị trí ID ${machine.lineId}`

  return '—'
}

const getMachineLabel = (detail: OrderDetailLocal): string => {
  if (!detail.machineId || !detail.machine) {
    return 'Không có máy'
  }

  return detail.machine.machineName?.trim() || `Máy ID ${detail.machineId}`
}

// ========================
// Format Helpers
// ========================
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)

  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPrice = (price?: string | number): string => {
  if (price === null || price === undefined || price === '') return 'Chưa có giá'

  const numericPrice = typeof price === 'number' ? price : Number.parseFloat(price)

  if (Number.isNaN(numericPrice)) {
    return String(price)
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numericPrice)
}

// ========================
// Status Helpers
// ========================
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    [OrderStatus.PENDING]: 'Chờ Duyệt',
    [OrderStatus.APPROVED]: 'Đã Duyệt',
    [OrderStatus.COMPLETED]: 'Hoàn Thành',
    [OrderStatus.REJECTED]: 'Đã Hủy',
  }

  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [OrderStatus.PENDING]: 'outline',
    [OrderStatus.APPROVED]: 'default',
    [OrderStatus.COMPLETED]: 'default',
    [OrderStatus.REJECTED]: 'destructive',
  }

  return variants[status] || 'default'
}

const getStatusStyle = (status: string): string => {
  const styles: Record<string, string> = {
    [OrderStatus.PENDING]:
      'background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); color: #92400E; border: 2px solid #F59E0B;',
    [OrderStatus.APPROVED]:
      'background: linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%); color: #1E40AF; border: 2px solid #3B82F6;',
    [OrderStatus.COMPLETED]:
      'background: linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%); color: #065F46; border: 2px solid #10B981;',
    [OrderStatus.REJECTED]:
      'background: linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%); color: #991B1B; border: 2px solid #EF4444;',
  }

  return styles[status] || ''
}

// ========================
// Navigation
// ========================
const handleBack = () => {
  if (route.query.from === 'dashboard') {
    router.push('/user/dashboard')
  } else {
    router.push('/user/orders')
  }
}

// ========================
// Fetch Detail
// ========================
const fetchOrderDetail = async (orderId?: number): Promise<void> => {
  const id = orderId ?? Number.parseInt(route.params.id as string)

  if (Number.isNaN(id)) {
    toast.error('ID đơn hàng không hợp lệ')
    handleBack()
    return
  }

  orderStore.setCurrentOrder(null)
  orderStore.setLoading(true)

  try {
    const order = await orderAPI.getById(id)
    orderStore.setCurrentOrder(order)
  } catch {
    toast.error('Đơn hàng này không tồn tại hoặc đã bị xóa')
    handleBack()
  } finally {
    orderStore.setLoading(false)
  }
}

// ========================
// Lifecycle
// ========================
onMounted(async () => {
  if (!signalRService.isConnected()) {
    await signalRService.start()
  }

  signalRService.on('OrderStatusUpdated', (response: updateStatusRealtime) => {
    if (orderStore.currentOrder && orderStore.currentOrder.id === response.orderId) {
      orderStore.updateOrderStatus(
        response.orderId,
        response.newStatus as OrderStatus,
        response.note,
      )

      toast.success('Cập nhật trạng thái', {
        description: `Đơn hàng #${response.orderId} → ${getStatusLabel(response.newStatus)}`,
        duration: 5000,
      })
    }
  })
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchOrderDetail(Number.parseInt(newId as string))
    }
  },
  { immediate: true },
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
  background: linear-gradient(135deg, #0f2854 0%, #1c4d8d 100%);
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
  background: linear-gradient(90deg, #bde8f5 0%, #4988c4 100%);
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
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.3s ease;
  border: 3px solid #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.timeline-item.active .timeline-dot {
  background: linear-gradient(135deg, #1c4d8d 0%, #4988c4 100%);
  color: white;
  border-color: #4988c4;
  box-shadow: 0 8px 24px rgba(73, 136, 196, 0.4);
  transform: scale(1.1);
}

.timeline-item.completed .timeline-dot {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.timeline-content {
  text-align: center;
  max-width: 150px;
}

.timeline-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.timeline-content p {
  font-size: 0.875rem;
  color: #64748b;
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
  border: 2px solid #bde8f5;
  box-shadow: 0 2px 8px rgba(73, 136, 196, 0.1);
}

.order-item:hover {
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(73, 136, 196, 0.2);
  border-color: #4988c4;
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
  border: 2px solid #bde8f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-family: 'Rubik', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f2854;
  margin: 0 0 0.5rem 0;
  line-height: 1.35;
}

.item-description {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0 0 0.75rem 0;
  line-height: 1.45;
}

.item-category {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
}

.item-category-eng {
  background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.item-category-com {
  background: linear-gradient(135deg, #dcfce7 0%, #86efac 100%);
  color: #166534;
  border: 1px solid #22c55e;
}

.item-pricing {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.item-quantity {
  font-size: 1rem;
  font-weight: 600;
  color: #1c4d8d;
  background: linear-gradient(135deg, #e8f4fa 0%, #bde8f5 100%);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #4988c4;
}

.item-price {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.item-usage-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem 0.875rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f4fa 100%);
  border: 1px solid #bde8f5;
  border-radius: 10px;
}

.usage-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.usage-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #4988c4;
  font-weight: 700;
  min-width: 130px;
  flex-shrink: 0;
}

.usage-value {
  color: #1e293b;
  font-weight: 500;
  min-width: 0;
  word-break: break-word;
}

.usage-value-strong {
  color: #0f2854;
  font-weight: 800;
}

.usage-value-muted {
  color: #64748b;
  font-style: italic;
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
  .header-top {
    gap: 1rem;
    align-items: flex-start;
  }

  .header-main {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .order-title {
    font-size: 1.5rem;
  }

  .order-item {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
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

  .usage-row {
    text-align: left;
  }

  .usage-label {
    min-width: 110px;
  }

  .usage-value {
    text-align: left;
  }
}
</style>
