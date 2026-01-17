<template>
  <UserLayout>
    <div class="order-detail-page animate-fade-in">
      <div v-if="!order" class="loading-state">
        <Loader2 class="h-12 w-12 animate-spin text-muted-foreground" />
        <p>Loading order details...</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Header -->
        <Card class="detail-header">
          <CardContent class="pt-6">
            <div class="header-top">
              <Button 
                variant="ghost"
                @click="router.push('/user/orders')"
              >
                <ArrowLeft class="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
              <Badge 
                :variant="getStatusVariant(order.status)"
                class="status-tag-large"
              >
                {{ getStatusLabel(order.status) }}
              </Badge>
            </div>

            <div class="header-main">
              <div>
                <h1 class="order-title">Order {{ order.orderNumber }}</h1>
                <p class="order-meta">Placed on {{ formatDate(order.date) }}</p>
              </div>

              <Button 
                v-if="order.status === 'pending'"
                variant="destructive"
                @click="handleCancelOrder"
              >
                <X class="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Order Status Timeline -->
        <Card class="timeline-card">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
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
        <Card class="items-card">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
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
                  <div class="item-quantity">Qty: {{ item.quantity }}</div>
                  <div class="item-price">${{ item.price.toFixed(2) }}</div>
                  <div class="item-total">${{ (item.price * item.quantity).toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <Separator class="my-6" />

            <div class="order-summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>${{ order.totalAmount.toFixed(2) }}</span>
              </div>
              <Separator />
              <div class="summary-row total">
                <span>Total</span>
                <span>${{ order.totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Notes -->
        <Card v-if="order.notes" class="notes-card">
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
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
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  Package, 
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
      title: 'Order Placed',
      description: 'Your order has been submitted',
      icon: CheckCircle2,
      active: true,
      completed: true
    },
    {
      title: 'Pending Approval',
      description: 'Waiting for admin approval',
      icon: Clock,
      active: status === 'pending',
      completed: ['approved', 'processing', 'completed'].includes(status)
    },
    {
      title: 'Approved',
      description: 'Order has been approved',
      icon: ThumbsUp,
      active: status === 'approved',
      completed: ['processing', 'completed'].includes(status)
    },
    {
      title: 'Processing',
      description: 'Order is being prepared',
      icon: Package,
      active: status === 'processing',
      completed: status === 'completed'
    },
    {
      title: 'Completed',
      description: 'Order has been delivered',
      icon: Check,
      active: status === 'completed',
      completed: status === 'completed'
    }
  ]
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

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

const handleCancelOrder = () => {
  if (confirm('Are you sure you want to cancel this order?')) {
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
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: hsl(var(--muted-foreground));
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
  padding: 0.5rem 1rem;
  font-weight: 600;
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
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
}

.order-meta {
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
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
  height: 2px;
  background: hsl(var(--border));
  transform: translateY(-50%);
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: hsl(var(--muted));
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  transition: all 0.3s ease;
  border: 2px solid hsl(var(--border));
}

.timeline-item.active .timeline-dot {
  background: var(--gradient-gold);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
}

.timeline-item.completed .timeline-dot {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: transparent;
}

.timeline-content {
  text-align: center;
  max-width: 150px;
}

.timeline-content h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0 0 0.25rem 0;
}

.timeline-content p {
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.order-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: 12px;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid hsl(var(--border));
}

.order-item:hover {
  background: hsl(var(--muted) / 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
  border: 1px solid hsl(var(--border));
}

.item-details {
  flex: 1;
}

.item-name {
  font-family: 'Rubik', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0 0 0.5rem 0;
}

.item-description {
  font-size: 0.9375rem;
  color: hsl(var(--muted-foreground));
  margin: 0 0 0.5rem 0;
}

.item-category {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.75rem;
}

.item-pricing {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-quantity {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.item-price {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.item-total {
  font-size: 1.25rem;
  font-weight: 700;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
}

.summary-row.total {
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.summary-row.total span:last-child {
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 1024px) {
  .timeline {
    flex-direction: column;
    gap: 2rem;
  }

  .timeline::before {
    left: 24px;
    right: auto;
    width: 2px;
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
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }
}
</style>