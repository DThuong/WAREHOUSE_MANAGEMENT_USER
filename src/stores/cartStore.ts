// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Item } from '@/types/item.types'
import type { OrderDetail } from '@/types/order.types'

export interface CartItem extends Item {
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])

  // Getters
  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  // Actions

    // Actions
  const isInCart = (itemId: number): boolean => { 
    return items.value.some(i => i.id === itemId)
  }
  const addToCart = (item: Item, quantity: number = 1) => {
    const existingItem = items.value.find(i => i.id === item.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({ ...item, quantity })
    }
  }

  const updateQuantity = (itemId: number, quantity: number) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      item.quantity = quantity
    }
  }

  const removeFromCart = (itemId: number) => {
    items.value = items.value.filter(i => i.id !== itemId)
  }

  const clearCart = () => {
    items.value = []
  }

  const getCartData = () => {
    return items.value.map(item => ({
      itemId: item.id!,
      orderQty: item.quantity
    }))
  }

  const reorderFromOrder = (orderDetails: OrderDetail[]): { addedCount: number; mergedCount: number } => {
  let addedCount = 0
  let mergedCount = 0

  orderDetails.forEach(detail => {
    if (!detail.item) return

    const existingItem = items.value.find(i => i.id === detail.item.id)

    if (existingItem) {
      existingItem.quantity += detail.orderQty
      mergedCount++
    } else {
      items.value.push({
        ...detail.item,
        quantity: detail.orderQty
      } as CartItem)
      addedCount++
    }
  })

  return { addedCount, mergedCount }
}

  return {
    items,
    totalItems,
    isEmpty,
    addToCart,
    isInCart,
    updateQuantity,
    removeFromCart,
    reorderFromOrder,
    clearCart,
    getCartData
  }
}, {
  persist: true
})