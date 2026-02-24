<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-lg">
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
          class="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
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
          </div>
          <div class="text-right">
            <Badge variant="secondary">x{{ detail.orderQty }}</Badge>
            <p v-if="isInCart(detail.item.id)" class="text-xs text-amber-600 mt-1">
                +{{ detail.orderQty }} (đang có {{ getCartQty(detail.item.id) }})
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
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" @click="$emit('update:open', false)">
          Hủy
        </Button>
        <Button
          class="bg-blue-600 hover:bg-blue-700 text-white"
          @click="confirm"
        >
          <ShoppingCart class="mr-2 h-4 w-4" />
          Thêm vào giỏ hàng
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

const newItemsCount = computed(() =>
  props.order?.orderDetails?.filter(d => !isInCart(d.item.id)).length ?? 0
)

const mergeItemsCount = computed(() =>
  props.order?.orderDetails?.filter(d => isInCart(d.item.id)).length ?? 0
)

const confirm = () => {
  if (!props.order?.orderDetails) return
  cartStore.reorderFromOrder(props.order.orderDetails)
  emit('update:open', false)
  emit('confirmed')
}
</script>