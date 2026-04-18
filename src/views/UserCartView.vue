<template>
  <UserLayout>
    <div class="cart-page animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <Button
          variant="ghost"
          class="cursor-pointer bg-blue-200 hover:bg-blue-400"
          @click="router.push('/user/products')"
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          Tiếp Tục Chọn Vật Tư
        </Button>
      </div>

      <Card v-if="cartStore.isEmpty" class="border-none">
        <CardContent class="text-center">
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
            class="cart-item border-none shadow-md"
          >
            <CardContent class="flex gap-6 p-6 items-start">
              <img
                :src="item.picture?.[0] || '/placeholder-image.jpg'"
                :alt="getItemName(item)"
                class="item-image"
              />

              <div class="item-details flex-1">
                <h3 class="item-name">{{ getItemName(item) }}</h3>
                <p class="item-description">{{ getItemDescription(item) }}</p>

                <div class="w-full flex gap-2 mt-2 md:justify-start items-center justify-center flex-wrap">
                  <Badge variant="secondary" class="item-category">{{ item.type }}</Badge>
                  <Badge variant="outline">{{ item.unit }}</Badge>
                  <Badge variant="outline" v-if="item.stockQty">Tồn kho: {{ item.stockQty }}</Badge>
                </div>

                <!-- Usage inputs -->
                <div class="usage-inputs">
                  <!-- Mục đích sử dụng -->
                  <div class="usage-field w-full!">
                    <label class="usage-field-label">
                      <Target class="h-3.5 w-3.5 text-blue-500" />
                      Mục đích sử dụng <span class="text-red-500">*</span>
                    </label>
                    <Input
                      v-model="item.note"
                      placeholder="Nhập mục đích sử dụng..."
                      class="usage-input border-blue-200 focus:border-blue-400 focus:ring-0 focus:outline-none"
                      :class="{ 'border-red-400!': showUsageError && !item.note?.trim() }"
                    />
                  </div>

                  <!-- Thời gian sử dụng -->
                  <div class="usage-field">
                    <label class="usage-field-label">
                      <Timer class="h-3.5 w-3.5 text-blue-500" />
                      Thời gian sử dụng <span class="text-red-500">*</span>
                    </label>
                    <div class="time-input-row">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        placeholder="Số"
                        :value="getTimeAmount(item.id!)"
                        @input="onTimeAmountInput(item.id!, Number(($event.target as HTMLInputElement).value))"
                        class="time-number-input"
                        :class="{ 'border-red-400': showUsageError && !item.timeUsed?.trim() }"
                      />
                      <div class="time-unit-tabs">
                        <button
                          v-for="opt in timeUnitOptions"
                          :key="opt.value"
                          type="button"
                          class="time-unit-btn"
                          :class="{ active: getTimeUnit(item.id!) === opt.value }"
                          @click="onTimeUnitClick(item.id!, opt.value)"
                        >
                          {{ opt.label }}
                        </button>
                      </div>
                    </div>
                  </div>
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
                      class="w-20 text-center border border-slate-200 rounded-lg py-1 px-2 outline-none bg-transparent focus:border-blue-300"
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
                  class="text-destructive hover:text-destructive cursor-pointer hover:bg-red-100"
                  @click="removeItem(item.id!)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Cart Summary -->
        <Card class="cart-summary border-none shadow-xl" style="background: #f0f7ff;">
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
                class="border-none shadow-md"
                :class="{ 'border-red-500': showNameError }"
              />
              <p v-if="showNameError" class="text-sm text-red-500">Vui lòng nhập tên người order</p>
            </div>

            <Button
              class="btn-checkout w-full cursor-pointer"
              :disabled="orderStore.loading"
              @click="placeOrder"
            >
              <Check v-if="!orderStore.loading" class="mr-2 h-4 w-4" />
              <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
              Tạo Đơn Hàng
            </Button>

            <Alert class="border-none shadow-md">
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'
import { orderAPI } from '@/services/orderAPI'
import { toast } from 'vue-sonner'
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
  Loader2,
  Target,
  Timer
} from 'lucide-vue-next'

// ========================
// Types
// ========================
interface CartItemLocal {
  id?: number
  quantity: number
  note: string
  timeUsed: string
  picture?: string[]
  type: string
  unit: string
  stockQty?: number
  eng?: { partname?: string; description?: string }
  com?: { name?: string; specifications?: string }
}

// ========================
// Stores & Router
// ========================
const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

// ========================
// Form state
// ========================
const nameWorker = ref('')
const showNameError = ref(false)
const showUsageError = ref(false)

// ========================
// Time unit options
// ========================
const timeUnitOptions = [
  { label: 'Ngày', value: 'day' },
  { label: 'Tuần', value: 'week' },
  { label: 'Tháng', value: 'month' },
]

// ========================
// timeUsedLocal: lưu { amount, unit } per item để render UI
// item.timeUsed trong store sẽ là string ghép "3 Tuần"
// ========================
interface TimeLocal { amount: number; unit: string }
const timeUsedLocal = ref<Record<number, TimeLocal>>({})

// Parse ngược string "3 Tuần" → { amount: 3, unit: 'week' } khi load
const parseTimeUsed = (timeUsed: string): TimeLocal => {
  if (!timeUsed) return { amount: 1, unit: 'day' }
  const parts = timeUsed.trim().split(' ')
  const amount = parseInt(parts[0] ?? '1') || 1
  const labelMap: Record<string, string> = { 'Ngày': 'day', 'Tuần': 'week', 'Tháng': 'month' }
  const unit = labelMap[parts[1] ?? 'day'] || 'day'
  return { amount, unit }
}

const getTimeAmount = (itemId: number): number => {
  return timeUsedLocal.value[itemId]?.amount ?? 1
}

const getTimeUnit = (itemId: number): string => {
  return timeUsedLocal.value[itemId]?.unit ?? 'day'
}

// Ghép string và lưu vào item.timeUsed trong store
const syncTimeUsed = (itemId: number) => {
  const local = timeUsedLocal.value[itemId]
  if (!local) return
  const unitLabel = timeUnitOptions.find(u => u.value === local.unit)?.label || 'Ngày'
  const item = cartStore.items.find(i => i.id === itemId)
  if (item) item.timeUsed = `${local.amount} ${unitLabel}`
}

const onTimeAmountInput = (itemId: number, value: number) => {
  if (!timeUsedLocal.value[itemId]) timeUsedLocal.value[itemId] = { amount: 1, unit: 'day' }
  timeUsedLocal.value[itemId].amount = value > 0 ? value : 1
  syncTimeUsed(itemId)
}

const onTimeUnitClick = (itemId: number, unit: string) => {
  if (!timeUsedLocal.value[itemId]) timeUsedLocal.value[itemId] = { amount: 1, unit }
  timeUsedLocal.value[itemId].unit = unit
  syncTimeUsed(itemId)
}

// ========================
// Quantity local
// ========================
const localQuantities = ref<Record<number, number>>({})

const getLocalQuantity = (itemId: number): number => {
  return localQuantities.value[itemId] ?? cartStore.items.find(i => i.id === itemId)?.quantity ?? 1
}

const handleQuantityInput = (itemId: number, newQuantity: number) => {
  localQuantities.value[itemId] = newQuantity
}

const commitQuantityChange = (itemId: number) => {
  const newQuantity = localQuantities.value[itemId]
  if (!newQuantity || newQuantity < 1) {
    localQuantities.value[itemId] = 1
    cartStore.updateQuantity(itemId, 1)
    toast.warning('Số lượng tối thiểu là 1')
    return
  }
  const item = cartStore.items.find(i => i.id === itemId)
  if (item?.stockQty && newQuantity > item.stockQty) {
    localQuantities.value[itemId] = item.stockQty
    cartStore.updateQuantity(itemId, item.stockQty)
    toast.warning(`Số lượng tối đa là ${item.stockQty} (tồn kho)`)
    return
  }
  cartStore.updateQuantity(itemId, newQuantity)
}

const updateQuantity = (itemId: number, delta: number) => {
  const currentQuantity = getLocalQuantity(itemId)
  const newQuantity = currentQuantity + delta
  if (newQuantity < 1) return
  const item = cartStore.items.find(i => i.id === itemId)
  if (item?.stockQty && newQuantity > item.stockQty) {
    toast.warning(`Số lượng tối đa là ${item.stockQty} (tồn kho)`)
    return
  }
  localQuantities.value[itemId] = newQuantity
  cartStore.updateQuantity(itemId, newQuantity)
}

const removeItem = (itemId: number) => {
  cartStore.removeFromCart(itemId)
  delete localQuantities.value[itemId]
  delete timeUsedLocal.value[itemId]
}

// ========================
// Helpers
// ========================
const getItemName = (item: CartItemLocal): string => {
  return item.eng?.partname || item.com?.name || 'N/A'
}

const getItemDescription = (item: CartItemLocal): string => {
  return item.eng?.description || item.com?.specifications || 'No description'
}

// ========================
// Place Order
// ========================
const placeOrder = async () => {
  // Prevent spam clicks
  if (orderStore.loading) return
  if (cartStore.isEmpty) return

  // ── Validate tên người order ──
  if (!nameWorker.value.trim()) {
    showNameError.value = true
    toast.error('Thiếu tên người order', {
      description: 'Vui lòng nhập tên người order vật tư',
    })
    return
  }
  showNameError.value = false

  // ── Validate từng item ──
  const missingNote = cartStore.items.filter(item => !item.note?.trim())
  const missingTime = cartStore.items.filter(item => !item.timeUsed?.trim())

  if (missingNote.length > 0 || missingTime.length > 0) {
    showUsageError.value = true

    // Tên item để hiển thị trong toast
    const getItemLabel = (item: CartItemLocal) =>
      item.eng?.partname || item.com?.name || `ID ${item.id}`

    if (missingNote.length > 0) {
      toast.error('Thiếu mục đích sử dụng', {
        description: missingNote.map(getItemLabel).join(', '),
      })
    }

    if (missingTime.length > 0) {
      toast.error('Thiếu thời gian sử dụng', {
        description: missingTime.map(getItemLabel).join(', '),
      })
    }

    return
  }

  showUsageError.value = false

  // ── Call API ──
  orderStore.setLoading(true)
  try {
    const orderData = {
      nameWorker: nameWorker.value.trim(),
      itemIds: cartStore.getCartData(),
    }

    const newOrder = await orderAPI.create(orderData)

    if (!newOrder?.id) {
      toast.error('Lỗi', { description: 'Server không trả về đơn hàng hợp lệ' })
      return
    }

    orderStore.addOrder(newOrder)
    cartStore.clearCart()
    nameWorker.value = ''

    toast.success('Đặt hàng thành công!')
    setTimeout(() => {
      router.push('/user/orders')
    }, 3000);
  } catch (error) {
    toast.error('Đặt hàng thất bại', {
      description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
    })
  } finally {
    orderStore.setLoading(false)
  }
}

// watch
watch(
  () => cartStore.items,
  (newItems) => {
    const currentIds = new Set(newItems.map(i => i.id).filter(Boolean))

    // Cleanup
    Object.keys(timeUsedLocal.value).forEach(key => {
      if (!currentIds.has(Number(key))) delete timeUsedLocal.value[Number(key)]
    })
    Object.keys(localQuantities.value).forEach(key => {
      if (!currentIds.has(Number(key))) delete localQuantities.value[Number(key)]
    })

    // Init
    newItems.forEach(item => {
      if (!item.id) return

      // ── timeUsed ──
      if (!timeUsedLocal.value[item.id]) {
        // Item mới: parse từ store hoặc dùng default "1 Ngày"
        const parsed = parseTimeUsed(item.timeUsed)
        timeUsedLocal.value[item.id] = parsed

        // Sync ngược vào store ngay nếu chưa có giá trị
        if (!item.timeUsed?.trim()) {
          const unitLabel = timeUnitOptions.find(u => u.value === parsed.unit)?.label || 'Ngày'
          item.timeUsed = `${parsed.amount} ${unitLabel}` // "1 Ngày"
        }
      } else {
        // Item đã có local (reorder case): store timeUsed khác → cập nhật local
        const local = timeUsedLocal.value[item.id!]
        if (!local) return
        const unitLabel = timeUnitOptions.find(u => u.value === local.unit)?.label ?? 'Ngày'
        const expectedString = `${local.amount} ${unitLabel}`
        if (item.timeUsed && item.timeUsed !== expectedString) {
          timeUsedLocal.value[item.id!] = parseTimeUsed(item.timeUsed)
        }
      }
    })
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>

input:focus,
.usage-input:focus {
  outline: none !important;
  box-shadow: none !important;
}

.cart-page {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  margin-top: 1rem;
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
  flex-shrink: 0;
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

/* Usage inputs */
.usage-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: 0.875rem;
  width: 100%;
}

.usage-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.usage-field-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1C4D8D;
}

.usage-input {
  font-size: 0.875rem;
  height: 2.25rem;
  background: white;
}

.time-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.time-number-input {
  width: 72px;
  height: 2.25rem;
  border: 1px solid #BDE8F5;
  border-radius: 8px;
  padding: 0 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  background: white;
  outline: none;
  transition: border-color 0.2s;
}

.time-number-input:focus {
  border-color: #4988C4;
}

.time-unit-tabs {
  display: flex;
  gap: 0.25rem;
  background: white;
  border: 1px solid #BDE8F5;
  border-radius: 8px;
  padding: 0.2rem;
}

.time-unit-btn {
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #64748B;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.time-unit-btn.active {
  background: linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%);
  color: white;
  box-shadow: 0 2px 6px rgba(28, 77, 141, 0.3);
}

.time-unit-btn:hover:not(.active) {
  background: #EFF6FF;
  color: #1C4D8D;
}

/* Hide number spinners */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

/* ── Tablet (≤ 1024px) ── */
@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  .cart-summary {
    position: static;
  }
}

/* ── Mobile (≤ 640px) ── */
@media (max-width: 640px) {
  .page-header {
    padding-top: 0.5rem;
  }
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  /* Card body xếp dọc */
  .cart-item .flex.gap-6 {
    flex-direction: column;
    gap: 1rem;
  }

  .item-image {
    width: 100%;
    height: 180px;
  }

  .item-details {
    width: 100%;
    text-align: left;
  }

  /* Badges căn trái */
  .item-details .flex.gap-2 {
    justify-content: flex-start !important;
  }

  /* Controls nằm ngang full width */
  .item-controls {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .quantity-control {
    flex: 1;
  }

  /* Time input wrap */
  .time-input-row {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .time-number-input {
    width: 80px;
  }

  /* Tab đơn vị trải đều */
  .time-unit-tabs {
    flex: 1;
    justify-content: space-between;
  }

  .time-unit-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
