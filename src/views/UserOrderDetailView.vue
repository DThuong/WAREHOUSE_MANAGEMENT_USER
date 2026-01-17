<template>
  <UserLayout>
    <div class="order-detail-page animate-fade-in">
      <div v-if="!order" class="loading-state">
        <Loader2 class="h-12 w-12 animate-spin text-blue-500" />
        <p class="text-blue-600">Đang tải...</p>
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
                Quay lại Orders
              </Button>
              <Badge 
                :variant="getStatusVariant(order.status)"
                class="border-none px-4 py-2 shadow-lg text-center status-tag-large"
                :style="getStatusStyle(order.status)"
              >
                {{ getStatusLabel(order.status) }}
              </Badge>
            </div>

            <div class="header-main">
              <div>
                <h1 class="order-title">Order {{ order.orderNumber }}</h1>
                <p class="order-meta">Ngày Tạo: {{ formatDate(order.date) }}</p>
              </div>

              <Button 
                v-if="order.status === 'pending'"
                variant="secondary"
                class="cursor-pointer transition-all duration-200 hover:scale-105 cancel-btn"
                @click="handleCancelOrder"
              >
                <X class="mr-2 h-4 w-4" />
                Hủy Order
              </Button>
            </div>
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
                v-for="item in order.items" 
                :key="item.id"
                class="order-item"
              >
                <img :src="item.image" :alt="item.name" class="item-image" />
                <div class="item-details">
                  <h3 class="item-name">{{ item.name }}</h3>
                  <p class="item-description">{{ item.description }}</p>
                  <Badge variant="secondary" class="item-category">
                    {{ item.category }}
                  </Badge>
                </div>
                <div class="item-pricing">
                  <div class="item-quantity">Số lượng: {{ item.quantity }}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Notes -->
        <Card v-if="order.notes" class="notes-card border-none shadow-xl" style="background: linear-gradient(135deg, #FEF3C7 0%, #ffffff 100%);">
          <CardHeader>
            <CardTitle class="text-blue-900">Ghi Chú Đặc Biệt</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert class="border-yellow-300 bg-yellow-50">
              <AlertDescription class="text-gray-700">
                {{ order.notes }}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import type { Order } from '@/stores/orders'
import UserLayout from '@/components/UserLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  Check,
  Loader2
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const ordersStore = useOrdersStore()

const order = ref<Order | undefined>()

const statusTimeline = computed(() => {
  const status = order.value?.status || 'pending'
  
  return [
    {
      title: 'Đã Đặt',
      description: 'Đơn hàng đã được đặt thành công',
      icon: CheckCircle2,
      active: true,
      completed: true
    },
    {
      title: 'Chờ Duyệt',
      description: 'Đang chờ phê duyệt',
      icon: Clock,
      active: status === 'pending',
      completed: ['approved', 'completed'].includes(status)
    },
    {
      title: 'Đã Duyệt',
      description: 'Đơn hàng đã được phê duyệt',
      icon: ThumbsUp,
      active: status === 'approved',
      completed: ['completed'].includes(status)
    },
    {
      title: 'Hoàn Thành',
      description: 'Đơn hàng đã được giao',
      icon: Check,
      active: status === 'completed',
      completed: status === 'completed'
    }
  ]
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
  const labels: Record<string, string> = {
    pending: 'Chờ Duyệt',
    approved: 'Đã Duyệt',
    completed: 'Hoàn Thành',
    rejected: 'Đã Hủy'
  }
  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    approved: 'default',
    completed: 'default',
    rejected: 'destructive'
  }
  return variants[status] || 'default'
}

const getStatusStyle = (status: string): string => {
  const styles: Record<string, string> = {
    pending: 'background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); color: #92400E; border: 2px solid #F59E0B;',
    approved: 'background: linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%); color: #1E40AF; border: 2px solid #3B82F6;',
    completed: 'background: linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%); color: #065F46; border: 2px solid #10B981;',
    rejected: 'background: linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%); color: #991B1B; border: 2px solid #EF4444;'
  }
  return styles[status] || ''
}

const handleCancelOrder = () => {
  if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
    if (order.value) {
      ordersStore.cancelOrder(order.value.id)
      order.value.status = 'rejected'
    }
  }
}

onMounted(() => {
  ordersStore.loadOrders()
  const orderId = parseInt(route.params.id as string)
  order.value = ordersStore.getOrderById(orderId)
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
  margin: 0;
}

.cancel-btn {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
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