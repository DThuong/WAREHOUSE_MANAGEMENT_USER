<template>
  <UserLayout>
    <div class="orders-page space-y-6 animate-fade-in">
      <!-- Page Header -->
      <Card class="border-none shadow-lg" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);">
        <CardHeader class="space-y-4">
          <div>
            <CardTitle class="text-4xl font-bold font-rubik" style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              My Orders
            </CardTitle>
            <CardDescription class="text-lg mt-2" style="color: #6b7280;">
              Track and manage your order requests
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
              :style="selectedStatus === filter.value ? 'background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);' : 'border-color: #4988C4; color: #1C4D8D;'"
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
            <h2 class="text-2xl font-semibold font-rubik" style="color: #1f2937;">No orders found</h2>
            <p class="text-lg" style="color: #6b7280;">You haven't placed any orders yet</p>
          </div>
          <Button 
            size="lg"
            class="mt-4 border-none shadow-lg font-semibold text-white"
            style="background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);"
            @click="router.push('/user/products')"
          >
            <ShoppingBag class="mr-2 h-5 w-5" />
            Start Shopping
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
          <CardHeader class="space-y-3 pb-4" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%);">
            <div class="flex justify-between items-start">
              <div class="space-y-1">
                <CardTitle class="text-xl font-rubik" style="color: #1f2937;">
                  {{ order.orderNumber }}
                </CardTitle>
                <CardDescription class="flex items-center gap-1.5">
                  <Calendar class="h-3.5 w-3.5" />
                  {{ formatDate(order.date) }}
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
                <span class="font-medium">{{ order.items?.length || 0 }} items</span>
              </div>
              <div class="flex items-center gap-2" style="color: #6b7280;">
                <DollarSign class="h-4 w-4" style="color: #4988C4;" />
                <span class="font-semibold text-lg" style="color: #1C4D8D;">
                  ${{ order.totalAmount.toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Order Notes -->
            <div v-if="order.notes" class="flex gap-2 p-3 rounded-lg" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%); border: 2px solid #BDE8F5;">
              <MessageSquare class="h-4 w-4 flex-shrink-0 mt-0.5" style="color: #4988C4;" />
              <p class="text-sm leading-relaxed" style="color: #6b7280;">{{ order.notes }}</p>
            </div>
          </CardContent>

          <!-- Order Footer -->
          <CardFooter class="flex justify-between items-center pt-4 border-t" style="background: linear-gradient(135deg, #E8F4FA 0%, #ffffff 100%); border-color: #BDE8F5;">
            <Button 
              variant="ghost" 
              size="sm"
              class="hover:bg-blue-50 font-medium"
              style="color: #1C4D8D;"
            >
              View Details
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
            <Button 
              v-if="order.status === 'pending'"
              variant="ghost"
              size="sm"
              class="hover:bg-red-100 font-medium"
              style="color: #e05d5d;"
              @click.stop="cancelOrder(order.id)"
            >
              <X class="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import UserLayout from '@/components/UserLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Inbox, 
  ShoppingBag, 
  Calendar, 
  Package, 
  DollarSign, 
  MessageSquare, 
  ArrowRight, 
  X 
} from 'lucide-vue-next'

const router = useRouter()
const ordersStore = useOrdersStore()

const selectedStatus = ref<string>('all')

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' }
]

const filteredOrders = computed(() => {
  if (selectedStatus.value === 'all') {
    return ordersStore.orders
  }
  return ordersStore.orders.filter(order => order.status === selectedStatus.value)
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

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'bg-[#E8F4FA] text-[#4988C4] border-[#BDE8F5] font-medium',
    approved: 'bg-[#D4E8F5] text-[#1C4D8D] border-[#A5D8F0] font-medium',
    processing: 'bg-[#C3DCF2] text-[#0F2854] border-[#4988C4] font-medium',
    completed: 'bg-[#D4F4DD] text-[#2D8659] border-[#A8E6CF] font-medium',
    rejected: 'bg-[#FFE6E6] text-[#E05D5D] border-[#FFB3B3] font-medium'
  }
  return classes[status] || 'bg-slate-100 text-slate-800'
}

const viewOrderDetail = (orderId: number) => {
  router.push(`/user/orders/${orderId}`)
}

const cancelOrder = async (orderId: number) => {
  if (confirm('Are you sure you want to cancel this order?')) {
    ordersStore.cancelOrder(orderId)
  }
}

onMounted(() => {
  ordersStore.loadOrders()
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