<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="md:max-w-lg bg-amber-100">
      <DialogHeader>
        <DialogTitle>Đặt lại đơn #{{ order?.id }}</DialogTitle>
        <DialogDescription>
          Các sản phẩm dưới đây sẽ được thêm vào giỏ hàng của bạn
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
        <div
          v-for="detail in order?.orderDetails"
          :key="detail.id"          
          class="flex items-center gap-3 p-3 rounded-lg"
          :class="detail.item?.stockQty === 0 ? 'bg-red-50 opacity-60' : 'bg-slate-50'"
        >
          <img
            :src="detail.item?.picture?.[0] || '/placeholder-image.jpg'"
            class="w-12 h-12 rounded-lg object-cover border"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">
              {{ detail.item?.eng?.partname || detail.item?.com?.name }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ detail.item?.eng?.description || detail.item?.com?.specifications }}
            </p>
            <p v-if="detail.item?.stockQty === 0" class="text-xs text-red-500 font-medium mt-0.5">
              Hết hàng
            </p>
            <p v-else-if="(detail.item?.stockQty ?? 0) < detail.orderQty" class="text-xs text-amber-500 font-medium mt-0.5">
              Chỉ còn {{ detail.item?.stockQty }} {{ detail.item?.unit }} (bạn đặt {{ detail.orderQty }})
            </p>
          </div>
          <div class="text-right">
            <Badge :variant="detail.item?.stockQty === 0 ? 'destructive' : 'secondary'">
              x{{ getActualQty(detail) }}
            </Badge>
            <p v-if="isInCart(detail.item.id) && detail.item?.stockQty > 0" class="text-xs text-amber-600 mt-1">
              +{{ getActualQty(detail) }} (đang có {{ getCartQty(detail.item.id) }})
            </p>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Thêm mới</span>
          <span class="font-medium">{{ newItemsCount }} vật tư</span>
        </div>
        <div v-if="mergeItemsCount > 0" class="flex justify-between">
          <span class="text-amber-600">Đã có trong giỏ (sẽ cộng thêm)</span>
          <span class="font-medium text-amber-600">{{ mergeItemsCount }} vật tư</span>
        </div>
        <div v-if="skippedItemsCount > 0" class="flex justify-between">
          <span class="text-red-500">Bỏ qua (hết hàng)</span>
          <span class="font-medium text-red-500">{{ skippedItemsCount }} vật tư</span>
        </div>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="$emit('update:open', false)">
          Hủy
        </Button>
        <Button
          class="bg-blue-600 hover:bg-blue-700 text-white"
          :disabled="availableDetails.length === 0"
          @click="confirm"
        >
          <ShoppingCart class="mr-2 h-4 w-4" />
          {{ availableDetails.length === 0 ? 'Tất cả đã hết hàng' : 'Thêm vào giỏ hàng' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { ShoppingCart } from 'lucide-vue-next'
import type { Order } from '@/types/order.types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  open: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirmed': []
}>()

const cartStore = useCartStore()

const isInCart = (itemId: number) =>        
  cartStore.items.some(i => i.id === itemId)

const getCartQty = (itemId: number) =>      
  cartStore.items.find(i => i.id === itemId)?.quantity ?? 0

const getActualQty = (detail: Order['orderDetails'][number]) => {
  if (!detail.item?.stockQty || detail.item.stockQty === 0) return 0
  return Math.min(detail.orderQty, detail.item.stockQty)
}

const availableDetails = computed(() =>
  props.order?.orderDetails?.filter(d =>
    d.item && d.item.stockQty > 0
  ) ?? []
)

const skippedItemsCount = computed(() =>
  props.order?.orderDetails?.filter(d =>
    !d.item || d.item.stockQty === 0
  ).length ?? 0
)

const newItemsCount = computed(() =>
  availableDetails.value.filter(d => !isInCart(d.item.id)).length
)

const mergeItemsCount = computed(() =>
  availableDetails.value.filter(d => isInCart(d.item.id)).length
)

const confirm = () => {
  if (!props.order?.orderDetails) return

  const availableItems = props.order.orderDetails
    .filter(d => d.item && d.item.stockQty > 0)
    .map(d => ({
      ...d,
      orderQty: Math.min(d.orderQty, d.item?.stockQty ?? d.orderQty)
    }))

  if (availableItems.length === 0) {
    emit('update:open', false)
    return
  }

  cartStore.reorderFromOrder(availableItems)
  emit('update:open', false)
  emit('confirmed')
}
</script>