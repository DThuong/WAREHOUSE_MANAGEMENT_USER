<template>
  <UserLayout>
    <div class="cart-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Shopping Cart</h1>
        <Button 
          variant="ghost"
          @click="router.push('/user/products')"
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
      </div>

      <Card v-if="cartStore.items.length === 0" class="empty-cart">
        <CardContent class="text-center p-16">
          <ShoppingCart class="empty-icon h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 class="text-2xl font-semibold mb-2">Chưa có vật tư nào dược order !!!</h2>
          <p class="text-muted-foreground mb-8">Thêm vật tư vào giỏ hàng</p>
          <Button 
            class="btn-secondary bg-blue-300 cursor-pointer hover:bg-blue-400"
            @click="router.push('/user/products')"
          >
            <ShoppingBag class="mr-2 h-4 w-4" />
            Browse Products
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
              <img :src="item.image" :alt="item.name" class="item-image" />

              <div class="item-details flex-1">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                <Badge variant="secondary" class="item-category">
                  {{ item.category }}
                </Badge>
              </div>

              <div class="item-controls">
                <div class="quantity-control">
                  <Button 
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    @click="updateQuantity(item.id, item.quantity - 1)"
                  >
                    <Minus class="h-4 w-4" />
                  </Button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <Button 
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8"
                    @click="updateQuantity(item.id, item.quantity + 1)"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </div>

                <div class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</div>

                <Button 
                  variant="ghost"
                  size="icon"
                  class="text-destructive hover:text-destructive"
                  @click="removeItem(item.id)"
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
            <CardTitle class="summary-title">Order Summary</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="summary-rows space-y-4">
              <div class="summary-row">
                <span>Subtotal</span>
                <span class="summary-value">${{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Items</span>
                <span class="summary-value">{{ cartStore.totalItems }}</span>
              </div>
              <Separator />
              <div class="summary-row total-row">
                <span>Total</span>
                <span class="total-value">${{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <div class="form-group space-y-2">
              <Label for="notes" class="form-label">Special Instructions</Label>
              <Textarea 
                id="notes"
                v-model="orderNotes"
                placeholder="Add any special instructions..."
                :rows="3"
                class="resize-y"
              />
            </div>

            <Button 
              class="btn-checkout w-full"
              :disabled="loading"
              @click="placeOrder"
            >
              <Check v-if="!loading" class="mr-2 h-4 w-4" />
              <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
              Place Order
            </Button>

            <Alert>
              <Info class="h-4 w-4" />
              <AlertDescription>
                No payment required - order will be sent for approval
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
import { useCartStore } from '@/stores/carts'
import { useOrdersStore } from '@/stores/orders'
import UserLayout from '@/components/UserLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const router = useRouter()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()

const orderNotes = ref('')
const loading = ref(false)

const updateQuantity = (productId: number, newQuantity: number) => {
  if (newQuantity < 1) {
    removeItem(productId)
  } else {
    cartStore.updateQuantity(productId, newQuantity)
  }
}

const removeItem = (productId: number) => {
  cartStore.removeFromCart(productId)
}

const placeOrder = async () => {
  loading.value = true

  try {
    await ordersStore.createOrder(cartStore.items, orderNotes.value)
    cartStore.clearCart()
    orderNotes.value = ''
    
    router.push('/user/orders')
  } catch (error) {
    console.error('Failed to place order:', error)
  } finally {
    loading.value = false
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

.btn-premium {
  background: var(--gradient-gold);
  color: white;
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
  transition: all 0.3s ease;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
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

.item-price {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.total-row {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.total-value {
  font-size: 1.75rem;
  font-weight: 700;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.btn-checkout {
  background: var(--gradient-gold);
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1.0625rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
  transition: all 0.3s ease;
}

.btn-checkout:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
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