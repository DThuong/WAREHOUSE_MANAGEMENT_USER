<template>
  <UserLayout>
    <div class="cart-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Giỏ Hàng</h1>
        <Button 
          variant="ghost"
          class="cursor-pointer bg-blue-200 hover:bg-blue-400"
          @click="router.push('/user/products')"
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          Tiếp Tục Chọn Vật Tư
        </Button>
      </div>

      <Card v-if="cartStore.isEmpty" class="empty-cart">
        <CardContent class="text-center p-16">
          <ShoppingCart class="empty-icon h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 class="text-2xl font-semibold mb-2">Chưa có vật tư nào trong giỏ hàng!</h2>
          <p class="text-muted-foreground mb-8">Hãy thêm vật tư vào giỏ hàng để tiếp tục</p>
          <Button 
            class="btn-secondary bg-blue-300 cursor-pointer hover:bg-blue-400"
            @click="router.push('/user/products')"
          >
            <ShoppingBag class="mr-2 h-4 w-4" />
            Chọn Vật Tư
          </Button>
        </CardContent>
      </Card>

      <div v-else class="cart-content">
        <!-- Cart Items -->
        <div class="cart-items space-y-6">
          <Card 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="cart-item"
          >
            <CardContent class="flex gap-6 p-6 items-center">
              <img 
                :src="item.picture?.[0] || '/placeholder-image.jpg'" 
                :alt="getItemName(item)" 
                class="item-image" 
              />

              <div class="item-details flex-1">
                <h3 class="item-name">{{ getItemName(item) }}</h3>
                <p class="item-description">{{ getItemDescription(item) }}</p>
                <div class="flex gap-2 mt-2">
                  <Badge variant="secondary" class="item-category">
                    {{ item.type }}
                  </Badge>
                  <Badge variant="outline">
                    {{ item.unit }}
                  </Badge>
                  <Badge variant="outline" v-if="item.stockQty">
                    Tồn kho: {{ item.stockQty }}
                  </Badge>
                </div>
              </div>

              <div class="item-controls">
                <div class="quantity-control">
                  <!-- Giảm -->
                  <Button
                    variant="ghost"
                    size="icon"
                    class="cursor-pointer h-8 w-8 hover:bg-blue-50"
                    @click="updateQuantity(item.id!, -1)"
                  >
                    <Minus class="h-4 w-4" />
                  </Button>

                  <!-- Input số lượng -->
                  <span class="quantity">
                    <input
                      type="number"
                      min="1"
                      :value="getLocalQuantity(item.id!)"
                      @input="handleQuantityInput(item.id!, Number(($event.target as HTMLInputElement).value))"
                      @blur="commitQuantityChange(item.id!)"
                      @keyup.enter="($event.target as HTMLInputElement).blur()"
                      class="w-20 text-center border border-slate-200 rounded-lg py-1 px-2 outline-none bg-transparent"
                    />
                  </span>

                  <!-- Tăng -->
                  <Button
                    variant="ghost"
                    size="icon"
                    class="cursor-pointer h-8 w-8 hover:bg-blue-50"
                    @click="updateQuantity(item.id!, 1)"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </div>


                <Button 
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:text-destructive"
                  @click="removeItem(item.id!)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Cart Summary -->
        <Card class="cart-summary">
          <CardHeader>
            <CardTitle class="summary-title">Thông Tin Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="summary-rows space-y-4">
              <div class="summary-row">
                <span>Tổng số vật tư</span>
                <span class="summary-value">{{ cartStore.totalItems }}</span>
              </div>
              <div class="summary-row">
                <span>Số loại vật tư</span>
                <span class="summary-value">{{ cartStore.items.length }}</span>
              </div>
              <Separator />
            </div>

            <div class="form-group space-y-2">
              <Label for="nameWorker" class="form-label">Tên người order <span class="text-red-500">*</span></Label>
              <Input 
                id="nameWorker"
                v-model="nameWorker"
                placeholder="Nhập tên người order vật tư..."
                :class="{ 'border-red-500': showNameError }"
              />
              <p v-if="showNameError" class="text-sm text-red-500">Vui lòng nhập tên người order</p>
            </div>

            <Button 
              class="btn-checkout w-full"
              :disabled="orderStore.loading"
              @click="placeOrder"
            >
              <Check v-if="!orderStore.loading" class="mr-2 h-4 w-4" />
              <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
              Tạo Đơn Hàng
            </Button>

            <Alert>
              <Info class="h-4 w-4" />
              <AlertDescription>
                Đơn hàng sẽ được gửi đi chờ phê duyệt từ quản lý
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  </UserLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'
import { orderAPI } from '@/services/orderAPI'
import { toast } from 'sonner'
import UserLayout from '@/components/UserLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  ShoppingCart,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Check,
  Info,
  Loader2
} from 'lucide-vue-next'

interface CartItem {
  id?: number
  quantity: number
  picture?: string[]
  type: string
  unit: string
  stockQty?: number
  eng?: {
    partname?: string
    description?: string
  }
  com?: {
    name?: string
    specifications?: string
  }
}

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const nameWorker = ref('')
const showNameError = ref(false)
const localQuantities = ref<Record<number, number>>({})

const initializeLocalQuantities = () => {
  cartStore.items.forEach(item => {
    if (item.id) {
      localQuantities.value[item.id] = item.quantity
    }
  })
}

initializeLocalQuantities()

const getLocalQuantity = (itemId: number) => {
  return localQuantities.value[itemId] ?? cartStore.items.find(i => i.id === itemId)?.quantity ?? 1
}

const getItemName = (item: CartItem): string => {
  return item.eng?.partname || item.com?.name || 'N/A'
}

const getItemDescription = (item: CartItem): string => {
  return item.eng?.description || item.com?.specifications || 'No description'
}

const handleQuantityInput = (itemId: number, newQuantity: number) => {
  if (newQuantity < 1) {
    removeItem(itemId)
  } else {
    localQuantities.value[itemId] = newQuantity
  }
}

const commitQuantityChange = (itemId: number) => {
  const newQuantity = localQuantities.value[itemId]
  if (newQuantity && newQuantity >= 1) {
    cartStore.updateQuantity(itemId, newQuantity)
  }
}

const updateQuantity = (itemId: number, delta: number) => {
  const currentQuantity = getLocalQuantity(itemId)
  const newQuantity = currentQuantity + delta
  
  if (newQuantity < 1) {
    removeItem(itemId)
    delete localQuantities.value[itemId]
  } else {
    localQuantities.value[itemId] = newQuantity
    cartStore.updateQuantity(itemId, newQuantity)
  }
}

const removeItem = (itemId: number) => {
  cartStore.removeFromCart(itemId)
  delete localQuantities.value[itemId]
  toast.success('Đã xóa vật tư khỏi giỏ hàng')
}
const placeOrder = async () => {
  // Validate name worker
  if (!nameWorker.value.trim()) {
    showNameError.value = true
    toast.error('Thiếu thông tin', {
      description: 'Vui lòng nhập tên người nhận',
    })
    return
  }

  showNameError.value = false
  orderStore.setLoading(true)

  try {
    const orderData = {
      nameWorker: nameWorker.value.trim(),
      itemIds: cartStore.getCartData()
    }

    const newOrder = await orderAPI.create(orderData)
    // Add to store
    orderStore.addOrder(newOrder)
    // Clear cart
    cartStore.clearCart()
    nameWorker.value = ''
    
    toast.success('Đặt hàng thành công!', {
      description: 'Đơn hàng của bạn đã được gửi đi chờ phê duyệt',
    })
    
    router.push('/user/orders')
  } catch (error) {
    console.error('Failed to place order:', error)
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo đơn hàng'
    toast.error('Đặt hàng thất bại', {
      description: errorMessage,
    })
  } finally {
    orderStore.setLoading(false)
  }
}
</script>
<style scoped>
.cart-page {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-family: 'Rubik', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
  border: 1px solid hsl(var(--border));
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

.item-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: 12px;
  padding: 0.25rem;
}

.quantity {
  font-weight: 600;
  font-size: 1.125rem;
  min-width: 40px;
  text-align: center;
}

.cart-summary {
  position: sticky;
  top: 100px;
}

.summary-title {
  font-family: 'Rubik', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
}

.summary-value {
  font-weight: 600;
  color: hsl(var(--foreground));
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.btn-checkout {
  background: #3c48f0;
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1.0625rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(60, 72, 240, 0.4);
  transition: all 0.3s ease;
}

.btn-checkout:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(60, 72, 240, 0.5);
}

.btn-checkout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-item > div {
    flex-direction: column;
    text-align: center;
  }

  .item-controls {
    width: 100%;
    align-items: center;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>